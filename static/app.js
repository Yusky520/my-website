const clock = document.getElementById("clock");
const form = document.getElementById("contact-form");
const toast = document.getElementById("toast");
let toastTimer = null;

function pad(num) {
  return String(num).padStart(2, "0");
}

function formatTime(date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

let previous = "";

function updateClock() {
  const now = new Date();
  const nextValue = formatTime(now);

  if (nextValue !== previous && clock) {
    clock.classList.add("is-changing");
    window.setTimeout(() => {
      clock.textContent = nextValue;
      clock.classList.remove("is-changing");
    }, 120);
    previous = nextValue;
  }
}

updateClock();
window.setInterval(updateClock, 1000);

function showToast(message, type = "success", autoHideMs = 3000) {
  if (!toast) {
    return;
  }

  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.className = `toast is-visible ${type === "error" ? "is-error" : "is-success"}`;

  if (autoHideMs > 0) {
    toastTimer = window.setTimeout(() => {
      toast.classList.remove("is-visible");
    }, autoHideMs);
  }
}

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitButton = form.querySelector("button[type='submit']");
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

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
        showToast("留言已收到，我会尽快查看。", "success", 3000);
        form.reset();
      } else {
        showToast(result.message || "发送失败，请稍后再试。", "error", 3600);
      }
    } catch (error) {
      showToast("网络异常，暂时无法发送邮件。", "error", 3600);
    } finally {
      submitButton.disabled = false;
    }
  });
}
