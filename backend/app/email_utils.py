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
    body = f"""Hi {name},

Your account password at 'Class Attendance — RRSDCE Begusarai' as follows.

Your current login information is now:
username: {to_email}
password: {default_password}

Please open the Class Attendance app and login as {role}, then change your
password from Settings on first login.

In most mail programs, the credentials above can be selected and copied
directly into the app. If you face any issue, share these details with
your branch HOD only — never with anyone else.

Cheers from the 'Class Attendance' administrator,

Admin, Class Attendance
@ RRSDCE Begusarai • Developed by Vishal Kumar
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
