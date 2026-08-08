const siteHeader = document.querySelector(".site-header");
const navToggle = document.getElementById("nav-toggle");
const navLinks = document.querySelectorAll(".site-nav a");
const revealElements = document.querySelectorAll(".reveal");
const backToTop = document.getElementById("back-to-top");
const toast = document.getElementById("site-toast");
const loadingScreen = document.getElementById("loading-screen");
const themeToggle = document.getElementById("theme-toggle");
const themeText = themeToggle?.querySelector(".theme-toggle__text");
const jsonInput = document.getElementById("json-input");
const jsonOutput = document.getElementById("json-output");
const jsonFormat = document.getElementById("json-format");
const jsonMinify = document.getElementById("json-minify");
const passwordLength = document.getElementById("password-length");
const passwordLengthValue = document.getElementById("password-length-value");
const passwordOutput = document.getElementById("password-output");
const passwordGenerate = document.getElementById("password-generate");
const passwordCopy = document.getElementById("password-copy");
const bannerSlides = Array.from(document.querySelectorAll(".banner-slide"));
const bannerDots = Array.from(document.querySelectorAll(".banner-dot"));
const bannerPrev = document.getElementById("banner-prev");
const bannerNext = document.getElementById("banner-next");
const emailCard = document.getElementById("email-card");
const emailCardHint = document.getElementById("email-card-hint");
const emailCardValue = document.getElementById("email-card-value");

let toastTimer = null;
let activeSlide = 0;
let carouselTimer = null;

function showToast(message, type = "success", autoHideMs = 3000) {
  if (!toast) {
    return;
  }

  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.remove("is-visible", "is-success", "is-error");

  if (!message) {
    return;
  }

  toast.classList.add("is-visible", type === "error" ? "is-error" : "is-success");

  if (autoHideMs > 0) {
    toastTimer = window.setTimeout(() => {
      toast.classList.remove("is-visible", "is-success", "is-error");
      toast.textContent = "";
    }, autoHideMs);
  }
}

function hideLoading() {
  if (loadingScreen) {
    loadingScreen.classList.add("is-hidden");
  }
}

window.addEventListener("load", () => window.setTimeout(hideLoading, 220));
window.setTimeout(hideLoading, 2600);

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

  const toggle = () => backToTop.classList.toggle("is-visible", window.scrollY > 520);
  backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  window.addEventListener("scroll", toggle, { passive: true });
  toggle();
}

function setupTheme() {
  if (!themeToggle) {
    return;
  }

  let savedTheme = "dark";
  try {
    savedTheme = window.localStorage.getItem("yusky-theme") || "dark";
  } catch (error) {
    savedTheme = "dark";
  }

  const applyTheme = (theme) => {
    const isLight = theme === "light";
    document.body.classList.toggle("theme-light", isLight);
    themeToggle.setAttribute("aria-pressed", String(isLight));
    if (themeText) {
      themeText.textContent = isLight ? "深色" : "浅色";
    }
  };

  applyTheme(savedTheme);
  themeToggle.addEventListener("click", () => {
    const nextTheme = document.body.classList.contains("theme-light") ? "dark" : "light";
    applyTheme(nextTheme);
    try {
      window.localStorage.setItem("yusky-theme", nextTheme);
    } catch (error) {
      // The theme remains active for the current page if storage is unavailable.
    }
  });
}

function setupCarousel() {
  if (bannerSlides.length < 2) {
    return;
  }

  const showSlide = (index) => {
    activeSlide = (index + bannerSlides.length) % bannerSlides.length;
    bannerSlides.forEach((slide, slideIndex) => slide.classList.toggle("is-active", slideIndex === activeSlide));
    bannerDots.forEach((dot, dotIndex) => {
      const isActive = dotIndex === activeSlide;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-selected", String(isActive));
    });
  };

  const restartTimer = () => {
    window.clearInterval(carouselTimer);
    carouselTimer = window.setInterval(() => showSlide(activeSlide + 1), 6200);
  };

  bannerPrev?.addEventListener("click", () => {
    showSlide(activeSlide - 1);
    restartTimer();
  });

  bannerNext?.addEventListener("click", () => {
    showSlide(activeSlide + 1);
    restartTimer();
  });

  bannerDots.forEach((dot) => {
    dot.addEventListener("click", () => {
      showSlide(Number(dot.dataset.slide));
      restartTimer();
    });
  });

  const carousel = document.getElementById("banner");
  carousel?.addEventListener("mouseenter", () => window.clearInterval(carouselTimer));
  carousel?.addEventListener("mouseleave", restartTimer);
  carousel?.addEventListener("focusin", () => window.clearInterval(carouselTimer));
  carousel?.addEventListener("focusout", restartTimer);

  showSlide(0);
  restartTimer();
}

function setupEmailCard() {
  if (!emailCard || !emailCardHint || !emailCardValue) {
    return;
  }

  emailCard.addEventListener("click", () => {
    const isHidden = emailCardValue.hasAttribute("hidden");
    if (isHidden) {
      emailCardValue.removeAttribute("hidden");
      emailCard.classList.add("is-revealed");
      emailCardHint.textContent = "点击收起邮箱";
      emailCard.setAttribute("aria-expanded", "true");
    } else {
      emailCardValue.setAttribute("hidden", "hidden");
      emailCard.classList.remove("is-revealed");
      emailCardHint.textContent = "点击查看邮箱";
      emailCard.setAttribute("aria-expanded", "false");
    }
  });
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
  if (jsonOutput) {
    jsonOutput.textContent = value;
  }
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
    renderJson(minify ? JSON.stringify(parsed) : JSON.stringify(parsed, null, 2));
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

    showToast(successMessage, "success", 1800);
  } catch (error) {
    showToast("复制失败，请手动选择文本。", "error", 2200);
  }
}

if (jsonFormat) {
  jsonFormat.addEventListener("click", () => formatJson(false));
}

if (jsonMinify) {
  jsonMinify.addEventListener("click", () => formatJson(true));
}

if (passwordGenerate) {
  passwordGenerate.addEventListener("click", updatePassword);
}

if (passwordLength) {
  passwordLength.addEventListener("input", updatePasswordLengthLabel);
}

if (passwordCopy && passwordOutput) {
  passwordCopy.addEventListener("click", () => copyText(passwordOutput.textContent, "密码已复制"));
}

setupReveal();
setupEmailCard();
setupNav();
setupBackToTop();
setupTheme();
setupCarousel();
updatePassword();
renderJson("格式化后的内容会显示在这里");
