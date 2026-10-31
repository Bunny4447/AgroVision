import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.database import SessionLocal
from app.models.db_models import SmtpConfig

def get_active_smtp_config():
    """Retrieves SMTP configuration from DB or environment variables."""
    db = SessionLocal()
    try:
        config = db.query(SmtpConfig).first()
        if config and config.sender_email and config.sender_password:
            return {
                "host": config.smtp_host,
                "port": config.smtp_port,
                "user": config.sender_email,
                "password": config.sender_password,
                "tls": config.use_tls,
                "sender_name": config.sender_name or "AgroVision AI Support"
            }
    finally:
        db.close()

    # Fallback to env vars
    env_user = os.getenv("SMTP_USER")
    env_pass = os.getenv("SMTP_PASSWORD")
    if env_user and env_pass:
        return {
            "host": os.getenv("SMTP_HOST", "smtp.gmail.com"),
            "port": int(os.getenv("SMTP_PORT", 587)),
            "user": env_user,
            "password": env_pass,
            "tls": True,
            "sender_name": "AgroVision AI Support"
        }

    return None


from email.header import Header

def send_html_email(to_email: str, subject: str, html_content: str) -> tuple[bool, str]:
    """Attempts sending an email via configured SMTP; returns (success: bool, message: str)."""
    smtp_settings = get_active_smtp_config()
    if not smtp_settings:
        msg = "No SMTP settings configured yet in the database."
        print(f"[Email Notification (Simulated)] {msg} To: {to_email}")
        return False, msg

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = Header(subject, "utf-8")
        sender_name = smtp_settings.get("sender_name") or "AgroVision AI Support"
        msg["From"] = f"{Header(sender_name, 'utf-8').encode()} <{smtp_settings['user']}>"
        msg["To"] = to_email

        # Explicitly use utf-8 charset for HTML body
        part = MIMEText(html_content, "html", "utf-8")
        msg.attach(part)

        server = None
        try:
            server = smtplib.SMTP(smtp_settings["host"], int(smtp_settings["port"]), timeout=10)
            if smtp_settings.get("tls", True):
                server.starttls()
            server.login(smtp_settings["user"], smtp_settings["password"])
            server.send_message(msg)
            print(f"[Email Notification] Successfully sent email to {to_email}")
            return True, "Email sent successfully"
        finally:
            if server:
                try:
                    server.quit()
                except Exception:
                    try:
                        server.close()
                    except Exception:
                        pass
    except Exception as e:
        err_msg = str(e)
        print(f"[Email Error] Failed sending email to {to_email}: {err_msg}")
        return False, err_msg


def send_verification_email(to_email: str, user_name: str, code: str) -> bool:
    """Sends registration 6-digit OTP verification email."""
    subject = f"AgroVision AI - Your Registration Verification Code [{code}]"
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #0b1315; color: #f1f5f9; padding: 24px; }}
        .card {{ max-width: 560px; margin: auto; background: #131f22; border: 1px solid #1e293b; border-radius: 16px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }}
        .header {{ text-align: center; border-bottom: 1px solid #1e293b; padding-bottom: 20px; }}
        .title {{ color: #10b981; font-size: 24px; font-weight: 800; margin: 0; }}
        .code-box {{ background: #0f172a; border: 2px dashed #10b981; border-radius: 12px; text-align: center; padding: 18px; margin: 24px 0; }}
        .code {{ font-size: 36px; font-family: monospace; letter-spacing: 8px; font-weight: 900; color: #34d399; margin: 0; }}
        .footer {{ font-size: 11px; color: #64748b; text-align: center; margin-top: 24px; }}
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1 class="title">🌾 AgroVision AI</h1>
          <p style="color: #94a3b8; font-size: 14px; margin-top: 4px;">Paddy Disease Detection & Explainability System</p>
        </div>
        <p style="font-size: 15px; color: #cbd5e1; margin-top: 20px;">Hello <strong>{user_name}</strong>,</p>
        <p style="font-size: 14px; color: #94a3b8; line-height: 1.6;">
          Thank you for joining AgroVision! To complete your registration and activate your account, please enter the 6-digit verification code below:
        </p>
        <div class="code-box">
          <p class="code">{code}</p>
        </div>
        <p style="font-size: 12px; color: #64748b; text-align: center;">This code will expire in 15 minutes. If you did not create an account, please ignore this email.</p>
        <div class="footer">
          AgroVision Agricultural AI Engine &copy; 2026. All rights reserved.
        </div>
      </div>
    </body>
    </html>
    """
    success, _ = send_html_email(to_email, subject, html)
    return success


def send_password_reset_email(to_email: str, user_name: str, code: str) -> bool:
    """Sends password recovery 6-digit OTP code email."""
    subject = f"AgroVision AI - Password Reset Recovery Code [{code}]"
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #0b1315; color: #f1f5f9; padding: 24px; }}
        .card {{ max-width: 560px; margin: auto; background: #131f22; border: 1px solid #1e293b; border-radius: 16px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }}
        .header {{ text-align: center; border-bottom: 1px solid #1e293b; padding-bottom: 20px; }}
        .title {{ color: #f59e0b; font-size: 24px; font-weight: 800; margin: 0; }}
        .code-box {{ background: #0f172a; border: 2px dashed #f59e0b; border-radius: 12px; text-align: center; padding: 18px; margin: 24px 0; }}
        .code {{ font-size: 36px; font-family: monospace; letter-spacing: 8px; font-weight: 900; color: #fbbf24; margin: 0; }}
        .footer {{ font-size: 11px; color: #64748b; text-align: center; margin-top: 24px; }}
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1 class="title">🔐 AgroVision Account Recovery</h1>
          <p style="color: #94a3b8; font-size: 14px; margin-top: 4px;">Paddy Disease Detection & Explainability System</p>
        </div>
        <p style="font-size: 15px; color: #cbd5e1; margin-top: 20px;">Hello <strong>{user_name}</strong>,</p>
        <p style="font-size: 14px; color: #94a3b8; line-height: 1.6;">
          We received a request to reset your password. Use the following 6-digit recovery code to complete your password reset:
        </p>
        <div class="code-box">
          <p class="code">{code}</p>
        </div>
        <p style="font-size: 12px; color: #64748b; text-align: center;">This code expires in 15 minutes. If you did not request a password reset, you can safely disregard this email.</p>
        <div class="footer">
          AgroVision Agricultural AI Engine &copy; 2026. All rights reserved.
        </div>
      </div>
    </body>
    </html>
    """
    success, _ = send_html_email(to_email, subject, html)
    return success


def send_welcome_professional_info_email(to_email: str, user_name: str) -> bool:
    """Sends the comprehensive professional guide and technical overview of AgroVision upon registration/verification."""
    subject = "Welcome to AgroVision AI - Professional Guide & Platform Documentation"
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #090e10; color: #f8fafc; padding: 24px; margin: 0; }}
        .card {{ max-width: 680px; margin: auto; background: #111a1d; border: 1px solid #1e293b; border-radius: 20px; padding: 36px; box-shadow: 0 12px 30px rgba(0,0,0,0.6); }}
        .header {{ text-align: center; border-bottom: 1px solid #1e293b; padding-bottom: 24px; }}
        .badge {{ display: inline-block; padding: 4px 12px; background: rgba(16,185,129,0.15); border: 1px solid #10b981; color: #34d399; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }}
        .title {{ color: #ffffff; font-size: 28px; font-weight: 900; margin: 12px 0 4px 0; }}
        .subtitle {{ color: #94a3b8; font-size: 14px; margin: 0; }}
        .section {{ margin-top: 28px; }}
        .section-title {{ font-size: 16px; font-weight: 700; color: #10b981; border-left: 4px solid #10b981; padding-left: 10px; margin-bottom: 12px; }}
        p {{ font-size: 13.5px; color: #cbd5e1; line-height: 1.7; margin: 6px 0; }}
        .grid {{ display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 12px; }}
        .box {{ background: #192529; border: 1px solid #233439; border-radius: 12px; padding: 14px; }}
        .box h4 {{ margin: 0 0 6px 0; font-size: 13px; color: #e2e8f0; }}
        .box p {{ margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.5; }}
        .disease-tag {{ display: inline-block; background: #1e293b; color: #e2e8f0; padding: 4px 10px; border-radius: 6px; font-size: 11px; margin: 3px; border: 1px solid #334155; }}
        .action-btn {{ display: inline-block; margin-top: 24px; padding: 14px 28px; background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 14px; text-align: center; }}
        .footer {{ font-size: 11px; color: #64748b; text-align: center; margin-top: 32px; border-top: 1px solid #1e293b; padding-top: 20px; }}
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <span class="badge">Platform Activated</span>
          <h1 class="title">🌾 AgroVision AI</h1>
          <p class="subtitle">Next-Generation Paddy Disease Detection & Explainability Platform</p>
        </div>

        <p style="font-size: 15px; margin-top: 24px;">Dear <strong>{user_name}</strong>,</p>
        <p>
          Welcome to <strong>AgroVision AI</strong>. Your account has been verified and registered. Below is the professional architectural and operational overview of the platform.
        </p>

        <!-- Section 1: Core Technologies -->
        <div class="section">
          <div class="section-title">Core Deep-Learning Architecture</div>
          <p>
            AgroVision combines modern computer vision with diagnostic explainability to assist agronomists, extension officers, and paddy farmers in detecting foliage pathogens before irreversible field damage occurs:
          </p>
          <div class="grid">
            <div class="box">
              <h4>🧠 ResNet18 Transfer Learning</h4>
              <p>Fine-tuned residual convolutional neural network with custom classification head optimized for 224x224 RGB leaf textures.</p>
            </div>
            <div class="box">
              <h4>🔥 Grad-CAM Explainability</h4>
              <p>Backpropagates gradient signals to Layer4 feature maps to project real-time heatmaps revealing WHERE the AI identified symptoms.</p>
            </div>
            <div class="box">
              <h4>📐 Leaf Masking & Otsu Fusing</h4>
              <p>Filters background noise using fused Otsu + HSV segmentation to guarantee attention intensity is measured purely on leaf tissue.</p>
            </div>
            <div class="box">
              <h4>📍 3-Zone Regional Breakdown</h4>
              <p>Divides foliage into Top (0-33%), Middle (33-66%), and Bottom (66-100%) zones with discrete severity percentage classifications.</p>
            </div>
          </div>
        </div>

        <!-- Section 2: Supported Pathogens -->
        <div class="section">
          <div class="section-title">Supported Paddy Leaf Diagnoses</div>
          <p>The system evaluates leaf imagery for 5 conditions:</p>
          <div style="margin-top: 8px;">
            <span class="disease-tag">🦠 Bacterial Leaf Blight (Xanthomonas oryzae)</span>
            <span class="disease-tag">🍂 Brown Spot (Bipolaris oryzae)</span>
            <span class="disease-tag">🌑 Leaf Smut (Entyloma oryzae)</span>
            <span class="disease-tag">⚡ Rice Blast (Magnaporthe oryzae)</span>
            <span class="disease-tag">🌿 Healthy Paddy Leaf (Optimal Chlorophyll)</span>
          </div>
        </div>

        <!-- Section 3: Diagnostic Guidelines -->
        <div class="section">
          <div class="section-title">Field Diagnostic Guidelines</div>
          <p>
            For best diagnostic precision:
          </p>
          <ul style="font-size: 13px; color: #cbd5e1; line-height: 1.6; padding-left: 20px;">
            <li>Take close-up photos of individual paddy leaves under diffused daytime sunlight.</li>
            <li>Avoid heavy blur or severe shadows across the leaf surface.</li>
            <li>Inspect the <em>Grad-CAM Split Slider</em> to cross-examine lesion margins with model attention.</li>
            <li>Consult the built-in <em>Agronomic Guidelines</em> for specific fungicide spray dosages and cultural practices.</li>
          </ul>
        </div>

        <!-- Section 4: System Administration -->
        <div class="section">
          <div class="section-title">Platform Administration</div>
          <p style="font-size: 13px; color: #94a3b8;">
            Platform administrator is designated as <strong>adityareddy14623@gmail.com</strong> with access to user management, metrics verification, and diagnostic history.
          </p>
        </div>

        <div style="text-align: center;">
          <a href="http://localhost:5173" class="action-btn">Launch AgroVision Dashboard</a>
        </div>

        <div class="footer">
          AgroVision Agricultural AI Platform &copy; 2026. Empowering sustainable rice agriculture.
        </div>
      </div>
    </body>
    </html>
    """
    success, _ = send_html_email(to_email, subject, html)
    return success
