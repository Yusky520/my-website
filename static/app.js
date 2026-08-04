const loadingScreen = document.getElementById("loading-screen");
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
const timestampText = document.getElementById("timestamp-text");
const timestampIso = document.getElementById("timestamp-iso");
const timestampCopy = document.getElementById("timestamp-copy");
const passwordLength = document.getElementById("password-length");
const passwordLengthValue = document.getElementById("password-length-value");
const passwordOutput = document.getElementById("password-output");
const passwordGenerate = document.getElementById("password-generate");
const passwordCopy = document.getElementById("password-copy");

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

function formatTimestamp(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${formatClock(date)}`;
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

function setupLoading() {
  if (!loadingScreen) {
    return;
  }

  const hide = () => loadingScreen.classList.add("is-hidden");
  window.addEventListener("load", () => {
    window.setTimeout(hide, 260);
  });
  window.setTimeout(hide, 2500);
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

function updateTimestamp() {
  if (!timestampText || !timestampIso) {
    return;
  }

  const now = new Date();
  timestampText.textContent = String(Math.floor(now.getTime() / 1000));
  timestampIso.textContent = formatTimestamp(now);
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

if (timestampCopy && timestampText) {
  timestampCopy.addEventListener("click", () => {
    copyText(timestampText.textContent, "时间戳已复制");
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

setupLoading();
setupReveal();
setupNav();
setupBackToTop();
updatePassword();
updateTimestamp();
updateClock(true);
scheduleClock();
window.setInterval(updateTimestamp, 1000);
