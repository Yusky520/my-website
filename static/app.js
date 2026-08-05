const siteHeader = document.querySelector(".site-header");
const navToggle = document.getElementById("nav-toggle");
const navLinks = document.querySelectorAll(".site-nav a");
const revealElements = document.querySelectorAll(".reveal");
const backToTop = document.getElementById("back-to-top");
const liveClock = document.getElementById("live-clock");
const clockCurrent = document.getElementById("clock-current");
const clockNext = document.getElementById("clock-next");
const liveDate = document.getElementById("live-date");
const form = document.getElementById("contact-form");
const statusText = document.getElementById("form-status");
const jsonInput = document.getElementById("json-input");
const jsonOutput = document.getElementById("json-output");
const jsonFormat = document.getElementById("json-format");
const jsonMinify = document.getElementById("json-minify");
const passwordLength = document.getElementById("password-length");
const passwordLengthValue = document.getElementById("password-length-value");
const passwordOutput = document.getElementById("password-output");
const passwordGenerate = document.getElementById("password-generate");
const passwordCopy = document.getElementById("password-copy");
const emailToggle = document.getElementById("email-toggle");
const emailValue = document.getElementById("email-value");

let statusTimer = null;
let clockValue = "";

function pad(num) {
  return String(num).padStart(2, "0");
}

function formatClock(date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function formatDate(date) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).format(date);
}

function showStatus(message, type = "success", autoHideMs = 3000) {
  if (!statusText) {
    return;
  }

  window.clearTimeout(statusTimer);
  statusText.textContent = message;
  statusText.classList.remove("is-visible", "is-success", "is-error");

  if (!message) {
    return;
  }

  statusText.classList.add("is-visible", type === "error" ? "is-error" : "is-success");

  if (autoHideMs > 0) {
    statusTimer = window.setTimeout(() => {
      statusText.classList.remove("is-visible", "is-success", "is-error");
      statusText.textContent = "";
    }, autoHideMs);
  }
}

function updateClock(initial = false) {
  if (!liveClock || !clockCurrent || !clockNext || !liveDate) {
    return;
  }

  const now = new Date();
  const nextValue = formatClock(now);
  liveDate.textContent = formatDate(now);

  if (initial || !clockValue) {
    clockCurrent.textContent = nextValue;
    clockNext.textContent = nextValue;
    clockValue = nextValue;
    return;
  }

  if (nextValue === clockValue) {
    return;
  }

  clockNext.textContent = nextValue;
  liveClock.classList.remove("is-ticking");
  void liveClock.offsetWidth;
  liveClock.classList.add("is-ticking");

  window.setTimeout(() => {
    clockCurrent.textContent = nextValue;
    clockNext.textContent = nextValue;
    clockValue = nextValue;
    liveClock.classList.remove("is-ticking");
  }, 540);
}

function scheduleClock() {
  updateClock();
  const delay = 1000 - new Date().getMilliseconds();
  window.setTimeout(scheduleClock, delay);
}

function setupReveal() {
  if (!("IntersectionObserver" in window)) {
    revealElements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  revealElements.forEach((element) => observer.observe(element));
}

function setupNav() {
  if (!siteHeader || !navToggle) {
    return;
  }

  const closeNav = () => {
    siteHeader.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  };

  navToggle.addEventListener("click", () => {
    const isOpen = siteHeader.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth <= 860) {
        closeNav();
      }
    });
  });
}

function setupBackToTop() {
  if (!backToTop) {
    return;
  }

  const toggle = () => {
    backToTop.classList.toggle("is-visible", window.scrollY > 520);
  };

  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  window.addEventListener("scroll", toggle, { passive: true });
  toggle();
}

function randomPassword(length) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*";
  let result = "";

  for (let index = 0; index < length; index += 1) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }

  return result;
}

function updatePasswordLengthLabel() {
  if (passwordLength && passwordLengthValue) {
    passwordLengthValue.textContent = passwordLength.value;
  }
}

function updatePassword() {
  if (!passwordOutput || !passwordLength) {
    return;
  }

  updatePasswordLengthLabel();
  passwordOutput.textContent = randomPassword(Number(passwordLength.value));
}

function renderJson(value) {
  if (!jsonOutput) {
    return;
  }

  jsonOutput.textContent = value;
}

function formatJson(minify = false) {
  if (!jsonInput || !jsonOutput) {
    return;
  }

  const raw = jsonInput.value.trim();
  if (!raw) {
    renderJson("请先输入 JSON 内容");
    return;
  }

  try {
    const parsed = JSON.parse(raw);
    const nextValue = minify ? JSON.stringify(parsed) : JSON.stringify(parsed, null, 2);
    renderJson(nextValue);
  } catch (error) {
    renderJson("JSON 格式不正确，请检查逗号、引号和括号。");
  }
}

async function copyText(text, successMessage) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const temp = document.createElement("textarea");
      temp.value = text;
      temp.setAttribute("readonly", "true");
      temp.style.position = "fixed";
      temp.style.opacity = "0";
      document.body.appendChild(temp);
      temp.select();
      document.execCommand("copy");
      document.body.removeChild(temp);
    }

    showStatus(successMessage, "success", 1800);
  } catch (error) {
    showStatus("复制失败，请手动选择文本。", "error", 2200);
  }
}

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitButton = form.querySelector("button[type='submit']");
    const payload = Object.fromEntries(new FormData(form).entries());

    showStatus("正在发送...", "success", 0);
    submitButton.disabled = true;

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.ok) {
        showStatus("留言已收到，我会尽快查看。", "success", 3000);
        form.reset();
      } else {
        showStatus(result.error || "发送失败，请稍后再试。", "error", 3600);
      }
    } catch (error) {
      showStatus("网络异常，暂时无法发送留言。", "error", 3600);
    } finally {
      submitButton.disabled = false;
    }
  });
}

if (jsonFormat) {
  jsonFormat.addEventListener("click", () => {
    formatJson(false);
  });
}

if (jsonMinify) {
  jsonMinify.addEventListener("click", () => {
    formatJson(true);
  });
}

if (passwordGenerate) {
  passwordGenerate.addEventListener("click", updatePassword);
}

if (passwordLength) {
  passwordLength.addEventListener("input", updatePasswordLengthLabel);
}

if (passwordCopy && passwordOutput) {
  passwordCopy.addEventListener("click", () => {
    copyText(passwordOutput.textContent, "密码已复制");
  });
}

if (emailToggle && emailValue) {
  emailToggle.addEventListener("click", () => {
    const isHidden = emailValue.hasAttribute("hidden");
    if (isHidden) {
      emailValue.removeAttribute("hidden");
      emailToggle.textContent = "点击收起";
      emailToggle.setAttribute("aria-expanded", "true");
    } else {
      emailValue.setAttribute("hidden", "hidden");
      emailToggle.textContent = "点击查看";
      emailToggle.setAttribute("aria-expanded", "false");
    }
  });
}

setupReveal();
setupNav();
setupBackToTop();
updatePassword();
updateClock(true);
scheduleClock();
renderJson("格式化后的内容会显示在这里");
