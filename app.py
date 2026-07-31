import os
import smtplib
from datetime import datetime
from email.message import EmailMessage
from typing import Optional

from flask import Flask, jsonify, render_template, request

app = Flask(__name__)


def _env_flag(name: str, default: str = "true") -> bool:
    value = os.getenv(name, default).strip().lower()
    return value in {"1", "true", "yes", "on"}


def _smtp_config() -> dict:
    return {
        "host": os.getenv("SMTP_HOST", "").strip(),
        "port": int(os.getenv("SMTP_PORT", "587").strip() or "587"),
        "user": os.getenv("SMTP_USER", "").strip(),
        "password": os.getenv("SMTP_PASSWORD", "").strip(),
        "use_tls": _env_flag("SMTP_USE_TLS", "true"),
        "to_email": os.getenv("CONTACT_TO_EMAIL", "").strip(),
        "from_email": os.getenv("CONTACT_FROM_EMAIL", "").strip(),
    }


def _validate_smtp_config(config: dict) -> Optional[str]:
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

    name = str(data.get("name", "")).strip()
    email = str(data.get("email", "")).strip()
    message = str(data.get("message", "")).strip()

    if not name or not email or not message:
        return jsonify({"ok": False, "message": "请完整填写姓名、邮箱和留言内容。"}), 400

    if "@" not in email or "." not in email:
        return jsonify({"ok": False, "message": "请输入有效的邮箱地址。"}), 400

    try:
        send_contact_email(name=name, email=email, message=message)
    except RuntimeError as exc:
        return jsonify({"ok": False, "message": str(exc)}), 500
    except Exception:
        return jsonify({"ok": False, "message": "邮件发送失败，请稍后再试。"}), 500

    return jsonify({"ok": True, "message": "留言已收到，我会尽快查看。"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
