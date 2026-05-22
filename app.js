/* Mojtaba Alehosseini — v2 site behavior.
   Three things:
     1. Theme toggle (persists in localStorage)
     2. GitHub repos with a hardcoded fallback
     3. Footer year + smooth-scroll focus shift                  */

(() => {
  "use strict";

  /* ─── 1. Theme toggle ─────────────────────────────────────── */
  const root = document.documentElement;
  const toggle = document.querySelector("[data-toggle]");
  if (toggle) {
    toggle.addEventListener("click", () => {
      const next = root.dataset.theme === "dark" ? "light" : "dark";
      root.dataset.theme = next;
      try { localStorage.setItem("theme", next); } catch (e) {}
    });
  }

  /* ─── 2. Footer year ──────────────────────────────────────── */
  const y = document.querySelector(".foot__year");
  if (y) y.textContent = new Date().getFullYear().toString();

  /* ─── 3. Smooth-scroll focus shift for screen readers ────── */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", () => {
      const id = a.getAttribute("href").slice(1);
      if (!id) return;
      const t = document.getElementById(id);
      if (!t) return;
      t.setAttribute("tabindex", "-1");
      setTimeout(() => t.focus({ preventScroll: true }), 320);
    });
  });

  /* ─── 4. GitHub repos ─────────────────────────────────────── */
  const list = document.getElementById("repo-list");
  const metaEl = document.getElementById("repo-meta");
  if (!list) return;

  const USER = "Mojtaba-Alehosseini";
  const HIDE = new Set([
    "Mojtaba-Alehosseini",
    "Mojtaba-Alehosseini.github.io",
  ]);

  const FALLBACK = [
    { name: "Change-Detection-Blob-Matching",
      description: "Change-detection pipeline from the Genova motion-analysis class, with Otsu thresholding as the alternative rule.",
      language: "Jupyter Notebook", pushed_at: "2026-05-08T00:00:00Z",
      html_url: "https://github.com/Mojtaba-Alehosseini/Change-Detection-Blob-Matching" },
    { name: "VisuaLume",
      description: "Data-visualization sketches and experiments.",
      language: null, pushed_at: "2026-05-15T00:00:00Z",
      html_url: "https://github.com/Mojtaba-Alehosseini/VisuaLume" },
    { name: "The-Price-of-Europe",
      description: "Notes and tooling for living-cost research across European cities.",
      language: "JavaScript", pushed_at: "2026-05-21T00:00:00Z",
      html_url: "https://github.com/Mojtaba-Alehosseini/The-Price-of-Europe" },
    { name: "Pneumonia_X_ray_transfer_learning",
      description: "Transfer-learning model for pneumonia detection from chest X-rays.",
      language: "Jupyter Notebook", pushed_at: "2022-11-09T00:00:00Z",
      html_url: "https://github.com/Mojtaba-Alehosseini/Pneumonia_X_ray_transfer_learning" },
    { name: "SBU-ML-Fall2022",
      description: "LightGBM paper review and gradient-boosting implementation applied to AAPL price data.",
      language: "Jupyter Notebook", pushed_at: "2023-02-15T00:00:00Z",
      html_url: "https://github.com/Mojtaba-Alehosseini/SBU-ML-Fall2022" },
    { name: "NLP",
      description: "Topic-identification work for an introductory NLP course.",
      language: "Jupyter Notebook", pushed_at: "2022-11-07T00:00:00Z",
      html_url: "https://github.com/Mojtaba-Alehosseini/NLP" },
  ];

  // GitHub-style language colors, only the ones Mojtaba's repos actually use.
  const LANG_COLOR = {
    "Python": "#3572A5",
    "Jupyter Notebook": "#DA5B0B",
    "JavaScript": "#F1E05A",
    "TypeScript": "#3178C6",
    "C++": "#F34B7D",
    "TeX": "#3D6117",
    "Solidity": "#AA6746",
    "MATLAB": "#E16737",
    "VBA": "#867DB1",
    "FreeBASIC": "#867DB1",
    "Mathematica": "#DD1100",
    "HTML": "#E34C26",
    "CSS": "#563D7C",
  };
  const langColor = (l) => LANG_COLOR[l] || "var(--muted)";

  const fmtYear = (iso) => {
    if (!iso) return "";
    try { return new Date(iso).getFullYear().toString(); }
    catch (e) { return ""; }
  };

  const escapeHtml = (s) =>
    s == null ? "" : String(s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

  function render(repos) {
    list.innerHTML = repos.map((r) => {
      const lang = r.language || "—";
      const year = fmtYear(r.pushed_at || r.updated_at);
      const desc = r.description ? `<p class="repo__desc">${escapeHtml(r.description)}</p>` : "";
      return `
        <li class="repo">
          <a class="repo__link" href="${r.html_url}" rel="noopener" aria-label="${escapeHtml(r.name)} on GitHub">
            <div class="repo__main">
              <span class="repo__name">${escapeHtml(r.name)}</span>
              ${desc}
            </div>
            <div class="repo__meta">
              <span class="repo__lang">
                <span class="repo__lang-dot" style="background:${langColor(r.language)}" aria-hidden="true"></span>
                ${escapeHtml(lang)}
              </span>
              <span>${year}</span>
            </div>
          </a>
        </li>`;
    }).join("");
  }

  function pick(repos) {
    return repos
      .filter((r) => !r.fork && !r.private && !HIDE.has(r.name))
      .sort((a, b) => new Date(b.pushed_at || b.updated_at) - new Date(a.pushed_at || a.updated_at))
      .slice(0, 6);
  }

  async function load() {
    try {
      const res = await fetch(
        `https://api.github.com/users/${USER}/repos?per_page=100&sort=pushed`,
        { headers: { Accept: "application/vnd.github+json" } }
      );
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      const picked = pick(data);
      if (!picked.length) throw new Error("no public repos");
      render(picked);
      if (metaEl) metaEl.textContent = `live, ${picked.length} repos`;
    } catch (e) {
      render(FALLBACK);
      if (metaEl) metaEl.textContent = "cached selection";
    }
  }

  load();
})();
