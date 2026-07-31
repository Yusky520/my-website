from flask import Flask, jsonify, render_template, request

app = Flask(__name__)


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

    return jsonify({"ok": True, "message": "留言已收到，我会尽快查看。"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
