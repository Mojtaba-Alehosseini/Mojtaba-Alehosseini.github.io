/* Mojtaba Alehosseini — site behavior.
   One job: the light/dark theme toggle, persisted in localStorage.
   (The interactive portrait lives in portrait-interaction.js.)        */

(() => {
  "use strict";

  const root = document.documentElement;
  const toggle = document.querySelector("[data-toggle]");
  if (!toggle) return;

  toggle.addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch (e) {}
  });
})();
