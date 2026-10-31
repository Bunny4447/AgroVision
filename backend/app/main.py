import io
import os
import json
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional, List
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr
from PIL import Image
from sqlalchemy.orm import Session

from app.config import (
    MODEL_PATH,
    METRICS_PATH,
    SAMPLE_IMAGES_DIR,
    CLASS_NAMES,
    DISPLAY_NAMES,
    DISEASE_KNOWLEDGE_BASE
)
from app.models.paddy_model import load_paddy_model
from app.services.prediction import process_paddy_image, pil_to_base64_data_url
from app.database import engine, get_db, Base
from app.models.db_models import User, SmtpConfig, AnalysisRecord, ADMIN_EMAIL
from app.services.auth_service import (
    register_user,
    verify_user_code,
    resend_verification_code,
    authenticate_user,
    initiate_forgot_password,
    reset_password_with_code,
    hash_password,
    generate_otp_code
)
from app.services.email_service import send_html_email, get_active_smtp_config, send_verification_email

# Initialize FastAPI
app = FastAPI(
    title="AgroVision AI API",
    description="Paddy Leaf Disease Detection, Explainability & User Authentication System",
    version="2.0.0"
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model instance
model = None

# Pydantic Schemas
class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class VerifyCodeRequest(BaseModel):
    email: EmailStr
    code: str

class ResendCodeRequest(BaseModel):
    email: EmailStr

class ChangeEmailRequest(BaseModel):
    old_email: EmailStr
    new_email: EmailStr

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    code: str
    new_password: str

class SmtpConfigRequest(BaseModel):
    sender_email: EmailStr
    sender_password: str
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    sender_name: str = "AgroVision AI Support"
    use_tls: bool = True

class TestSmtpRequest(BaseModel):
    recipient_email: EmailStr


@app.on_event("startup")
def startup_event():
    global model
    print("[FastAPI Startup] Ensuring MySQL database tables exist...")
    try:
        Base.metadata.create_all(bind=engine)
        print("[FastAPI Startup] MySQL tables verified.")
    except Exception as e:
        print(f"[Database Warning] Could not initialize tables: {e}")

    # Ensure admin user adityareddy14623@gmail.com exists with initial setup
    try:
        from app.database import SessionLocal
        db = SessionLocal()
        admin_user = db.query(User).filter(User.email == ADMIN_EMAIL.lower()).first()
        if not admin_user:
            # Create default admin account with verified status
            pwd_hash, salt = hash_password("admin123")
            admin_user = User(
                email=ADMIN_EMAIL.lower(),
                name="Aditya Reddy (Admin)",
                password_hash=pwd_hash,
                salt=salt,
                role="admin",
                is_verified=True,
                created_at=datetime.utcnow()
            )
            db.add(admin_user)
            db.commit()
            print(f"[Admin Setup] Created initial admin account for {ADMIN_EMAIL}")
        else:
            if admin_user.role != "admin" or not admin_user.is_verified:
                admin_user.role = "admin"
                admin_user.is_verified = True
                db.commit()
                print(f"[Admin Setup] Ensured admin privileges for {ADMIN_EMAIL}")
        db.close()
    except Exception as e:
        print(f"[Admin Init Warning] {e}")

    print("[FastAPI Startup] Initializing PyTorch Paddy Model...")
    model = load_paddy_model(MODEL_PATH)


@app.get("/api/health")
def health_check(db: Session = Depends(get_db)):
    db_connected = False
    users_count = 0
    try:
        users_count = db.query(User).count()
        db_connected = True
    except Exception:
        db_connected = False

    return {
        "status": "healthy",
        "service": "AgroVision AI Backend",
        "model_loaded": model is not None,
        "classes_supported": len(CLASS_NAMES),
        "database_connected": db_connected,
        "registered_users": users_count,
        "admin_email": ADMIN_EMAIL
    }


# ==========================================
# AUTHENTICATION ENDPOINTS
# ==========================================

@app.post("/api/auth/register")
def api_register(req: RegisterRequest, db: Session = Depends(get_db)):
    try:
        user, otp_code, email_sent = register_user(
            db, name=req.name, email=req.email, password=req.password
        )
        msg = f"Registration submitted! A 6-digit code has been sent to {user.email}." if email_sent else f"A verification code has been dispatched to {user.email}."
        return {
            "success": True,
            "message": msg,
            "email": user.email,
            "name": user.name,
            "email_sent": email_sent,
            "info": "Please check your email inbox for the 6-digit verification code."
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")


@app.post("/api/auth/verify")
def api_verify_code(req: VerifyCodeRequest, db: Session = Depends(get_db)):
    try:
        user, welcome_sent = verify_user_code(db, email=req.email, code=req.code)
        return {
            "success": True,
            "message": "Account verified and activated successfully!",
            "welcome_email_sent": welcome_sent,
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role,
                "is_verified": user.is_verified
            }
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Verification failed: {str(e)}")


@app.post("/api/auth/resend-code")
def api_resend_code(req: ResendCodeRequest, db: Session = Depends(get_db)):
    try:
        otp_code, email_sent = resend_verification_code(db, email=req.email)
        msg = f"A fresh 6-digit verification code has been dispatched to {req.email}."
        return {
            "success": True,
            "message": msg,
            "email_sent": email_sent
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed resending code: {str(e)}")


@app.post("/api/auth/change-email")
def api_change_email(req: ChangeEmailRequest, db: Session = Depends(get_db)):
    try:
        old_clean = req.old_email.strip().lower()
        new_clean = req.new_email.strip().lower()
        
        user = db.query(User).filter(User.email == old_clean).first()
        if not user:
            raise ValueError(f"Account for '{old_clean}' not found.")
        if user.is_verified:
            raise ValueError(f"The account '{old_clean}' is already verified. Please sign in.")
            
        existing = db.query(User).filter(User.email == new_clean).first()
        if existing and existing.is_verified:
            raise ValueError(f"An active account with '{new_clean}' already exists. Please sign in.")
        if existing and not existing.is_verified and existing.id != user.id:
            db.delete(existing)
            db.commit()
            
        user.email = new_clean
        otp_code = generate_otp_code()
        user.verification_code = otp_code
        user.verification_code_expires_at = datetime.utcnow() + timedelta(minutes=15)
        db.commit()
        db.refresh(user)
        
        email_sent = send_verification_email(user.email, user.name, otp_code)
        return {
            "success": True,
            "message": f"Email updated to {new_clean}. A new 6-digit verification code has been dispatched to your email.",
            "email": new_clean,
            "email_sent": email_sent
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed changing email: {str(e)}")
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed changing email: {str(e)}")


@app.post("/api/auth/login")
def api_login(req: LoginRequest, db: Session = Depends(get_db)):
    try:
        user = authenticate_user(db, email=req.email, password=req.password)
        return {
            "success": True,
            "message": f"Welcome back, {user.name}!",
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role,
                "is_verified": user.is_verified,
                "is_admin": user.role == "admin"
            }
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")


@app.post("/api/auth/forgot-password")
def api_forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    try:
        reset_code, email_sent = initiate_forgot_password(db, email=req.email)
        msg = f"A 6-digit password recovery code has been sent to {req.email}."
        return {
            "success": True,
            "message": msg,
            "email_sent": email_sent,
            "info": "Please check your email inbox for the 6-digit recovery code."
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Forgot password request failed: {str(e)}")


@app.post("/api/auth/reset-password")
def api_reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    try:
        user = reset_password_with_code(
            db, email=req.email, code=req.code, new_password=req.new_password
        )
        return {
            "success": True,
            "message": "Password has been successfully reset! You can now log in with your new password.",
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role
            }
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Password reset failed: {str(e)}")


# ==========================================
# ADMIN ENDPOINTS (Aditya Reddy)
# ==========================================

@app.get("/api/admin/users")
def get_all_users(requester_email: Optional[str] = None, db: Session = Depends(get_db)):
    """Returns all registered users stored in MySQL database."""
    users = db.query(User).order_by(User.created_at.desc()).all()
    user_list = [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": u.role,
            "is_verified": u.is_verified,
            "created_at": u.created_at.strftime("%Y-%m-%d %H:%M:%S") if u.created_at else None,
            "last_login": u.last_login.strftime("%Y-%m-%d %H:%M:%S") if u.last_login else "Never"
        }
        for u in users
    ]
    return {
        "total_users": len(user_list),
        "admin_email": ADMIN_EMAIL,
        "users": user_list
    }


@app.get("/api/admin/smtp-config")
def get_smtp_config(db: Session = Depends(get_db)):
    """Returns current SMTP settings with masked password."""
    config = db.query(SmtpConfig).first()
    if not config:
        env_configured = bool(os.getenv("SMTP_USER") and os.getenv("SMTP_PASSWORD"))
        return {
            "is_configured": env_configured,
            "sender_email": os.getenv("SMTP_USER") or "Not configured yet",
            "smtp_host": os.getenv("SMTP_HOST", "smtp.gmail.com"),
            "smtp_port": int(os.getenv("SMTP_PORT", 587)),
            "sender_name": "AgroVision AI Support"
        }
    
    return {
        "is_configured": bool(config.sender_email and config.sender_password),
        "sender_email": config.sender_email,
        "smtp_host": config.smtp_host,
        "smtp_port": config.smtp_port,
        "sender_name": config.sender_name,
        "use_tls": config.use_tls,
        "has_password": bool(config.sender_password)
    }


@app.post("/api/admin/smtp-config")
def save_smtp_config(req: SmtpConfigRequest, db: Session = Depends(get_db)):
    """Saves or updates email sender credentials in MySQL database."""
    config = db.query(SmtpConfig).first()
    if not config:
        config = SmtpConfig(
            sender_email=req.sender_email.strip(),
            sender_password=req.sender_password.strip(),
            smtp_host=req.smtp_host.strip(),
            smtp_port=req.smtp_port,
            sender_name=req.sender_name.strip(),
            use_tls=req.use_tls
        )
        db.add(config)
    else:
        config.sender_email = req.sender_email.strip()
        config.sender_password = req.sender_password.strip()
        config.smtp_host = req.smtp_host.strip()
        config.smtp_port = req.smtp_port
        config.sender_name = req.sender_name.strip()
        config.use_tls = req.use_tls

    db.commit()
    db.refresh(config)
    return {
        "success": True,
        "message": "SMTP email configuration saved successfully! The application will now deliver live emails.",
        "sender_email": config.sender_email
    }


@app.post("/api/admin/test-smtp")
def test_smtp_delivery(req: TestSmtpRequest):
    """Sends a live test email to verify SMTP credentials."""
    subject = "AgroVision AI - SMTP Live Connection Test"
    html = f"""
    <div style="font-family: sans-serif; background: #131f22; color: #f1f5f9; padding: 24px; border-radius: 12px;">
      <h2 style="color: #10b981;">SMTP Live Connection Verified!</h2>
      <p>This is a live test email sent from your AgroVision AI application.</p>
      <p>Outbound email deliverability for 6-digit registration codes, password recovery, and welcome platform documentation is active.</p>
    </div>
    """
    success, message = send_html_email(req.recipient_email, subject, html)
    if not success:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to send test email: {message}"
        )
    return {"success": True, "message": f"Test email delivered successfully to {req.recipient_email}!"}


# ==========================================
# PREDICTION & DIAGNOSTIC ENDPOINTS
# ==========================================

@app.post("/api/predict")
async def predict_leaf_disease(
    image: UploadFile = File(...),
    opacity: float = Form(0.55),
    user_email: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    if not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a valid image (JPG, PNG).")
        
    try:
        contents = await image.read()
        image_pil = Image.open(io.BytesIO(contents))
        
        # Verify valid image dimensions
        if image_pil.width < 50 or image_pil.height < 50:
            raise HTTPException(status_code=400, detail="Uploaded image resolution is too low. Please upload a clear photo.")
            
        result = process_paddy_image(model, image_pil, opacity=opacity)

        # Log record in MySQL database if user_email is provided
        if user_email:
            try:
                user = db.query(User).filter(User.email == user_email.strip().lower()).first()
                record = AnalysisRecord(
                    user_id=user.id if user else None,
                    user_email=user_email.strip().lower(),
                    prediction=result["prediction"],
                    display_name=result["display_name"],
                    confidence=result["confidence"],
                    top_region=result["regions"]["top"]["name"].split(" (")[0],
                    created_at=datetime.utcnow()
                )
                db.add(record)
                db.commit()
            except Exception as dbe:
                print(f"[DB Log Warning] Could not save analysis record: {dbe}")

        return JSONResponse(content=result)
    except Exception as e:
        print(f"[Prediction Error] {e}")
        raise HTTPException(status_code=500, detail=f"Image processing error: {str(e)}")


@app.get("/api/sample-images")
def get_sample_images():
    """Returns pre-loaded sample paddy leaf images with base64 data for instant 1-click testing."""
    samples = []
    for cls in CLASS_NAMES:
        sample_path = SAMPLE_IMAGES_DIR / f"sample_{cls}.jpg"
        display_name = DISPLAY_NAMES.get(cls, cls)
        
        if sample_path.exists():
            img_pil = Image.open(sample_path)
            b64_str = pil_to_base64_data_url(img_pil, "JPEG")
            samples.append({
                "key": cls,
                "display_name": display_name,
                "image_data": b64_str
            })
            
    return {"samples": samples}


@app.post("/api/predict-sample")
def predict_sample_image(
    sample_key: str = Form(...),
    opacity: float = Form(0.55),
    user_email: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    sample_path = SAMPLE_IMAGES_DIR / f"sample_{sample_key}.jpg"
    if not sample_path.exists():
        raise HTTPException(status_code=404, detail=f"Sample image for '{sample_key}' not found.")
        
    try:
        image_pil = Image.open(sample_path)
        result = process_paddy_image(model, image_pil, opacity=opacity)

        # Log to MySQL database
        if user_email:
            try:
                user = db.query(User).filter(User.email == user_email.strip().lower()).first()
                record = AnalysisRecord(
                    user_id=user.id if user else None,
                    user_email=user_email.strip().lower(),
                    prediction=result["prediction"],
                    display_name=result["display_name"],
                    confidence=result["confidence"],
                    top_region=result["regions"]["top"]["name"].split(" (")[0],
                    created_at=datetime.utcnow()
                )
                db.add(record)
                db.commit()
            except Exception as dbe:
                print(f"[DB Log Warning] Could not save analysis record: {dbe}")

        return JSONResponse(content=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sample processing error: {str(e)}")


@app.get("/api/metrics")
def get_model_metrics():
    if not METRICS_PATH.exists():
        return {
            "status": "pending",
            "message": "Evaluation metrics not computed yet. Run backend/scripts/evaluate.py to generate test set metrics."
        }
    try:
        with open(METRICS_PATH, "r") as f:
            data = json.load(f)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed reading metrics: {str(e)}")


@app.get("/api/diseases")
def get_diseases_info():
    return DISEASE_KNOWLEDGE_BASE
