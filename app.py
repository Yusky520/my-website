import os
import smtplib
from datetime import datetime
from email.message import EmailMessage

from flask import Flask, jsonify, render_template, request

app = Flask(__name__)


def _env_flag(name: str, default: str = "true") -> bool:
    value = os.getenv(name, default).strip().lower()
    return value in {"1", "true", "yes", "on"}


def _smtp_config():
    return {
        "host": os.getenv("SMTP_HOST", "").strip(),
        "port": int(os.getenv("SMTP_PORT", "587").strip() or "587"),
        "user": os.getenv("SMTP_USER", "").strip(),
        "password": os.getenv("SMTP_PASSWORD", "").strip(),
        "use_tls": _env_flag("SMTP_USE_TLS", "true"),
        "to_email": os.getenv("CONTACT_TO_EMAIL", "").strip(),
        "from_email": os.getenv("CONTACT_FROM_EMAIL", "").strip(),
    }


def _validate_smtp_config(config: dict) -> str | None:
    required = {
        "SMTP_HOST": config["host"],
        "SMTP_PORT": str(config["port"]),
        "SMTP_USER": config["user"],
        "SMTP_PASSWORD": config["password"],
        "CONTACT_TO_EMAIL": config["to_email"],
    }

    missing = [key for key, value in required.items() if not value]
    if missing:
        return "邮箱服务未配置完整：" + ", ".join(missing)

    return None


def send_contact_email(name: str, email: str, message: str) -> None:
    config = _smtp_config()
    config_error = _validate_smtp_config(config)
    if config_error:
        raise RuntimeError(config_error)

    sender = config["from_email"] or config["user"]
    sent_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    mail = EmailMessage()
    mail["Subject"] = "新留言 - Yusky521 网站"
    mail["From"] = sender
    mail["To"] = config["to_email"]
    mail["Reply-To"] = email
    mail.set_content(
        "\n".join(
            [
                "Yusky521 个人网站收到一条新留言。",
                "",
                f"姓名: {name}",
                f"邮箱: {email}",
                f"时间: {sent_at}",
                "",
                "留言内容:",
                message,
            ]
        )
    )

    with smtplib.SMTP(config["host"], config["port"], timeout=20) as smtp:
        smtp.ehlo()
        if config["use_tls"]:
            smtp.starttls()
            smtp.ehlo()
        smtp.login(config["user"], config["password"])
        smtp.send_message(mail)


@app.get("/")
def index():
    return render_template("index.html")


@app.post("/api/contact")
def contact():
    data = request.get_json(silent=True) or {}

    name = str(data.get("name", "")).
