from __future__ import annotations

import os
from datetime import datetime

from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

PROFILE = {
    "nickname": "Yusky521",
    "subtitle": "PERSONAL WEBSITE",
    "title": "个人作品集 / 前端小站 / 工具合集 / 技术笔记",
    "tagline": "在安静的界面里，放进一点技术和一点生活感。",
    "about": [
        "我主要在学习 Python、C++、Qt 和计算机视觉，也在持续整理个人项目、技术笔记和作品展示。",
        "这个站点会继续按作品集的方式更新，保持干净、安静、可读，并让重点内容一眼可见。",
    ],
    "hero_stats": [
        {"value": "03", "label": "精选项目"},
        {"value": "06", "label": "常用技能"},
        {"value": "04", "label": "兴趣方向"},
    ],
    "quick_notes": [
        "偏好克制的视觉语言和清晰的信息层级。",
        "正在持续练习视觉基础、目标检测和界面设计。",
        "后续会继续补充真实作品、笔记和小工具。",
    ],
    "skills": [
        "Python",
        "C++",
        "Qt",
        "OpenCV",
        "PyTorch",
        "YOLOv8",
        "Flask",
        "HTML",
        "CSS",
    ],
    "hobbies": ["听音乐", "玩游戏", "运动", "健身"],
    "projects": [
        {
            "name": "个人作品集网站",
            "type": "Portfolio",
            "description": "以玻璃质感和克制配色构建的个人主页，适合展示成长记录、项目和联系入口。",
            "tags": ["Flask", "HTML", "CSS", "JavaScript"],
            "demo_url": "#home",
            "source_url": "https://github.com/Yusky520/my-website",
        },
        {
            "name": "视觉学习笔记",
            "type": "Computer Vision",
            "description": "围绕 OpenCV、PyTorch 和 YOLOv8 整理的练习与实验，后续可继续扩展成更完整的笔记区。",
            "tags": ["OpenCV", "PyTorch", "YOLOv8"],
            "demo_url": "#tools",
            "source_url": "https://github.com/Yusky520/my-website",
        },
        {
            "name": "轻量工具合集",
            "type": "Utilities",
            "description": "把时间戳、密码生成这类小工具集中放在一起，方便日常使用，也让网站更完整。",
            "tags": ["Utilities", "UX", "Fast"],
            "demo_url": "#tools",
            "source_url": "https://github.com/Yusky520/my-website",
        },
    ],
    "timeline": [
        {
            "period": "现在",
            "title": "搭建个人网站",
            "description": "先完成风格统一、响应式和内容分区，再逐步增加更真实的作品与交互。",
        },
        {
            "period": "近期",
            "title": "学习视觉基础",
            "description": "继续练习 OpenCV、PyTorch 与 YOLOv8，把知识整理成可展示的小项目。",
        },
        {
            "period": "后续",
            "title": "沉淀作品集",
            "description": "把网页作品、视觉实验和学习路线整理成更完整的个人档案。",
        },
    ],
    "links": [
        {"name": "GitHub", "url": "https://github.com/Yusky520", "hint": "源码仓库"},
        {"name": "Email", "url": "mailto:3294850673@qq.com", "hint": "联系邮箱"},
    ],
}

MESSAGES: list[dict[str, str]] = []


@app.get("/")
def index():
    return render_template("index.html", profile=PROFILE)


@app.get("/api/profile")
def get_profile():
    return jsonify(PROFILE)


@app.post("/api/contact")
def contact():
    data = request.get_json(silent=True) or {}
    name = str(data.get("name", "")).strip()
    email = str(data.get("email", "")).strip()
    message = str(data.get("message", "")).strip()

    if not name or not email or not message:
        return jsonify({"ok": False, "error": "请完整填写姓名、邮箱和留言内容。"}), 400

    if "@" not in email or "." not in email:
        return jsonify({"ok": False, "error": "请输入有效的邮箱地址。"}), 400

    MESSAGES.append(
        {
            "name": name,
            "email": email,
            "message": message,
            "created_at": datetime.now().isoformat(timespec="seconds"),
        }
    )
    return jsonify({"ok": True, "message": "留言已收到，我会尽快查看。"})


@app.get("/api/messages")
def messages():
    return jsonify({"count": len(MESSAGES), "items": MESSAGES})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
