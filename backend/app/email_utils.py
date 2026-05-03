"""
Email utility — sends credentials via either:

  1. **Brevo** (preferred, HTTPS API, works on Render free tier)
       - Sign up at https://brevo.com (free, 300 emails/day = ~9000/month)
       - Verify a sender email (your gmail), generate an API key
       - Set BREVO_API_KEY + BREVO_SENDER_EMAIL on Render
  2. **SMTP** (Gmail / any) — fallback for local dev or paid Render
       - Render free tier BLOCKS outbound SMTP on ports 465 / 587, so
         on free Render this path will time out. Brevo is the answer there.

Why Brevo and not SMTP on Render free?
  Render's free tier blocks outbound TCP to common SMTP submission ports
  (network policy to prevent spam abuse from free dynos). HTTPS to
  api.brevo.com is permitted, so we send via their REST API.

Env vars (any one set is enough):
  BREVO_API_KEY        Brevo API key (xkeysib-...)
  BREVO_SENDER_EMAIL   Verified sender (your gmail)
  BREVO_SENDER_NAME    Display name (default "Class Attendance")

  SMTP_HOST            e.g. smtp.gmail.com (used only if Brevo not set)
  SMTP_PORT            465 (SMTPS) or 587 (STARTTLS)
  SMTP_USER            smtp login email
  SMTP_PASSWORD        Gmail App Password (16 chars)
  SMTP_FROM            From-address (defaults to SMTP_USER)
"""
import os
import json
import socket
import smtplib
import ssl
import logging
import contextlib
import urllib.request
import urllib.error
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

logger = logging.getLogger(__name__)


# ---------- Provider detection ----------

def _brevo_configured() -> bool:
    return bool(os.getenv("BREVO_API_KEY") and os.getenv("BREVO_SENDER_EMAIL"))


def _smtp_configured() -> bool:
    return bool(
        os.getenv("SMTP_HOST")
        and os.getenv("SMTP_USER")
        and os.getenv("SMTP_PASSWORD")
    )


def is_configured() -> bool:
    """Either Brevo OR SMTP is enough — caller doesn't need to care which."""
    return _brevo_configured() or _smtp_configured()


# ---------- Shared message body ----------

SUBJECT = "Your Class Attendance Login Credentials"


def _build_body(to_email: str, name: str, role: str, default_password: str) -> str:
    return f"""Hi {name},

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


# ---------- Brevo HTTPS API path ----------

def _send_via_brevo(to_email: str, name: str, role: str, default_password: str) -> bool:
    api_key = os.getenv("BREVO_API_KEY")
    sender = os.getenv("BREVO_SENDER_EMAIL")
    sender_name = os.getenv("BREVO_SENDER_NAME", "Class Attendance")

    body = _build_body(to_email, name, role, default_password)
    payload = {
        "sender":      {"email": sender, "name": sender_name},
        "to":          [{"email": to_email, "name": name}],
        "subject":     SUBJECT,
        "textContent": body,
    }

    req = urllib.request.Request(
        "https://api.brevo.com/v3/smtp/email",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "api-key":      api_key,
            "Content-Type": "application/json",
            "Accept":       "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            status = resp.status if hasattr(resp, "status") else resp.getcode()
            if status in (200, 201, 202):
                logger.info(f"[EMAIL:SENT] {to_email} via Brevo (HTTP {status})")
                return True
            logger.error(f"[EMAIL:FAIL] Brevo returned HTTP {status} for {to_email}")
            return False
    except urllib.error.HTTPError as e:
        # 4xx → almost always API key wrong / sender not verified
        body_text = ""
        try:
            body_text = e.read().decode("utf-8", errors="replace")[:300]
        except Exception:
            pass
        logger.error(
            f"[EMAIL:FAIL] Brevo HTTP {e.code} for {to_email}: {body_text}"
        )
        return False
    except Exception as e:
        logger.error(f"[EMAIL:FAIL] Brevo {type(e).__name__}: {e}")
        return False


# ---------- SMTP path (Gmail etc.) ----------

@contextlib.contextmanager
def _ipv4_only():
    """Patch socket.getaddrinfo to return IPv4 results only.
    Renders' broken IPv6 routing causes errno 101; this sidesteps it
    while preserving the hostname for SNI / TLS cert validation."""
    orig = socket.getaddrinfo

    def patched(host, port, family=0, type=0, proto=0, flags=0):
        return orig(host, port, socket.AF_INET, type, proto, flags)

    socket.getaddrinfo = patched
    try:
        yield
    finally:
        socket.getaddrinfo = orig


def _build_mime(to_email, name, role, default_password, from_addr):
    msg = MIMEMultipart()
    msg["From"] = from_addr
    msg["To"] = to_email
    msg["Subject"] = SUBJECT
    msg.attach(MIMEText(_build_body(to_email, name, role, default_password), "plain"))
    return msg


def _try_smtps_465(host, user, password, msg, timeout=10):
    ctx = ssl.create_default_context()
    with smtplib.SMTP_SSL(host, 465, context=ctx, timeout=timeout) as s:
        s.login(user, password)
        s.send_message(msg)


def _try_starttls_587(host, user, password, msg, timeout=10):
    ctx = ssl.create_default_context()
    with smtplib.SMTP(host, 587, timeout=timeout) as s:
        s.ehlo()
        s.starttls(context=ctx)
        s.ehlo()
        s.login(user, password)
        s.send_message(msg)


def _send_via_smtp(to_email: str, name: str, role: str, default_password: str) -> bool:
    host = os.getenv("SMTP_HOST")
    user = os.getenv("SMTP_USER")
    password = os.getenv("SMTP_PASSWORD")
    from_addr = os.getenv("SMTP_FROM", user)
    preferred_port = int(os.getenv("SMTP_PORT", "465"))

    msg = _build_mime(to_email, name, role, default_password, from_addr)
    attempts = (
        [("SMTPS:465", _try_smtps_465), ("STARTTLS:587", _try_starttls_587)]
        if preferred_port == 465
        else [("STARTTLS:587", _try_starttls_587), ("SMTPS:465", _try_smtps_465)]
    )

    last_err = None
    with _ipv4_only():
        for label, fn in attempts:
            try:
                fn(host, user, password, msg)
                logger.info(f"[EMAIL:SENT] {to_email} via {label}")
                return True
            except Exception as e:
                last_err = f"{label} → {type(e).__name__}: {e}"
                logger.warning(f"[EMAIL:RETRY] {label} failed for {to_email}: {e}")

    logger.error(f"[EMAIL:FAIL] SMTP failed for {to_email}. Last: {last_err}")
    return False


# ---------- Public entrypoint ----------

def send_credentials_email(to_email: str, name: str, role: str, default_password: str) -> bool:
    """Try Brevo first (HTTPS, works on Render free); fall back to SMTP.
    Safe no-op if neither is configured. Returns True on success."""
    if _brevo_configured():
        if _send_via_brevo(to_email, name, role, default_password):
            return True
        logger.warning(f"[EMAIL] Brevo failed for {to_email}; trying SMTP next")

    if _smtp_configured():
        return _send_via_smtp(to_email, name, role, default_password)

    if not _brevo_configured():
        logger.info(
            f"[EMAIL:SKIP] No provider configured. Would email {to_email}: "
            f"{role} / {default_password}"
        )
    return False
