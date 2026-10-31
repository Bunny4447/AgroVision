from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

ADMIN_EMAIL = "adityareddy14623@gmail.com"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(191), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    password_hash = Column(String(255), nullable=False)
    salt = Column(String(64), nullable=False)
    role = Column(String(20), default="farmer", nullable=False)  # 'admin' or 'farmer'
    is_verified = Column(Boolean, default=False, nullable=False)
    verification_code = Column(String(10), nullable=True)
    verification_code_expires_at = Column(DateTime, nullable=True)
    reset_code = Column(String(10), nullable=True)
    reset_code_expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    last_login = Column(DateTime, nullable=True)

    analysis_records = relationship("AnalysisRecord", back_populates="user", cascade="all, delete-orphan")


class SmtpConfig(Base):
    __tablename__ = "smtp_configs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    smtp_host = Column(String(100), default="smtp.gmail.com", nullable=False)
    smtp_port = Column(Integer, default=587, nullable=False)
    sender_email = Column(String(191), nullable=True)
    sender_password = Column(String(255), nullable=True)
    use_tls = Column(Boolean, default=True, nullable=False)
    sender_name = Column(String(100), default="AgroVision AI Support", nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class AnalysisRecord(Base):
    __tablename__ = "analysis_records"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    user_email = Column(String(191), nullable=True)
    prediction = Column(String(100), nullable=False)
    display_name = Column(String(100), nullable=False)
    confidence = Column(Float, nullable=False)
    top_region = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="analysis_records")
