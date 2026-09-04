/* Mojtaba Alehosseini — site behaviour.
   1. Light/dark toggle, persisted.
   2. Scroll reveal: sections rise once when they enter the viewport.
      IntersectionObserver first; a scroll/timer fallback so nothing can stay
      hidden if the observer never fires (background tab, odd webviews). */
(() => {
  "use strict";

  const root = document.documentElement;
  const toggle = document.querySelector("[data-toggle]");
  if (toggle) {
    toggle.addEventListener("click", () => {
      const next = root.dataset.theme === "dark" ? "light" : "dark";
      root.dataset.theme = next;
      try { localStorage.setItem("theme", next); } catch (e) {}
    });
  }

  const items = Array.from(document.querySelectorAll(".reveal"));
  if (!items.length) return;
  const show = (el) => el.classList.add("in");
  const pending = () => items.filter((el) => !el.classList.contains("in"));
  const sweep = () => {
    const limit = window.innerHeight * 0.96;
    pending().forEach((el) => { if (el.getBoundingClientRect().top < limit) show(el); });
  };

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } });
    }, { rootMargin: "100000px 0px -6% 0px", threshold: 0.02 });
    items.forEach((el) => io.observe(el));
  }
  window.addEventListener("scroll", sweep, { passive: true });
  document.addEventListener("visibilitychange", sweep);
  setTimeout(sweep, 900);
})();
