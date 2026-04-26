"""
Email utility — sends credentials when SMTP is configured via env vars.
If not configured, logs to console and doesn't crash.

Env vars:
  SMTP_HOST     (e.g. smtp.gmail.com)
  SMTP_PORT     (e.g. 587)
  SMTP_USER     (your email)
  SMTP_PASSWORD (Gmail app password — NOT your real password)
  SMTP_FROM     (default: SMTP_USER)
"""
import os
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

logger = logging.getLogger(__name__)


def is_configured() -> bool:
    return bool(os.getenv("SMTP_HOST") and os.getenv("SMTP_USER") and os.getenv("SMTP_PASSWORD"))


def send_credentials_email(to_email: str, name: str, role: str, default_password: str):
    """
    Send login credentials email. Safe no-op if SMTP env missing.
    Returns True if sent, False otherwise.
    """
    if not is_configured():
        logger.info(f"[EMAIL:SKIP] SMTP not configured. Would email {to_email}: {role} / {default_password}")
        return False

    host = os.getenv("SMTP_HOST")
    port = int(os.getenv("SMTP_PORT", "587"))
    user = os.getenv("SMTP_USER")
    password = os.getenv("SMTP_PASSWORD")
    from_addr = os.getenv("SMTP_FROM", user)

    subject = "Your Class Attendance Login Credentials"
    body = f"""Hello {name},

Welcome to Class Attendance App!

Your {role} account has been created. Please use the following credentials to login:

    Email:    {to_email}
    Password: {default_password}

⚠️ IMPORTANT: For security, please change your password on first login.

---
Class Attendance v1.2.0
Developed by Vishal Kumar
@ RRSDCE Begusarai
"""

    msg = MIMEMultipart()
    msg["From"] = from_addr
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    try:
        with smtplib.SMTP(host, port) as s:
            s.starttls()
            s.login(user, password)
            s.send_message(msg)
        logger.info(f"[EMAIL:SENT] Credentials emailed to {to_email}")
        return True
    except Exception as e:
        logger.error(f"[EMAIL:FAIL] {e}")
        return False
