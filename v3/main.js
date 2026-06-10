/* ─────────────────────────────────────────────────────────────
   Mojtaba Alehosseini — v3 spatial scene.
   Three.js, no build step. ES modules from CDN via importmap.

   What the user sees:
     - A dark room with a soft horizon glow.
     - Their name floating in glass at the center.
     - Five iridescent objects orbiting around them, each labeled.
     - Drag to look around. Click an object to open its section.
     - ESC or click the close button to return to the overview.
   ───────────────────────────────────────────────────────────── */

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

/* ─── SECTION TABLE ──────────────────────────────────────────── */

const SECTIONS = [
  { id: "about",    label: "about",    geometry: "icosahedron", angle:   0 },
  { id: "now",      label: "now",      geometry: "torus",       angle:  72 },
  { id: "work",     label: "work",     geometry: "cube",        angle: 144 },
  { id: "projects", label: "projects", geometry: "knot",        angle: 216 },
  { id: "contact",  label: "contact",  geometry: "cone",        angle: 288 },
];

/* ─── BOOTSTRAP ──────────────────────────────────────────────── */

const canvas = document.getElementById("scene");
const loaderEl = document.getElementById("loader");
const loaderFill = document.getElementById("loader-fill");
const hintEl = document.getElementById("hint");
const panelEl = document.getElementById("panel");
const panelClose = document.getElementById("panel-close");
const allSections = document.querySelectorAll(".panel__section");

/* WebGL probe — fall back to flat page if there's no GL. */
function probeWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch (e) { return false; }
}
if (!probeWebGL()) {
  window.location.replace("../");
}

/* Renderer */
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false,
  powerPreference: "high-performance",
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;

/* Scene */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x08081A);
scene.fog = new THREE.Fog(0x08081A, 18, 60);

/* Camera */
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  200
);
camera.position.set(0, 2.2, 12);

/* Controls */
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.07;
controls.enablePan = false;
controls.minDistance = 7;
controls.maxDistance = 22;
controls.minPolarAngle = Math.PI / 3.2;
controls.maxPolarAngle = Math.PI / 1.6;
controls.target.set(0, 0.5, 0);
controls.autoRotate = true;
controls.autoRotateSpeed = 0.35;

/* User interaction kills auto-rotate. */
let userInteracted = false;
function flagInteraction() {
  if (!userInteracted) {
    userInteracted = true;
    controls.autoRotate = false;
    if (hintEl) hintEl.classList.add("hidden");
  }
}
controls.addEventListener("start", flagInteraction);
canvas.addEventListener("pointerdown", flagInteraction, { passive: true });

/* ─── LIGHTING ──────────────────────────────────────────────── */

const ambient = new THREE.AmbientLight(0x404060, 1.0);
scene.add(ambient);

const key = new THREE.DirectionalLight(0xCFE0FF, 1.8);
key.position.set(6, 9, 6);
key.castShadow = false;
scene.add(key);

const rim = new THREE.PointLight(0x8FB5E8, 1.2, 30);
rim.position.set(-7, 4, -6);
scene.add(rim);

const warm = new THREE.PointLight(0xC9B6F0, 0.8, 25);
warm.position.set(6, 2, -4);
scene.add(warm);

/* ─── ATMOSPHERE: GROUND + HORIZON GLOW ─────────────────────── */

/* Soft gradient ground using a large disk with a custom material. */
const groundGeom = new THREE.CircleGeometry(60, 64);
const groundMat = new THREE.ShaderMaterial({
  uniforms: {
    uTop: { value: new THREE.Color(0x14142A) },
    uBottom: { value: new THREE.Color(0x05050E) },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 uTop;
    uniform vec3 uBottom;
    varying vec2 vUv;
    void main() {
      float d = distance(vUv, vec2(0.5));
      vec3 col = mix(uTop, uBottom, smoothstep(0.0, 0.5, d));
      gl_FragColor = vec4(col, 1.0);
    }
  `,
});
const ground = new THREE.Mesh(groundGeom, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -2;
scene.add(ground);

/* Distant horizon ring — a faint glowing circle at scene horizon. */
const horizonGeom = new THREE.TorusGeometry(35, 0.05, 8, 64);
const horizonMat = new THREE.MeshBasicMaterial({
  color: 0x8FB5E8,
  transparent: true,
  opacity: 0.18,
});
const horizon = new THREE.Mesh(horizonGeom, horizonMat);
horizon.rotation.x = Math.PI / 2;
horizon.position.y = -1.9;
scene.add(horizon);

/* ─── PARTICLES (drifting motes) ────────────────────────────── */

const PARTICLE_COUNT = window.innerWidth < 700 ? 250 : 600;
const particleGeom = new THREE.BufferGeometry();
const positions = new Float32Array(PARTICLE_COUNT * 3);
const drifts = new Float32Array(PARTICLE_COUNT);
for (let i = 0; i < PARTICLE_COUNT; i++) {
  const r = 8 + Math.random() * 25;
  const theta = Math.random() * Math.PI * 2;
  const y = Math.random() * 12 - 1;
  positions[i * 3 + 0] = Math.cos(theta) * r;
  positions[i * 3 + 1] = y;
  positions[i * 3 + 2] = Math.sin(theta) * r;
  drifts[i] = Math.random() * Math.PI * 2;
}
particleGeom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
const particleMat = new THREE.PointsMaterial({
  color: 0xCFE0FF,
  size: 0.04,
  transparent: true,
  opacity: 0.7,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});
const particles = new THREE.Points(particleGeom, particleMat);
scene.add(particles);

/* ─── CENTER MEDALLION (name placeholder) ───────────────────── */
/* A central floating glassy disc with the user's initials etched on top.
   When the user adds a photo later, we'll swap this for an image plane. */

const medallionGroup = new THREE.Group();
medallionGroup.position.set(0, 0.5, 0);
scene.add(medallionGroup);

const medallionGeom = new THREE.CylinderGeometry(0.85, 0.85, 0.18, 64, 1, false);
const medallionMat = new THREE.MeshPhysicalMaterial({
  color: 0xF5F5FA,
  metalness: 0.05,
  roughness: 0.1,
  transmission: 0.65,
  ior: 1.45,
  thickness: 0.6,
  clearcoat: 1.0,
  clearcoatRoughness: 0.05,
  sheen: 0.4,
  sheenColor: new THREE.Color(0x8FB5E8),
});
const medallion = new THREE.Mesh(medallionGeom, medallionMat);
medallion.rotation.x = Math.PI / 2;
medallionGroup.add(medallion);

/* Initials as a canvas texture on top of the medallion. */
function makeTextTexture(text, opts = {}) {
  const {
    size = 512,
    bg = "rgba(8, 8, 26, 0.0)",
    color = "#F5F5FA",
    font = "italic 220px 'Instrument Serif', Georgia, serif",
  } = opts;
  const canvasEl = document.createElement("canvas");
  canvasEl.width = size;
  canvasEl.height = size;
  const ctx = canvasEl.getContext("2d");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = font;
  ctx.fillText(text, size / 2, size / 2 + 12);
  const tex = new THREE.CanvasTexture(canvasEl);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

const initialsTexture = makeTextTexture("M", {
  font: "italic 320px 'Instrument Serif', Georgia, serif",
});
const initialsMat = new THREE.MeshBasicMaterial({
  map: initialsTexture,
  transparent: true,
  depthWrite: false,
});
const initialsGeom = new THREE.PlaneGeometry(1.4, 1.4);
const initials = new THREE.Mesh(initialsGeom, initialsMat);
initials.position.set(0, 0.10, 0);
initials.rotation.x = -Math.PI / 2;
medallionGroup.add(initials);

/* Subtle halo behind the medallion. */
const haloGeom = new THREE.RingGeometry(1.0, 1.6, 64);
const haloMat = new THREE.MeshBasicMaterial({
  color: 0x8FB5E8,
  transparent: true,
  opacity: 0.06,
  side: THREE.DoubleSide,
  depthWrite: false,
});
const halo = new THREE.Mesh(haloGeom, haloMat);
halo.rotation.x = -Math.PI / 2;
halo.position.y = -0.05;
medallionGroup.add(halo);

/* ─── SECTION OBJECTS (orbiting) ─────────────────────────────── */

const ORBIT_RADIUS = 4.5;
const sectionObjects = []; // { mesh, label (Sprite), section data, basePos, phase }

function makeSectionGeometry(kind) {
  switch (kind) {
    case "icosahedron": return new THREE.IcosahedronGeometry(0.55, 0);
    case "torus":       return new THREE.TorusGeometry(0.45, 0.16, 24, 64);
    case "cube":        return new THREE.BoxGeometry(0.85, 0.85, 0.85);
    case "knot":        return new THREE.TorusKnotGeometry(0.42, 0.13, 100, 16);
    case "cone":        return new THREE.ConeGeometry(0.55, 0.95, 32);
    default:            return new THREE.SphereGeometry(0.55, 32, 16);
  }
}

function makeLabelSprite(text) {
  const tex = makeTextTexture(text, {
    size: 256,
    color: "#F5F5FA",
    font: "500 64px 'Inter Tight', sans-serif",
  });
  const mat = new THREE.SpriteMaterial({
    map: tex,
    transparent: true,
    depthWrite: false,
    depthTest: false,
  });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(1.7, 0.55, 1);
  return sprite;
}

SECTIONS.forEach((s, i) => {
  const angle = (s.angle * Math.PI) / 180;
  const x = Math.cos(angle) * ORBIT_RADIUS;
  const z = Math.sin(angle) * ORBIT_RADIUS;
  const y = 0.5 + (i % 2 === 0 ? 0.4 : -0.2);

  const geom = makeSectionGeometry(s.geometry);
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xF5F5FA,
    metalness: 0.0,
    roughness: 0.08,
    transmission: 0.92,
    ior: 1.5,
    thickness: 0.6,
    clearcoat: 1.0,
    clearcoatRoughness: 0.0,
    iridescence: 0.85,
    iridescenceIOR: 1.3,
    iridescenceThicknessRange: [180, 660],
    sheen: 0.4,
    sheenColor: new THREE.Color(0x8FB5E8),
    envMapIntensity: 1.2,
  });
  const mesh = new THREE.Mesh(geom, mat);
  mesh.position.set(x, y, z);
  mesh.userData = { section: s, basePos: { x, y, z }, phase: Math.random() * Math.PI * 2 };
  scene.add(mesh);

  /* Floating label above each shape. */
  const label = makeLabelSprite(s.label);
  label.position.set(x, y + 1.05, z);
  label.userData = { phase: mesh.userData.phase };
  scene.add(label);

  sectionObjects.push({ mesh, label, section: s });
});

/* ─── ENV MAP for reflections ────────────────────────────────── */
/* Tiny inline environment so the glassy materials have something to reflect.
   Procedural cubemap drawn into 6 canvases. */

function makeEnvMap() {
  const size = 256;
  const sides = [];
  const gradients = [
    ["#23284A", "#08081A"],
    ["#23284A", "#08081A"],
    ["#1C2240", "#08081A"],
    ["#0A0A18", "#02020A"],
    ["#23284A", "#08081A"],
    ["#23284A", "#08081A"],
  ];
  gradients.forEach(([a, b]) => {
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const g = c.getContext("2d");
    const grad = g.createLinearGradient(0, 0, 0, size);
    grad.addColorStop(0, a);
    grad.addColorStop(1, b);
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
    /* Add a soft "sun" highlight. */
    const sun = g.createRadialGradient(size * 0.7, size * 0.35, 5, size * 0.7, size * 0.35, size * 0.45);
    sun.addColorStop(0, "rgba(207, 224, 255, 0.8)");
    sun.addColorStop(1, "rgba(207, 224, 255, 0)");
    g.fillStyle = sun;
    g.fillRect(0, 0, size, size);
    sides.push(c);
  });
  const tex = new THREE.CubeTexture(sides);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

const envMap = makeEnvMap();
scene.environment = envMap;

/* ─── RAYCASTER (hover and click) ───────────────────────────── */

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let hoveredObject = null;

function onPointerMove(e) {
  const x = (e.clientX || e.touches?.[0]?.clientX || 0);
  const y = (e.clientY || e.touches?.[0]?.clientY || 0);
  pointer.x = (x / window.innerWidth) * 2 - 1;
  pointer.y = -(y / window.innerHeight) * 2 + 1;
}
window.addEventListener("pointermove", onPointerMove);

function checkHover() {
  raycaster.setFromCamera(pointer, camera);
  const meshes = sectionObjects.map((s) => s.mesh);
  const hits = raycaster.intersectObjects(meshes);
  const next = hits[0]?.object || null;
  if (next !== hoveredObject) {
    if (hoveredObject) hoveredObject.userData.hovered = false;
    hoveredObject = next;
    if (hoveredObject) hoveredObject.userData.hovered = true;
    canvas.style.cursor = hoveredObject ? "pointer" : "grab";
  }
}

/* ─── CLICK → OPEN SECTION ──────────────────────────────────── */

function openSection(id) {
  allSections.forEach((s) => s.classList.toggle("active", s.dataset.section === id));
  panelEl.classList.add("open");
  panelEl.setAttribute("aria-hidden", "false");
  const inner = panelEl.querySelector(".panel__inner");
  if (inner) inner.scrollTop = 0;
}
function closeSection() {
  panelEl.classList.remove("open");
  panelEl.setAttribute("aria-hidden", "true");
}

window.addEventListener("click", (e) => {
  if (panelEl.contains(e.target)) return; // clicks inside panel
  raycaster.setFromCamera(pointer, camera);
  const meshes = sectionObjects.map((s) => s.mesh);
  const hits = raycaster.intersectObjects(meshes);
  if (hits[0]) {
    openSection(hits[0].object.userData.section.id);
  }
});

panelClose.addEventListener("click", closeSection);
panelEl.addEventListener("click", (e) => {
  if (e.target === panelEl) closeSection();
});
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && panelEl.classList.contains("open")) closeSection();
});

/* ─── ANIMATION LOOP ────────────────────────────────────────── */

const clock = new THREE.Clock();
function animate() {
  const t = clock.getElapsedTime();

  /* Float each section object. */
  sectionObjects.forEach(({ mesh, label }) => {
    const base = mesh.userData.basePos;
    const phase = mesh.userData.phase;
    const bob = Math.sin(t * 0.6 + phase) * 0.18;
    mesh.position.y = base.y + bob;
    label.position.y = base.y + bob + 1.05;
    mesh.rotation.x += 0.0015;
    mesh.rotation.y += 0.0025;
    /* Hover scale */
    const target = mesh.userData.hovered ? 1.18 : 1.0;
    mesh.scale.lerp(new THREE.Vector3(target, target, target), 0.12);
  });

  /* Medallion floats gently. */
  medallionGroup.position.y = 0.5 + Math.sin(t * 0.45) * 0.08;
  medallionGroup.rotation.y += 0.0009;

  /* Halo pulse. */
  halo.material.opacity = 0.05 + 0.04 * Math.sin(t * 1.1);

  /* Particles slow drift. */
  particles.rotation.y += 0.00035;

  checkHover();
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

/* ─── RESIZE ─────────────────────────────────────────────────── */

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener("resize", onResize);

/* ─── LOADER → READY ─────────────────────────────────────────── */
/* Fake-progress in three steps so the loader feels real even though most of
   our scene is procedural and ready immediately. */

let progress = 0;
function tickLoader() {
  progress = Math.min(progress + 0.35, 1);
  if (loaderFill) loaderFill.style.width = progress * 100 + "%";
  if (progress < 1) {
    requestAnimationFrame(tickLoader);
  } else {
    setTimeout(() => {
      if (loaderEl) loaderEl.classList.add("hidden");
      setTimeout(() => loaderEl && loaderEl.remove(), 600);
    }, 220);
  }
}
tickLoader();
animate();

/* ─── REPOS PANEL ────────────────────────────────────────────── */
/* Reuse the same fetch logic as v2 so the projects panel is populated. */

const USER = "Mojtaba-Alehosseini";
const HIDE = new Set(["Mojtaba-Alehosseini", "Mojtaba-Alehosseini.github.io"]);
const FALLBACK = [
  { name: "Change-Detection-Blob-Matching",
    description: "Change-detection pipeline from the Genova motion-analysis class.",
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
    description: "LightGBM paper review and gradient-boosting implementation on AAPL data.",
    language: "Jupyter Notebook", pushed_at: "2023-02-15T00:00:00Z",
    html_url: "https://github.com/Mojtaba-Alehosseini/SBU-ML-Fall2022" },
  { name: "NLP",
    description: "Topic-identification work for an introductory NLP course.",
    language: "Jupyter Notebook", pushed_at: "2022-11-07T00:00:00Z",
    html_url: "https://github.com/Mojtaba-Alehosseini/NLP" },
];
const LANG_COLOR = {
  "Python": "#3572A5", "Jupyter Notebook": "#DA5B0B", "JavaScript": "#F1E05A",
  "TypeScript": "#3178C6", "C++": "#F34B7D", "TeX": "#3D6117",
  "Solidity": "#AA6746", "MATLAB": "#E16737",
};
const escapeHtml = (s) => s == null ? "" : String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const fmtYear = (iso) => { try { return new Date(iso).getFullYear().toString(); } catch (e) { return ""; } };

function renderRepos(repos) {
  const list = document.getElementById("repo-list");
  const meta = document.getElementById("repo-meta");
  if (!list) return;
  list.innerHTML = repos.map((r) => {
    const lang = r.language || "—";
    const dotColor = LANG_COLOR[r.language] || "#8FB5E8";
    const desc = r.description ? `<p class="repo__desc">${escapeHtml(r.description)}</p>` : "";
    return `
      <li class="repo">
        <a href="${r.html_url}" target="_blank" rel="noopener">
          <div>
            <span class="repo__name">${escapeHtml(r.name)}</span>
            ${desc}
          </div>
          <div class="repo__meta">
            <span><span class="repo__lang-dot" style="background:${dotColor}"></span>${escapeHtml(lang)}</span>
            <span>${fmtYear(r.pushed_at)}</span>
          </div>
        </a>
      </li>`;
  }).join("");
  if (meta) meta.textContent = `live, ${repos.length} repos`;
}

async function loadRepos() {
  try {
    const res = await fetch(
      `https://api.github.com/users/${USER}/repos?per_page=100&sort=pushed`,
      { headers: { Accept: "application/vnd.github+json" } }
    );
    if (!res.ok) throw new Error();
    const data = await res.json();
    const picked = data
      .filter((r) => !r.fork && !r.private && !HIDE.has(r.name))
      .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
      .slice(0, 6);
    if (!picked.length) throw new Error();
    renderRepos(picked);
  } catch (e) {
    renderRepos(FALLBACK);
    const meta = document.getElementById("repo-meta");
    if (meta) meta.textContent = "cached";
  }
}
loadRepos();
