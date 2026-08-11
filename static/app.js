const siteHeader = document.querySelector(".site-header");
const navToggle = document.getElementById("nav-toggle");
const navLinks = document.querySelectorAll(".site-nav a");
const revealElements = document.querySelectorAll(".reveal");
const backToTop = document.getElementById("back-to-top");
const toast = document.getElementById("site-toast");
const loadingScreen = document.getElementById("loading-screen");
const backgroundVideo = document.querySelector(".background-video");
const themeToggle = document.getElementById("theme-toggle");
const themeText = themeToggle?.querySelector(".theme-toggle__text");
const bannerSlides = Array.from(document.querySelectorAll(".banner-slide"));
const bannerDots = Array.from(document.querySelectorAll(".banner-dot"));
const bannerPrev = document.getElementById("banner-prev");
const bannerNext = document.getElementById("banner-next");
const emailCard = document.getElementById("email-card");
const emailCardHint = document.getElementById("email-card-hint");
const emailCardValue = document.getElementById("email-card-value");
const projectCards = Array.from(document.querySelectorAll(".project-card"));
const filterButtons = Array.from(document.querySelectorAll(".filter-btn"));
const hexInput = document.getElementById("hex-input");
const colorPicker = document.getElementById("color-picker");
const redInput = document.getElementById("red-input");
const greenInput = document.getElementById("green-input");
const blueInput = document.getElementById("blue-input");
const colorPreview = document.getElementById("color-preview");
const colorHexOutput = document.getElementById("color-hex-output");
const colorRgbOutput = document.getElementById("color-rgb-output");
const colorFromHex = document.getElementById("color-from-hex");
const colorFromRgb = document.getElementById("color-from-rgb");
const colorCopy = document.getElementById("color-copy");
const timestampInput = document.getElementById("timestamp-input");
const dateInput = document.getElementById("date-input");
const timestampToDate = document.getElementById("timestamp-to-date");
const dateToTimestamp = document.getElementById("date-to-timestamp");
const timestampOutput = document.getElementById("timestamp-output");
const timestampClear = document.getElementById("timestamp-clear");
const timestampCopy = document.getElementById("timestamp-copy");
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightbox-image");
const lightboxCaption = document.getElementById("lightbox-caption");
const lightboxClose = document.getElementById("lightbox-close");
const lightboxTriggers = Array.from(document.querySelectorAll(".lightbox-trigger"));

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
  loadingScreen?.classList.add("is-hidden");
}

window.addEventListener("load", () => window.setTimeout(hideLoading, 220));
window.setTimeout(hideLoading, 2600);

function setupBackgroundVideo() {
  if (!backgroundVideo) {
    return;
  }

  const loadVideo = () => {
    const sources = Array.from(backgroundVideo.querySelectorAll("source[data-src]"));
    if (!sources.length) {
      return;
    }

    sources.forEach((source) => {
      source.src = source.dataset.src;
      source.removeAttribute("data-src");
    });

    backgroundVideo.load();
    const playPromise = backgroundVideo.play();
    playPromise?.catch(() => {});
  };

  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(loadVideo, { timeout: 1000 });
  } else {
    window.setTimeout(loadVideo, 500);
  }
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

  const toggle = () => backToTop.classList.toggle("is-visible", window.scrollY > 300);
  backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  window.addEventListener("scroll", toggle, { passive: true });
  toggle();
}

function setupPageReturn() {
  if (!document.body.classList.contains("page-body")) {
    return;
  }

  const pageReturn = document.createElement("button");
  pageReturn.className = "page-return";
  pageReturn.type = "button";
  pageReturn.setAttribute("aria-label", "返回上一页");
  pageReturn.innerHTML = "<span aria-hidden=\"true\">←</span><span>返回上一页</span>";

  pageReturn.addEventListener("click", () => {
    let sameSiteReferrer = false;
    try {
      sameSiteReferrer = Boolean(document.referrer) && new URL(document.referrer).origin === window.location.origin;
    } catch (error) {
      sameSiteReferrer = false;
    }

    if (sameSiteReferrer && window.history.length > 1) {
      window.history.back();
      return;
    }

    window.location.href = "index.html#home";
  });

  document.body.appendChild(pageReturn);
}

function setupLightbox() {
  if (!lightbox || !lightboxImage || !lightboxClose || !lightboxTriggers.length) {
    return;
  }

  let lastTrigger = null;

  const closeLightbox = () => {
    lightbox.hidden = true;
    document.body.classList.remove("lightbox-open");
    lightboxImage.removeAttribute("src");
    lightboxImage.alt = "";
    if (lightboxCaption) {
      lightboxCaption.textContent = "";
    }
    lastTrigger?.focus();
  };

  const openLightbox = (trigger) => {
    const source = trigger.dataset.lightboxSrc;
    if (!source) {
      return;
    }

    lastTrigger = trigger;
    lightboxImage.src = source;
    lightboxImage.alt = trigger.dataset.lightboxAlt || "";
    if (lightboxCaption) {
      lightboxCaption.textContent = trigger.dataset.lightboxAlt || "";
    }
    lightbox.hidden = false;
    document.body.classList.add("lightbox-open");
    lightboxClose.focus();
  };

  lightboxTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => openLightbox(trigger));
  });

  lightboxClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !lightbox.hidden) {
      closeLightbox();
    }
  });
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
      // Theme still works for the current page when storage is unavailable.
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

function setupProjectFilter() {
  if (!projectCards.length || !filterButtons.length) {
    return;
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter || "all";
      filterButtons.forEach((item) => item.classList.toggle("is-active", item === button));
      projectCards.forEach((card) => {
        const visible = filter === "all" || card.dataset.category === filter;
        card.classList.toggle("is-filtered-out", !visible);
      });
    });
  });
}

function normalizeHex(value) {
  const raw = value.trim().replace(/^#/, "");
  if (/^[0-9a-f]{3}$/i.test(raw)) {
    return `#${raw.split("").map((char) => char + char).join("")}`.toUpperCase();
  }
  if (/^[0-9a-f]{6}$/i.test(raw)) {
    return `#${raw}`.toUpperCase();
  }
  return null;
}

function hexToRgb(value) {
  const hex = normalizeHex(value);
  if (!hex) {
    return null;
  }

  const number = Number.parseInt(hex.slice(1), 16);
  return {
    hex,
    red: (number >> 16) & 255,
    green: (number >> 8) & 255,
    blue: number & 255,
  };
}

function rgbToHex(red, green, blue) {
  const values = [red, green, blue].map((value) => Math.min(255, Math.max(0, Number(value) || 0)));
  return `#${values.map((value) => Math.round(value).toString(16).padStart(2, "0")).join("")}`.toUpperCase();
}

function renderColor(hex, red, green, blue) {
  if (!colorPreview || !colorHexOutput || !colorRgbOutput) {
    return;
  }

  colorPreview.style.background = hex;
  if (colorPicker) {
    colorPicker.value = hex;
  }
  colorHexOutput.textContent = hex;
  colorRgbOutput.textContent = `RGB(${red}, ${green}, ${blue})`;
}

function setupColorTool() {
  if (!hexInput || !colorPicker || !redInput || !greenInput || !blueInput) {
    return;
  }

  const applyHex = () => {
    const color = hexToRgb(hexInput.value);
    if (!color) {
      showToast("请输入正确的 HEX 颜色值。", "error", 2200);
      return;
    }

    hexInput.value = color.hex;
    redInput.value = color.red;
    greenInput.value = color.green;
    blueInput.value = color.blue;
    renderColor(color.hex, color.red, color.green, color.blue);
  };

  const applyRgb = () => {
    const red = Math.min(255, Math.max(0, Number(redInput.value) || 0));
    const green = Math.min(255, Math.max(0, Number(greenInput.value) || 0));
    const blue = Math.min(255, Math.max(0, Number(blueInput.value) || 0));
    const hex = rgbToHex(red, green, blue);
    hexInput.value = hex;
    redInput.value = red;
    greenInput.value = green;
    blueInput.value = blue;
    renderColor(hex, red, green, blue);
  };

  colorPicker.addEventListener("input", () => {
    hexInput.value = colorPicker.value;
    applyHex();
  });
  hexInput.addEventListener("input", () => {
    if (hexToRgb(hexInput.value)) {
      applyHex();
    }
  });
  [redInput, greenInput, blueInput].forEach((input) => input.addEventListener("input", applyRgb));
  colorFromHex?.addEventListener("click", applyHex);
  colorFromRgb?.addEventListener("click", applyRgb);
  colorCopy?.addEventListener("click", () => copyText(hexInput.value, "HEX 颜色已复制"));
  applyHex();
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function formatDateTime(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function setupTimestampTool() {
  if (!timestampInput || !dateInput || !timestampOutput) {
    return;
  }

  timestampToDate?.addEventListener("click", () => {
    const raw = timestampInput.value.trim();
    const numeric = Number(raw);
    if (!raw || !Number.isFinite(numeric)) {
      showToast("请输入有效的时间戳。", "error", 2200);
      return;
    }

    const date = new Date(raw.length <= 10 ? numeric * 1000 : numeric);
    if (Number.isNaN(date.getTime())) {
      showToast("时间戳无法转换。", "error", 2200);
      return;
    }

    dateInput.value = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    timestampOutput.textContent = formatDateTime(date);
  });

  dateToTimestamp?.addEventListener("click", () => {
    const date = new Date(dateInput.value);
    if (!dateInput.value || Number.isNaN(date.getTime())) {
      showToast("请选择有效的日期时间。", "error", 2200);
      return;
    }

    const milliseconds = date.getTime();
    timestampOutput.textContent = `秒：${Math.floor(milliseconds / 1000)}\n毫秒：${milliseconds}`;
  });
  timestampClear?.addEventListener("click", () => {
    timestampInput.value = "";
    dateInput.value = "";
    timestampOutput.textContent = "转换结果会显示在这里";
  });

  timestampCopy?.addEventListener("click", () => {
    const result = timestampOutput.textContent.trim();
    if (!result || result === "转换结果会显示在这里") {
      showToast("请先生成转换结果。", "error", 2200);
      return;
    }
    copyText(result, "时间戳结果已复制");
  });
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

setupBackgroundVideo();
setupReveal();
setupEmailCard();
setupNav();
setupBackToTop();
setupPageReturn();
setupLightbox();
setupTheme();
setupCarousel();
setupProjectFilter();
setupColorTool();
setupTimestampTool();
