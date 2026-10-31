import os
import hashlib
import secrets
import random
from datetime import datetime, timedelta
from typing import Optional, Tuple
from sqlalchemy.orm import Session

from app.models.db_models import User, ADMIN_EMAIL
from app.services.email_service import (
    send_verification_email,
    send_password_reset_email,
    send_welcome_professional_info_email
)

def hash_password(password: str, salt: Optional[str] = None) -> Tuple[str, str]:
    """Hashes password using PBKDF2-HMAC-SHA256 with 100,000 iterations and a cryptographically random salt."""
    if salt is None:
        salt = secrets.token_hex(16)
    
    key = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    )
    return key.hex(), salt


def verify_password(plain_password: str, password_hash: str, salt: str) -> bool:
    """Verifies plain password against stored PBKDF2 hash."""
    computed_hash, _ = hash_password(plain_password, salt)
    return secrets.compare_digest(computed_hash, password_hash)


def generate_otp_code() -> str:
    """Generates a secure 6-digit verification/reset code."""
    return f"{random.randint(100000, 999999)}"


def register_user(db: Session, name: str, email: str, password: str) -> Tuple[User, str, bool]:
    """
    Registers a new user or updates an unverified pending account.
    Returns: (user, otp_code, email_sent)
    """
    email_clean = email.strip().lower()
    existing_user = db.query(User).filter(User.email == email_clean).first()

    if existing_user and existing_user.is_verified:
        raise ValueError("An account with this email address already exists. Please log in.")

    # Generate 6-digit OTP code
    otp_code = generate_otp_code()
    expires_at = datetime.utcnow() + timedelta(minutes=15)
    
    # Hash password
    pwd_hash, salt = hash_password(password)

    # Determine role: adityareddy14623@gmail.com is permanently admin
    role = "admin" if email_clean == ADMIN_EMAIL.lower() else "farmer"

    if existing_user and not existing_user.is_verified:
        # Update existing unverified user
        existing_user.name = name.strip()
        existing_user.password_hash = pwd_hash
        existing_user.salt = salt
        existing_user.role = role
        existing_user.verification_code = otp_code
        existing_user.verification_code_expires_at = expires_at
        db.commit()
        db.refresh(existing_user)
        user = existing_user
    else:
        # Create new user record
        user = User(
            email=email_clean,
            name=name.strip(),
            password_hash=pwd_hash,
            salt=salt,
            role=role,
            is_verified=False,
            verification_code=otp_code,
            verification_code_expires_at=expires_at,
            created_at=datetime.utcnow()
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # Send OTP verification email
    email_sent = send_verification_email(user.email, user.name, otp_code)
    return user, otp_code, email_sent


def verify_user_code(db: Session, email: str, code: str) -> Tuple[User, bool]:
    """
    Validates 6-digit registration OTP code and activates account.
    Sends professional platform information email upon successful verification.
    """
    email_clean = email.strip().lower()
    user = db.query(User).filter(User.email == email_clean).first()

    if not user:
        raise ValueError("User account not found.")

    if user.is_verified:
        return user, True

    if not user.verification_code or user.verification_code != code.strip():
        raise ValueError("Invalid verification code. Please check and try again.")

    if user.verification_code_expires_at and datetime.utcnow() > user.verification_code_expires_at:
        raise ValueError("Verification code has expired. Please request a new code.")

    # Mark user as verified
    user.is_verified = True
    user.verification_code = None
    user.verification_code_expires_at = None
    user.last_login = datetime.utcnow()
    db.commit()
    db.refresh(user)

    # Send comprehensive professional guide email to the newly activated user!
    welcome_email_sent = send_welcome_professional_info_email(user.email, user.name)

    return user, welcome_email_sent


def resend_verification_code(db: Session, email: str) -> Tuple[str, bool]:
    """Resends a fresh 6-digit verification code."""
    email_clean = email.strip().lower()
    user = db.query(User).filter(User.email == email_clean).first()

    if not user:
        raise ValueError("User account not found.")

    if user.is_verified:
        raise ValueError("This account is already verified. Please proceed to login.")

    otp_code = generate_otp_code()
    user.verification_code = otp_code
    user.verification_code_expires_at = datetime.utcnow() + timedelta(minutes=15)
    db.commit()

    email_sent = send_verification_email(user.email, user.name, otp_code)
    return otp_code, email_sent


def authenticate_user(db: Session, email: str, password: str) -> User:
    """Authenticates user with email and password."""
    email_clean = email.strip().lower()
    user = db.query(User).filter(User.email == email_clean).first()

    if not user:
        raise ValueError("No account found with this email address.")

    if not user.is_verified:
        raise ValueError("Account is not verified. Please verify your account using the 6-digit code sent to your email.")

    if not verify_password(password, user.password_hash, user.salt):
        raise ValueError("Incorrect password. Please try again or use 'Forgot Password'.")

    # Update last login timestamp
    user.last_login = datetime.utcnow()
    # Ensure role is admin if email matches adityareddy14623@gmail.com
    if user.email.lower() == ADMIN_EMAIL.lower() and user.role != "admin":
        user.role = "admin"

    db.commit()
    db.refresh(user)
    return user


def initiate_forgot_password(db: Session, email: str) -> Tuple[str, bool]:
    """Generates password reset OTP code and sends recovery email."""
    email_clean = email.strip().lower()
    user = db.query(User).filter(User.email == email_clean).first()

    if not user:
        raise ValueError("No account exists with this email address.")

    reset_code = generate_otp_code()
    user.reset_code = reset_code
    user.reset_code_expires_at = datetime.utcnow() + timedelta(minutes=15)
    db.commit()

    email_sent = send_password_reset_email(user.email, user.name, reset_code)
    return reset_code, email_sent


def reset_password_with_code(db: Session, email: str, code: str, new_password: str) -> User:
    """Validates password recovery OTP code and updates user's password."""
    email_clean = email.strip().lower()
    user = db.query(User).filter(User.email == email_clean).first()

    if not user:
        raise ValueError("No account found with this email.")

    if not user.reset_code or user.reset_code != code.strip():
        raise ValueError("Invalid recovery code. Please check your email and enter the correct 6-digit code.")

    if user.reset_code_expires_at and datetime.utcnow() > user.reset_code_expires_at:
        raise ValueError("Recovery code has expired. Please request a new code.")

    # Set new password
    pwd_hash, salt = hash_password(new_password)
    user.password_hash = pwd_hash
    user.salt = salt
    user.reset_code = None
    user.reset_code_expires_at = None
    user.is_verified = True # Resetting password also ensures user is verified
    db.commit()
    db.refresh(user)

    return user
