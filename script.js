const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

async function loadData() {
  try {
    const r = await fetch("./data.json");
    if (!r.ok) throw new Error(r.status);
    return await r.json();
  } catch (e) {
    console.warn("data.json not loaded", e);
    return null;
  }
}

function renderApps(list) {
  const grid = $("#appsGrid");
  grid.innerHTML = list.map((a) => `
    <a class="app-card" href="${esc(a.path)}">
      <div class="app-top">
        <div class="app-icon">${esc(a.icon)}</div>
        <span class="app-num">${esc(a.num)}</span>
      </div>
      <h3 class="app-title">${esc(a.title)}</h3>
      <p class="app-desc">${esc(a.desc)}</p>
      <div class="app-tags">${a.tags.map((t) => `<span>${esc(t)}</span>`).join("")}</div>
      <span class="app-play">▶ Play now</span>
    </a>
  `).join("");
}

async function loadVisitors() {
  const el = $("#visitors");
  if (!el) return;
  const local = "jlb_portfolio_hits";
  try {
    const r = await fetch("https://api.counterapi.dev/v1/jordanlee-portfolio-kcp/home/up");
    if (!r.ok) throw new Error();
    const d = await r.json();
    const v = d.count ?? d.value ?? 0;
    if (v > 0) {
      el.textContent = v.toLocaleString();
      localStorage.setItem(local, v);
      return;
    }
    throw new Error();
  } catch {
    const n = (parseInt(localStorage.getItem(local) || "0", 10) || 0) + 1;
    localStorage.setItem(local, n);
    el.textContent = n.toLocaleString();
  }
}

async function boot() {
  $("#year").textContent = new Date().getFullYear();
  loadVisitors();

  const data = await loadData();
  if (data && data.apps) renderApps(data.apps);
  else $("#appsGrid").innerHTML = '<p class="muted">Could not load data.json. Serve the folder over HTTP.</p>';

  if (data && data.profile) {
    const w = $("#aboutWho"), l = $("#aboutLikes");
    if (w) w.textContent = data.profile.aboutWho || w.textContent;
    if (l) l.textContent = data.profile.aboutLikes || l.textContent;
  }
}

document.addEventListener("DOMContentLoaded", boot);