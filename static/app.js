function renderHeroStats(items) {
  const container = document.getElementById("hero-stats");
  container.innerHTML = items
    .map(
      (item) => `
        <div class="hero-stat">
          <strong>${item.value}</strong>
          <span>${item.label}</span>
        </div>
      `
    )
    .join("");
}

function renderQuickNotes(items) {
  const container = document.getElementById("quick-notes");
  container.innerHTML = items
    .map((item) => `<div class="note-item">${item}</div>`)
    .join("");
}

function renderChipList(elementId, items) {
  const container = document.getElementById(elementId);
  container.innerHTML = items
    .map((item) => `<span class="chip">${item}</span>`)
    .join("");
}

function renderFocus(items) {
  const container = document.getElementById("focus-grid");
  container.innerHTML = items
    .map(
      (item) => `
        <article class="focus-card glass">
          <p class="section-label">FOCUS</p>
          <h4>${item.title}</h4>
          <p>${item.description}</p>
        </article>
      `
    )
    .join("");
}

function renderProjects(projects) {
  const container = document.getElementById("projects-list");
  container.innerHTML = projects
    .map(
      (project) => `
        <article class="project-card">
          <span class="project-type">${project.type}</span>
          <h4>${project.name}</h4>
          <p>${project.description}</p>
          <div class="tags">
            ${project.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
          </div>
        </article>
      `
    )
    .join("");
}

function renderTimeline(items) {
  const container = document.getElementById("timeline");
  container.innerHTML = items
    .map(
      (item) => `
        <article class="timeline-item">
          <span class="period">${item.period}</span>
          <h4>${item.title}</h4>
          <p>${item.description}</p>
        </article>
      `
    )
    .join("");
}

function renderLinks(links) {
  const container = document.getElementById("links");
  container.innerHTML = links
    .map(
      (link) => `
        <a class="link-card" href="${link.url}" target="_blank" rel="noreferrer">
          <strong>${link.name}</strong>
          <p>${link.hint}</p>
        </a>
      `
    )
    .join("");
}

async function loadProfile() {
  const response = await fetch("/api/profile");
  if (!response.ok) {
    throw new Error("Failed to load profile");
  }

  const profile = await response.json();
  document.getElementById("subtitle").textContent = profile.subtitle;
  document.getElementById("nickname").textContent = profile.nickname;
  document.getElementById("title").textContent = profile.title;
  document.getElementById("tagline").textContent = profile.tagline;
  document.getElementById("about-text").textContent = profile.about;

  renderHeroStats(profile.hero_stats);
  renderQuickNotes(profile.quick_notes);
  renderChipList("skills", profile.skills);
  renderChipList("hobbies", profile.hobbies);
  renderFocus(profile.focus);
  renderProjects(profile.projects);
  renderTimeline(profile.timeline);
  renderLinks(profile.links);
}

function formatTimeParts(date) {
  const time = new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);

  const dateText = new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).format(date);

  return { time, dateText };
}

function startLiveClock() {
  const clock = document.getElementById("live-clock");
  const current = document.getElementById("clock-current");
  const next = document.getElementById("clock-next");
  const dateNode = document.getElementById("live-date");

  let currentTime = "";

  const paint = (initial = false) => {
    const now = new Date();
    const { time, dateText } = formatTimeParts(now);
    dateNode.textContent = dateText;

    if (initial || !currentTime) {
      current.textContent = time;
      next.textContent = time;
      currentTime = time;
      return;
    }

    if (time === currentTime) {
      return;
    }

    next.textContent = time;
    clock.classList.remove("is-ticking");
    void clock.offsetWidth;
    clock.classList.add("is-ticking");

    window.setTimeout(() => {
      current.textContent = time;
      next.textContent = time;
      currentTime = time;
      clock.classList.remove("is-ticking");
    }, 540);
  };

  paint(true);

  const schedule = () => {
    const now = new Date();
    const delay = 1000 - now.getMilliseconds();
    window.setTimeout(() => {
      paint();
      schedule();
    }, delay);
  };

  schedule();
}

async function handleContactSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const status = document.getElementById("form-status");
  const payload = Object.fromEntries(new FormData(form).entries());

  status.textContent = "发送中...";

  const response = await fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!response.ok) {
    status.textContent = result.error || "发送失败，请稍后再试。";
    return;
  }

  form.reset();
  status.textContent = result.message;
}

document.getElementById("contact-form").addEventListener("submit", (event) => {
  handleContactSubmit(event).catch(() => {
    document.getElementById("form-status").textContent = "发送失败，请稍后再试。";
  });
});

loadProfile().catch(() => {
  document.getElementById("form-status").textContent = "页面数据加载失败。";
});

startLiveClock();
