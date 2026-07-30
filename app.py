from __future__ import annotations

import os
from datetime import datetime

from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

PROFILE = {
    "nickname": "Yusky521",
    "subtitle": "PERSONAL WEBSITE",
    "title": "Creative Developer / AI Explorer",
    "tagline": "在视觉、代码和表达之间，做一个有记忆点的个人空间。",
    "about": (
        "我在学习 Python、计算机视觉和网页创作，也喜欢把页面做得更有氛围。"
        "这个站点会持续记录我的项目、兴趣方向和最近在尝试的新东西。"
    ),
    "hero_stats": [
        {"value": "03", "label": "精选项目"},
        {"value": "09", "label": "常用技能"},
        {"value": "04", "label": "兴趣爱好"},
    ],
    "quick_notes": [
        "偏好氛围感页面与动态背景",
        "在做视觉基础与目标检测练习",
        "后续会继续补充真实作品与经历",
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
    "focus": [
        {
            "title": "网页设计感",
            "description": "做更完整的首屏视觉、动效节奏和内容编排。",
        },
        {
            "title": "视觉学习",
            "description": "从基础图像处理到轻量模型练习，持续积累计算机视觉经验。",
        },
        {
            "title": "个人表达",
            "description": "把兴趣、技能和项目整理成一个更像作品而不是简历的页面。",
        },
    ],
    "projects": [
        {
            "name": "Vision Starter",
            "type": "Computer Vision",
            "description": "面向初学阶段的视觉实验页，用于整理图像处理、推理测试和训练记录。",
            "tags": ["OpenCV", "PyTorch"],
        },
        {
            "name": "YOLO Practice",
            "type": "Detection Demo",
            "description": "一个可继续扩展的目标检测展示区，后续会接入更多真实结果图和视频。",
            "tags": ["YOLOv8", "Flask"],
        },
        {
            "name": "Personal Landing",
            "type": "Web Experience",
            "description": "以视频背景、玻璃拟态和卡片布局构成的个人主页模板。",
            "tags": ["HTML", "CSS", "Qt"],
        },
    ],
    "timeline": [
        {
            "period": "现在",
            "title": "搭建个人网站",
            "description": "先完成风格化首页，再逐步添加真实内容、项目细节和更多交互。",
        },
        {
            "period": "近期",
            "title": "学习视觉基础",
            "description": "继续练习 OpenCV、PyTorch 与 YOLOv8，把基础知识串成可展示的小项目。",
        },
        {
            "period": "后续",
            "title": "沉淀作品集",
            "description": "把网页作品、视觉实验和学习路线整理为更完整的个人档案。",
        },
    ],
    "links": [
        {"name": "GitHub", "url": "#", "hint": "代码仓库"},
        {"name": "Email", "url": "mailto:yusky521@example.com", "hint": "联系邮箱"},
    ],
}

MESSAGES: list[dict[str, str]] = []


@app.get("/")
def index():
    return render_template("index.html")


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
        return jsonify({"ok": False, "error": "请完整填写表单。"}), 400

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
