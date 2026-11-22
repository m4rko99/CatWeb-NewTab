const KEY = "newtab_shortcuts_v1";
const DEFAULTS = [{ name: "Settings", url: "chrome://settings", icon: "gear", default: true }];

// every shortcut (including the default) can be edited and removed
const isDefault = () => false;

const GEAR = '<svg viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.61-.22l-2.39.96a7.03 7.03 0 0 0-1.62-.94l-.36-2.54a.49.49 0 0 0-.48-.41h-3.84a.49.49 0 0 0-.48.41l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96a.5.5 0 0 0-.61.22L2.71 8.84a.5.5 0 0 0 .12.64l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58a.5.5 0 0 0-.12.64l1.92 3.32c.13.22.39.31.61.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.25.41.48.41h3.84c.24 0 .44-.17.48-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.09.48 0 .61-.22l1.92-3.32a.5.5 0 0 0-.12-.64l-2.03-1.58zM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2z"/></svg>';
const DOTS = '<svg viewBox="0 0 24 24"><path d="M12 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/></svg>';
const PLUS ='<svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>';
const GLOBE = '<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm6.93 6h-2.95a15.65 15.65 0 0 0-1.38-3.56A8.03 8.03 0 0 1 18.93 8zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14a8.2 8.2 0 0 1 0-4h3.38a16.5 16.5 0 0 0 0 4H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56A7.99 7.99 0 0 1 5.08 16zm2.95-8H5.08a7.99 7.99 0 0 1 4.33-3.56A15.65 15.65 0 0 0 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66a14.7 14.7 0 0 1 0-4h4.68a14.7 14.7 0 0 1 0 4zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95a8.03 8.03 0 0 1-4.33 3.56zM16.36 14a16.5 16.5 0 0 0 0-4h3.38a8.2 8.2 0 0 1 0 4h-3.38z"/></svg>';

const $ = (id) => document.getElementById(id);
const list = $("shortcuts");

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return DEFAULTS.map((s) => ({ ...s }));
}
function save(items) {
  try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) {}
}

let items = load();

function normalizeUrl(u) {
  u = u.trim();
  if (!u) return "";
  if (/^[a-z][a-z0-9+.-]*:/i.test(u)) return u;
  return "https://" + u;
}

// chrome://, edge:// etc. can't be opened with a normal link, so go through the tabs api
const IN_EXT = typeof chrome !== "undefined" && !!(chrome.runtime && chrome.runtime.id);

function isInternal(url) {
  return /^(chrome|edge|brave|about|chrome-extension):/i.test(url);
}
function go(url) {
  if (isInternal(url)) {
    if (IN_EXT && chrome.tabs) chrome.tabs.update({ url });
    else alert("chrome:// links only open from the installed extension");
  } else {
    location.href = url;
  }
}

function faviconUrl(pageUrl) {
  if (!IN_EXT) {
    return "https://www.google.com/s2/favicons?sz=32&domain_url=" + encodeURIComponent(pageUrl);
  }
  const u = new URL(chrome.runtime.getURL("/_favicon/"));
  u.searchParams.set("pageUrl", pageUrl);
  u.searchParams.set("size", "32");
  return u.toString();
}

function render() {
  list.innerHTML = "";
  items.forEach((s, i) => {
    const a = document.createElement("a");
    a.className = "sc";
    a.href = isInternal(s.url) ? "#" : s.url;
    a.title = s.url;

    const ico = document.createElement("div");
    ico.className = "ico";
    if (s.icon === "gear") {
      ico.innerHTML = GEAR;
    } else {
      const img = document.createElement("img");
      img.alt = "";
      img.src = faviconUrl(s.url);
      img.onerror = () => { ico.innerHTML = GLOBE; };
      ico.appendChild(img);
    }

    const label = document.createElement("span");
    label.textContent = s.name;
    a.append(ico, label);

    a.addEventListener("click", (e) => {
      if (isInternal(s.url)) {
        e.preventDefault();
        go(s.url);
      }
    });
    a.addEventListener("contextmenu", (e) => {
      if (isDefault(s)) return;
      e.preventDefault();
      items.splice(i, 1);
      save(items);
      render();
    });
    const tile = document.createElement("div");
    tile.className = "tile";

    const dots = document.createElement("button");
    dots.type = "button";
    dots.className = "dots";
    dots.setAttribute("aria-label", "More options");
    dots.innerHTML = DOTS;
    dots.addEventListener("click", (e) => {
      e.stopPropagation();
      const wasOpen = !!tile.querySelector(".menu");
      closeMenus();
      if (wasOpen) return;
      dots.classList.add("open");
      const menu = document.createElement("div");
      menu.className = "menu";
      const edit = document.createElement("button");
      edit.type = "button";
      edit.textContent = "Edit shortcut";
      edit.addEventListener("click", (ev) => {
        ev.stopPropagation();
        closeMenus();
        openModal(i);
      });
      menu.appendChild(edit);

      if (!isDefault(s)) {
        const rm = document.createElement("button");
        rm.type = "button";
        rm.textContent = "Remove";
        rm.addEventListener("click", (ev) => {
          ev.stopPropagation();
          items.splice(i, 1);
          save(items);
          render();
        });
        menu.appendChild(rm);
      }
      tile.appendChild(menu);
    });

    tile.append(a, dots);
    list.appendChild(tile);
  });

  const addTile = document.createElement("div");
  addTile.className = "tile";
  const add = document.createElement("button");
  add.type = "button";
  add.className = "sc";
  add.innerHTML = '<div class="ico">' + PLUS + "</div><span>Add shortcut</span>";
  add.addEventListener("click", () => openModal());
  addTile.appendChild(add);
  list.appendChild(addTile);
}

function closeMenus() {
  document.querySelectorAll(".menu").forEach((m) => m.remove());
  document.querySelectorAll(".dots.open").forEach((d) => d.classList.remove("open"));
}
document.addEventListener("click", closeMenus);

/* add shortcut popup */
const backdrop = $("backdrop");
let mode = "url"; // "url" or "catweb"

function setMode(m) {
  mode = m;
  document.querySelectorAll("#modeSwitch button").forEach((b) => {
    const on = b.dataset.mode === m;
    b.classList.toggle("on", on);
    b.setAttribute("aria-selected", on ? "true" : "false");
  });
  $("urlLabel").textContent = m === "catweb" ? "Site" : "URL";
}
document.querySelectorAll("#modeSwitch button").forEach((b) => {
  b.addEventListener("click", () => { setMode(b.dataset.mode); $("scUrl").focus(); });
});

let editIndex = null; // null = adding, number = editing that shortcut

function openModal(idx) {
  editIndex = typeof idx === "number" ? idx : null;
  const editing = editIndex !== null;
  $("modalTitle").textContent = editing ? "Edit shortcut" : "Add shortcut";
  $("restoreBtn").style.display = editing ? "none" : "";

  if (editing) {
    const s = items[editIndex];
    $("scName").value = s.name;
    const m = s.url.match(/^https?:\/\/(?:www\.)?catweb\.dev\/(.+)$/i);
    if (m) {
      setMode("catweb");
      $("scUrl").value = m[1];
    } else {
      setMode("url");
      $("scUrl").value = s.url;
    }
  } else {
    $("scName").value = "";
    $("scUrl").value = "";
    setMode("url");
  }
  backdrop.classList.add("open");
  $("scName").focus();
}
function closeModal() { backdrop.classList.remove("open"); }

$("cancelBtn").addEventListener("click", closeModal);
backdrop.addEventListener("mousedown", (e) => { if (e.target === backdrop) closeModal(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

$("restoreBtn").addEventListener("click", () => {
  items = DEFAULTS.map((s) => ({ ...s }));
  save(items);
  render();
  closeModal();
});

$("modal").addEventListener("submit", (e) => {
  e.preventDefault();
  let url, fallbackName;
  if (mode === "catweb") {
    // whatever is typed becomes https://catweb.dev/<site>
    const site = $("scUrl").value.trim()
      .replace(/^https?:\/\//i, "")
      .replace(/^(www\.)?catweb\.dev\/?/i, "")
      .replace(/^\/+/, "");
    if (!site) { $("scUrl").focus(); return; }
    url = "https://catweb.dev/" + site;
    fallbackName = site;
  } else {
    url = normalizeUrl($("scUrl").value);
    if (!url) { $("scUrl").focus(); return; }
    try { fallbackName = new URL(url).hostname.replace(/^www\./, ""); } catch (err) { fallbackName = url; }
  }
  const name = $("scName").value.trim() || fallbackName;
  if (editIndex !== null) {
    items[editIndex] = { ...items[editIndex], name, url };
  } else {
    items.push({ name, url });
  }
  save(items);
  render();
  closeModal();
});

/* search: uses your default search engine */
$("searchForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const v = $("q").value.trim();
  if (!v) return;

  // .rbx sites open through catweb.dev/<whatever was typed>
  if (/^(https?:\/\/)?[^\s\/?#]+\.rbx(?=$|[\/?#])\S*$/i.test(v)) {
    const site = v.replace(/^https?:\/\//i, "").replace(/^\/+/, "");
    go("https://catweb.dev/" + site);
    return;
  }

  const looksLikeUrl = /^[a-z][a-z0-9+.-]*:\/\//i.test(v) || /^(chrome|edge|about):/i.test(v) || /^[^\s]+\.[^\s]{2,}$/.test(v);
  if (looksLikeUrl) {
    go(normalizeUrl(v));
  } else if (IN_EXT && chrome.search) {
    chrome.search.query({ text: v, disposition: "CURRENT_TAB" });
  } else {
    location.href = "https://www.google.com/search?q=" + encodeURIComponent(v);
  }
});

render();

/* theme menu */
const THEME_KEY = "newtab_theme_v1";
const BLACK_OVER = { "--field": "#1c1c1c", "--hover": "#161616", "--border": "#333333", "--panel": "#0d0d0d", "--seg": "#2a2a2a" };
const THEMES = [
  // dark row
  { id: "default", bg: "#333333" },
  { id: "slate", bg: "#2c303a" },
  { id: "navy", bg: "#1f2029" },
  { id: "wine", bg: "#3a2b2b" },
  { id: "brown", bg: "#3a3128" },
  { id: "olive", bg: "#38381f" },
  { id: "forest", bg: "#28392a" },
  { id: "plum", bg: "#3a2a3a" },
  { id: "violet", bg: "#2f2438" },
  // black + light row
  { id: "black", bg: "#000000", over: BLACK_OVER },
  { id: "white", bg: "#ffffff", light: true },
  { id: "sky", bg: "#dbe8fb", light: true },
  { id: "rose", bg: "#ffe0e0", light: true },
  { id: "peach", bg: "#ffe6d6", light: true },
  { id: "lemon", bg: "#fffbd9", light: true },
  { id: "mint", bg: "#e3fbdc", light: true },
  { id: "pink", bg: "#ffe0fb", light: true },
  { id: "lilac", bg: "#f0e0ff", light: true },
];

function applyTheme(t) {
  const root = document.documentElement;
  Object.keys(BLACK_OVER).forEach((k) => root.style.removeProperty(k));
  root.style.setProperty("--bg", t.bg);
  root.classList.toggle("light", !!t.light);
  if (t.over) Object.entries(t.over).forEach(([k, v]) => root.style.setProperty(k, v));
  document.querySelectorAll(".swatch").forEach((s) => s.classList.toggle("on", s.dataset.id === t.id));
}

function loadTheme() {
  let id = "default";
  try { id = localStorage.getItem(THEME_KEY) || id; } catch (e) {}
  return THEMES.find((t) => t.id === id) || THEMES[0];
}

THEMES.forEach((t) => {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "swatch";
  b.dataset.id = t.id;
  b.title = t.id;
  b.style.setProperty("--c", t.bg);
  b.addEventListener("click", () => {
    applyTheme(t);
    try { localStorage.setItem(THEME_KEY, t.id); } catch (e) {}
  });
  $("swatches").appendChild(b);
});
applyTheme(loadTheme());

const themePanel = $("themePanel");
$("themeBtn").addEventListener("click", (e) => {
  e.stopPropagation();
  themePanel.hidden = !themePanel.hidden;
});
themePanel.addEventListener("click", (e) => e.stopPropagation());
document.addEventListener("click", () => { themePanel.hidden = true; });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") themePanel.hidden = true; });
