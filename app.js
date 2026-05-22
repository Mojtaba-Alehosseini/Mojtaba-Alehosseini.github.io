/* ─────────────────────────────────────────────────────────────
   Mojtaba Alehosseini — site behavior
   Three things only:
     1. Reveal sections on scroll (once).
     2. Tick up hero numbers on first paint.
     3. Fetch and render GitHub repos with a hardcoded fallback.
   ───────────────────────────────────────────────────────────── */

(() => {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ─── 1. Section reveal ─────────────────────────────────── */

  const revealTargets = document.querySelectorAll(".section, .hero__grid, .repo");
  if ("IntersectionObserver" in window && !prefersReduced) {
    revealTargets.forEach((el) => el.classList.add("reveal"));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal--in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -10% 0px" }
    );
    revealTargets.forEach((el) => io.observe(el));
  }

  /* ─── 2. Hero number tick-up ────────────────────────────── */

  const numEls = document.querySelectorAll(".stat__num[data-count]");
  function tickUp(el) {
    const target = parseInt(el.dataset.count, 10) || 0;
    if (prefersReduced) {
      el.textContent = target.toString();
      return;
    }
    const duration = 700;
    const start = performance.now();
    const startVal = 0;
    function frame(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(startVal + (target - startVal) * eased);
      el.textContent = value.toString();
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  if (numEls.length) {
    // delay slightly so it lands after the hero is visible
    setTimeout(() => numEls.forEach(tickUp), 220);
  }

  /* ─── 3. Local clock in top bar (Genoa, Europe/Rome) ────── */

  const clockEl = document.getElementById("local-clock");
  function paintClock() {
    if (!clockEl) return;
    try {
      const now = new Date();
      const fmt = new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Europe/Rome",
      });
      clockEl.textContent = fmt.format(now) + " CET";
    } catch (e) {
      clockEl.textContent = "";
    }
  }
  paintClock();
  setInterval(paintClock, 30 * 1000);

  /* ─── 4. Footer year ────────────────────────────────────── */

  const yearEl = document.querySelector(".foot__year");
  if (yearEl) yearEl.textContent = new Date().getFullYear().toString();

  /* ─── 5. GitHub repos ───────────────────────────────────── */

  const repoListEl = document.getElementById("repo-list");
  const repoStatusEl = document.getElementById("repo-status");
  const repoStatusText = repoStatusEl ? repoStatusEl.querySelector(".repo-status__text") : null;

  const USER = "Mojtaba-Alehosseini";
  const HIDE = new Set([
    "Mojtaba-Alehosseini",
    "Mojtaba-Alehosseini.github.io",
  ]);

  // Fallback repos — used if the API call fails or is rate limited.
  // Picked by hand from the current public list to surface the strongest signals.
  const FALLBACK = [
    {
      name: "Change-Detection-Blob-Matching",
      description: "Change detection pipeline taught in the Genova motion-analysis class, with Otsu thresholding as an alternative rule.",
      language: "Jupyter Notebook",
      updated_at: "2026-05-08T00:00:00Z",
      stargazers_count: 0,
      html_url: "https://github.com/Mojtaba-Alehosseini/Change-Detection-Blob-Matching",
    },
    {
      name: "VisuaLume",
      description: "Data visualization sketches and experiments.",
      language: null,
      updated_at: "2026-05-15T00:00:00Z",
      stargazers_count: 0,
      html_url: "https://github.com/Mojtaba-Alehosseini/VisuaLume",
    },
    {
      name: "The-Price-of-Europe",
      description: "Working notes and tooling for living-cost research across European cities.",
      language: "JavaScript",
      updated_at: "2026-05-21T00:00:00Z",
      stargazers_count: 0,
      html_url: "https://github.com/Mojtaba-Alehosseini/The-Price-of-Europe",
    },
    {
      name: "Pneumonia_X_ray_transfer_learning",
      description: "Transfer-learning model for pneumonia detection from chest X-rays.",
      language: "Jupyter Notebook",
      updated_at: "2022-11-09T00:00:00Z",
      stargazers_count: 1,
      html_url: "https://github.com/Mojtaba-Alehosseini/Pneumonia_X_ray_transfer_learning",
    },
    {
      name: "SBU-ML-Fall2022",
      description: "LightGBM paper review and gradient-boosting implementation applied to AAPL price data.",
      language: "Jupyter Notebook",
      updated_at: "2023-02-15T00:00:00Z",
      stargazers_count: 0,
      html_url: "https://github.com/Mojtaba-Alehosseini/SBU-ML-Fall2022",
    },
    {
      name: "NLP",
      description: "Topic-identification work for an introductory NLP course.",
      language: "Jupyter Notebook",
      updated_at: "2022-11-07T00:00:00Z",
      stargazers_count: 0,
      html_url: "https://github.com/Mojtaba-Alehosseini/NLP",
    },
  ];

  // GitHub language → color map. Trimmed to languages Mojtaba's repos actually use.
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

  function langDotColor(lang) {
    return LANG_COLOR[lang] || "#7FE7B5";
  }

  function fmtDate(iso) {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      return d.toLocaleDateString("en-GB", {
        year: "numeric",
        month: "short",
      });
    } catch (e) {
      return "";
    }
  }

  function renderRepos(repos) {
    if (!repoListEl) return;
    repoListEl.innerHTML = "";
    repos.forEach((r, i) => {
      const li = document.createElement("li");
      li.className = "repo";

      const idx = String(i + 1).padStart(2, "0");
      const lang = r.language || "—";
      const dot = `<span class="repo__lang-dot" style="background:${langDotColor(r.language)}" aria-hidden="true"></span>`;
      const desc = r.description ? `<p class="repo__desc">${escapeHtml(r.description)}</p>` : "";
      const stars = r.stargazers_count > 0
        ? `<span class="repo__stars">${r.stargazers_count}</span>`
        : "";

      li.innerHTML = `
        <a class="repo__link" href="${r.html_url}" rel="noopener" aria-label="${escapeHtml(r.name)} on GitHub">
          <span class="repo__num">${idx}</span>
          <div class="repo__main">
            <span class="repo__name">${escapeHtml(r.name)}</span>
            ${desc}
          </div>
          <div class="repo__meta">
            <span class="repo__lang">${dot}${escapeHtml(lang)}</span>
            <span class="repo__date">${fmtDate(r.updated_at || r.pushed_at)}</span>
            ${stars}
          </div>
        </a>
      `;
      repoListEl.appendChild(li);
    });
  }

  function setStatus(text, kind) {
    if (!repoStatusEl) return;
    if (repoStatusText) repoStatusText.textContent = text;
    repoStatusEl.classList.remove("repo-status--ok", "repo-status--err");
    if (kind) repoStatusEl.classList.add("repo-status--" + kind);
  }

  function pickRepos(repos) {
    return repos
      .filter((r) => !r.fork && !r.private && !HIDE.has(r.name))
      .sort((a, b) => new Date(b.pushed_at || b.updated_at) - new Date(a.pushed_at || a.updated_at))
      .slice(0, 6);
  }

  async function loadRepos() {
    try {
      const res = await fetch(
        `https://api.github.com/users/${USER}/repos?per_page=100&sort=pushed`,
        { headers: { Accept: "application/vnd.github+json" } }
      );
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      const picked = pickRepos(data);
      if (!picked.length) throw new Error("No public repos returned");
      renderRepos(picked);
      setStatus(`Live · ${picked.length} repos from GitHub`, "ok");
    } catch (err) {
      renderRepos(FALLBACK);
      setStatus("Offline · showing cached selection", "err");
      // No console noise; the fallback is the contract.
    }
  }

  function escapeHtml(s) {
    if (s == null) return "";
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  if (repoListEl) loadRepos();

  /* ─── 6. Smooth scroll for anchor links inside the page ─── */
  // Native CSS smooth-scroll handles most of this. The override below
  // ensures the focus is moved to the section so screen readers follow.
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href").slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      // CSS scroll-behavior handles motion. We just shift focus.
      target.setAttribute("tabindex", "-1");
      setTimeout(() => target.focus({ preventScroll: true }), 320);
    });
  });
})();
