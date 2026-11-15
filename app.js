/* Mes Events — stockage local (localStorage) */

const STORAGE_KEY = "mes_events_v1";

const COUNTRIES = {
  MA: "🇲🇦 L-Maghrib", FR: "🇫🇷 France", ES: "🇪🇸 Espagne", PT: "🇵🇹 Portugal",
  US: "🇺🇸 États-Unis", GB: "🇬🇧 UK", DE: "🇩🇪 Allemagne", AE: "🇦🇪 Émirats",
  SA: "🇸🇦 Arabie Saoudite", QA: "🇶🇦 Qatar", EG: "🇪🇬 Miṣr", TN: "🇹🇳 Tunisie",
  DZ: "🇩🇿 Dzayer", OTHER: "🌍 Autre"
};

const CATEGORIES = {
  musique: "🎵 Musique", sport: "⚽ Sport", culture: "🎭 Culture",
  tech: "💻 Tech", voyage: "✈️ Voyage", autre: "📌 Autre"
};

const MONTHS_FR = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];

/* ------- Events d'exemple (ghadi yt3awdu b les ti dyalk) ------- */
const SEED_EVENTS = [
  { title: "Festival Gnaoua et Musiques du Monde", date: "2027-02-25", time: "18:00", country: "MA", city: "Essaouira", category: "musique", description: "Festival dial l-musique gnaoua m3a fannanine men kol l3alam.", link: "https://www.festivalgnaoua.ma" },
  { title: "Marathon International de Marrakech", date: "2027-04-18", time: "07:00", country: "MA", city: "Marrakech", category: "sport", description: "Marathon dyal Marrakech — 42km 3abr l-madina l-7amra.", link: "" },
  { title: "SIAM — Salon International de l'Agriculture", date: "2027-04-28", time: "09:00", country: "MA", city: "Meknès", category: "culture", description: "Akbar salon dyal l-fila7a f l-Maghrib.", link: "" },
  { title: "Mawazine — Rythmes du Monde", date: "2027-06-18", time: "17:00", country: "MA", city: "Rabat", category: "musique", description: "Festival international dyal l-musique f Rabat.", link: "https://www.mawazine.ma" },
  { title: "Coupe du Monde FIFA 2030", date: "2030-06-11", time: "20:00", country: "MA", city: "Casablanca / Rabat / Tanger", category: "sport", description: "L-Maghrib m3a Espagne w Portugal istadaru l-Kas dyal l-3alam 2030 🏆", link: "https://www.fifa.com" },
  { title: "Web Summit Rio", date: "2027-05-03", time: "09:00", country: "OTHER", city: "Rio de Janeiro, Brésil", category: "tech", description: "Wa7d men akbar les conferences dyal l-technologie f l3alam.", link: "https://websummit.com" },
  { title: "Mobile World Congress (MWC)", date: "2027-02-22", time: "09:00", country: "ES", city: "Barcelone, Espagne", category: "tech", description: "Akbar event dyal l-mobile w l-telecom f l3alam.", link: "https://www.mwcbarcelona.com" },
  { title: "Expo 2030", date: "2030-10-01", time: "10:00", country: "SA", city: "Riyad, Arabie Saoudite", category: "voyage", description: "Exposition universelle 2030 f Riyad.", link: "https://expo2030riyadh.sa" }
];

/* ------- State ------- */
let events = load();
let regionFilter = "all";
let categoryFilter = "all";
let searchQuery = "";
let sortOrder = "asc";

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* ignore */ }
  const seeded = SEED_EVENTS.map(e => ({ ...e, id: uid() }));
  save(seeded);
  return seeded;
}

function save(data = events) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/* ------- Helpers ------- */
function fmtDate(dateStr, time) {
  const d = new Date(dateStr + (time ? "T" + time : "T00:00:00"));
  const datePart = `${d.getDate()} ${MONTHS_FR[d.getMonth()]} ${d.getFullYear()}`;
  return time ? `${datePart} — ${time}` : datePart;
}

function isPast(ev) {
  const d = new Date(ev.date + (ev.time ? "T" + ev.time : "T23:59:59"));
  return d < new Date();
}

function regionOf(ev) {
  return ev.country === "MA" ? "ma" : "world";
}

/* ------- Render ------- */
const grid = document.getElementById("eventsGrid");
const emptyMsg = document.getElementById("emptyMsg");
const statsEl = document.getElementById("stats");
const countdownEl = document.getElementById("countdown");

function filtered() {
  let list = events.filter(ev => {
    if (regionFilter !== "all" && regionOf(ev) !== regionFilter) return false;
    if (categoryFilter !== "all" && ev.category !== categoryFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const hay = `${ev.title} ${ev.city || ""} ${COUNTRIES[ev.country] || ""} ${ev.description || ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  list.sort((a, b) => {
    const da = a.date + (a.time || ""), db = b.date + (b.time || "");
    return sortOrder === "asc" ? da.localeCompare(db) : db.localeCompare(da);
  });
  return list;
}

function render() {
  const list = filtered();
  grid.innerHTML = "";
  emptyMsg.hidden = list.length > 0;

  for (const ev of list) {
    const d = new Date(ev.date + "T00:00:00");
    const card = document.createElement("article");
    card.className = "card" + (isPast(ev) ? " past" : "");

    card.innerHTML = `
      <div class="date-badge">
        <span class="day">${d.getDate()}</span>
        <span class="month">${MONTHS_FR[d.getMonth()]}</span>
        <span class="year">${d.getFullYear()}</span>
      </div>
      <div class="card-body">
        <h3>${escapeHtml(ev.title)}</h3>
        <p class="meta">📍 ${escapeHtml(ev.city || "—")} &nbsp;·&nbsp; ${COUNTRIES[ev.country] || ev.country}</p>
        <p class="meta">🕐 ${fmtDate(ev.date, ev.time)}${isPast(ev) ? ' &nbsp;·&nbsp; <b>✅ mši</b>' : ""}</p>
        <span class="chip">${CATEGORIES[ev.category] || ev.category}</span>
        <span class="chip ${regionOf(ev) === "ma" ? "region-ma" : ""}">${regionOf(ev) === "ma" ? "🇲🇦 Maghrib" : "🌍 3alam"}</span>
        ${ev.description ? `<p class="desc">${escapeHtml(ev.description)}</p>` : ""}
        <div class="card-actions">
          ${ev.link ? `<a href="${escapeAttr(ev.link)}" target="_blank" rel="noopener" class="btn btn-small btn-link">🔗 Lien</a>` : ""}
          <button class="btn btn-small btn-ghost" data-edit="${ev.id}">✏️ Bddel</button>
          <button class="btn btn-small btn-danger" data-del="${ev.id}">🗑️ Msa7</button>
        </div>
      </div>`;
    grid.appendChild(card);
  }

  renderStats();
  renderCountdown();
}

function renderStats() {
  const upcoming = events.filter(e => !isPast(e));
  const ma = upcoming.filter(e => regionOf(e) === "ma").length;
  const world = upcoming.filter(e => regionOf(e) === "world").length;
  statsEl.innerHTML = `
    <div class="stat"><b>${upcoming.length}</b><span>Event jay</span></div>
    <div class="stat"><b>${ma}</b><span>🇲🇦 F l-Maghrib</span></div>
    <div class="stat"><b>${world}</b><span>🌍 F l-3alam</span></div>
    <div class="stat"><b>${events.length}</b><span>Majmou3</span></div>`;
}

function renderCountdown() {
  const next = events.filter(e => !isPast(e)).sort((a, b) =>
    (a.date + (a.time || "")).localeCompare(b.date + (b.time || "")))[0];
  if (!next) { countdownEl.textContent = ""; return; }
  const target = new Date(next.date + (next.time ? "T" + next.time : "T00:00:00"));
  const diff = target - new Date();
  const days = Math.floor(diff / 86400000);
  countdownEl.textContent = `⏳ L-event l-9rib: « ${next.title} » — ba9i ${days} yom${days > 1 ? "at" : ""}`;
}

function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function escapeAttr(s) { return escapeHtml(s); }

/* ------- Modal ------- */
const modal = document.getElementById("modal");
const form = document.getElementById("eventForm");
const modalTitle = document.getElementById("modalTitle");

function openModal(ev = null) {
  form.reset();
  document.getElementById("eventId").value = ev ? ev.id : "";
  modalTitle.textContent = ev ? "✏️ Bddel l'event" : "＋ Zid event jdid";
  if (ev) {
    document.getElementById("title").value = ev.title;
    document.getElementById("date").value = ev.date;
    document.getElementById("time").value = ev.time || "";
    document.getElementById("country").value = ev.country;
    document.getElementById("city").value = ev.city || "";
    document.getElementById("category").value = ev.category;
    document.getElementById("description").value = ev.description || "";
    document.getElementById("link").value = ev.link || "";
  }
  modal.hidden = false;
  document.getElementById("title").focus();
}
function closeModal() { modal.hidden = true; }

document.getElementById("btnAdd").addEventListener("click", () => openModal());
document.getElementById("btnCancel").addEventListener("click", closeModal);
modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

form.addEventListener("submit", e => {
  e.preventDefault();
  const id = document.getElementById("eventId").value;
  const data = {
    title: document.getElementById("title").value.trim(),
    date: document.getElementById("date").value,
    time: document.getElementById("time").value,
    country: document.getElementById("country").value,
    city: document.getElementById("city").value.trim(),
    category: document.getElementById("category").value,
    description: document.getElementById("description").value.trim(),
    link: document.getElementById("link").value.trim()
  };
  if (!data.title || !data.date) return;

  if (id) {
    events = events.map(ev => ev.id === id ? { ...ev, ...data, id } : ev);
  } else {
    events.push({ ...data, id: uid() });
  }
  save();
  closeModal();
  render();
});

/* ------- Actions (edit / delete) ------- */
grid.addEventListener("click", e => {
  const editBtn = e.target.closest("[data-edit]");
  const delBtn = e.target.closest("[data-del]");
  if (editBtn) {
    const ev = events.find(x => x.id === editBtn.dataset.edit);
    if (ev) openModal(ev);
  }
  if (delBtn) {
    if (confirm("Sure bghiti tmsa7 had l'event?")) {
      events = events.filter(x => x.id !== delBtn.dataset.del);
      save();
      render();
    }
  }
});

/* ------- Filters ------- */
document.getElementById("regionTabs").addEventListener("click", e => {
  const tab = e.target.closest(".tab");
  if (!tab) return;
  regionFilter = tab.dataset.region;
  document.querySelectorAll(".tab").forEach(t => t.classList.toggle("active", t === tab));
  render();
});

document.getElementById("categoryFilter").addEventListener("change", e => {
  categoryFilter = e.target.value;
  render();
});
document.getElementById("sort").addEventListener("change", e => {
  sortOrder = e.target.value;
  render();
});
document.getElementById("search").addEventListener("input", e => {
  searchQuery = e.target.value.trim();
  render();
});

/* ------- Init ------- */
render();
