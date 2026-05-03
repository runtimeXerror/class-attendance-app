"""
Email utility — sends credentials when SMTP is configured via env vars.
If not configured, logs to console and doesn't crash.

Env vars:
  SMTP_HOST     (e.g. smtp.gmail.com)
  SMTP_PORT     (465 for SMTPS or 587 for STARTTLS — both routes are
                 tried automatically; this just hints which to try first)
  SMTP_USER     (your email)
  SMTP_PASSWORD (Gmail App Password — NOT your normal Gmail login)
  SMTP_FROM     (defaults to SMTP_USER)

Render free tier note:
  Outbound SMTP from Render dynos sometimes fails on IPv6 with
  "[Errno 101] Network is unreachable" because the dyno's IPv6 route
  doesn't reach Gmail's IPv6 endpoints. We work around this by patching
  socket.getaddrinfo for the duration of the SMTP call so that only
  IPv4 results are returned. The hostname is preserved end-to-end so
  TLS / SNI keeps validating against smtp.gmail.com correctly.
"""
import os
import socket
import smtplib
import ssl
import logging
import contextlib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

logger = logging.getLogger(__name__)


def is_configured() -> bool:
    return bool(os.getenv("SMTP_HOST") and os.getenv("SMTP_USER") and os.getenv("SMTP_PASSWORD"))


@contextlib.contextmanager
def _ipv4_only():
    """Temporarily restrict socket.getaddrinfo to IPv4 results.
    Preserves hostnames (so SSL SNI / cert checks against smtp.gmail.com
    keep working) while sidestepping Render's broken IPv6 routes."""
    orig = socket.getaddrinfo

    def patched(host, port, family=0, type=0, proto=0, flags=0):
        # Force AF_INET regardless of what caller asked for, then call orig.
        return orig(host, port, socket.AF_INET, type, proto, flags)

    socket.getaddrinfo = patched
    try:
        yield
    finally:
        socket.getaddrinfo = orig


def _build_message(to_email: str, name: str, role: str, default_password: str, from_addr: str):
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
    return msg


def _try_smtps_465(host, user, password, msg, timeout=15):
    """Pure SSL on port 465 — most reliable on Render."""
    ctx = ssl.create_default_context()
    # Hostname stays for SNI; IPv4-only is enforced by the outer ctx manager.
    with smtplib.SMTP_SSL(host, 465, context=ctx, timeout=timeout) as s:
        s.login(user, password)
        s.send_message(msg)


def _try_starttls_587(host, user, password, msg, timeout=15):
    """STARTTLS on port 587 — Gmail's "modern" submission route."""
    ctx = ssl.create_default_context()
    with smtplib.SMTP(host, 587, timeout=timeout) as s:
        s.ehlo()
        s.starttls(context=ctx)
        s.ehlo()
        s.login(user, password)
        s.send_message(msg)


def send_credentials_email(to_email: str, name: str, role: str, default_password: str) -> bool:
    """Send login credentials email. Safe no-op if SMTP env missing.
    Returns True on success, False otherwise.

    NOTE: Callers that don't want to block on SMTP latency (~3-15 s) should
    schedule this via FastAPI BackgroundTasks instead of awaiting it inline."""
    if not is_configured():
        logger.info(
            f"[EMAIL:SKIP] SMTP not configured. Would email {to_email}: {role} / {default_password}"
        )
        return False

    host = os.getenv("SMTP_HOST")
    user = os.getenv("SMTP_USER")
    password = os.getenv("SMTP_PASSWORD")
    from_addr = os.getenv("SMTP_FROM", user)
    # Hint which port to try first. 465 (SMTPS) is the more reliable default
    # on Render — STARTTLS:587 occasionally hangs there. Either way, we
    # fall back to the other if the preferred fails.
    preferred_port = int(os.getenv("SMTP_PORT", "465"))

    msg = _build_message(to_email, name, role, default_password, from_addr)

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

    logger.error(f"[EMAIL:FAIL] All routes failed for {to_email}. Last: {last_err}")
    return False
