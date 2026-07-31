const clock = document.getElementById("clock");
const form = document.getElementById("contact-form");
const statusText = document.getElementById("form-status");
let statusTimer = null;

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

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitButton = form.querySelector("button[type='submit']");
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

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
        showStatus(result.message || "发送失败，请稍后再试。", "error", 3600);
      }
    } catch (error) {
      showStatus("网络异常，暂时无法发送邮件。", "error", 3600);
    } finally {
      submitButton.disabled = false;
    }
  });
}
