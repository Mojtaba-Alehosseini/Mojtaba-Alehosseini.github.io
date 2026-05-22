# Media prompts

The site ships without raster images on purpose. Every visual is either CSS, an
SVG data URL, or live API output. If you ever want to add image assets — a
proper hero photo, a Riggosaurus diagram, a few project thumbnails — these are
the prompts and slots to do it with.

Generator targets: Midjourney v6, DALL·E 3, Flux 1.1 Pro. All prompts assume
"engineering editorial" — see `DESIGN_DECISIONS.md` for the system. Keep the
palette tight: ink black, warm white, single amber accent. No purple, no cyan,
no rainbow gradients, no stock-photo people.

---

## 1. Open Graph / social preview card

**Where it goes:** `og:image` for `<meta>` tags. Currently the site ships
without one — social shares fall back to no image. Adding this raises the
quality of the link unfurl on LinkedIn, X, Slack.

**Dimensions:** 1200&times;630, PNG.

**Filename:** `og-card.png`, sitting at the repo root.

**Markup change once added:**
```html
<meta property="og:image" content="https://mojtaba-alehosseini.github.io/og-card.png" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="https://mojtaba-alehosseini.github.io/og-card.png" />
```

**Prompt:**

> Editorial poster, 1200x630, near-black background (#0A0A0B), subtle dot grid
> texture barely visible. Large display typography: "Mojtaba Alehosseini" set
> in a precise sans-serif on the upper third, with the surname rendered in an
> amber (#F5A524) italic serif. Below, in small monospace, the line "AI/ML
> engineer · Genova · open to EU 2026/2027". Bottom-right corner: a tiny
> technical schematic of an open-air GPU rig in line art at 20% opacity,
> functioning as a watermark, not a focal point. Generous negative space.
> Layout asymmetric, weight in the left third. No photography, no faces, no
> 3D renders, no neon, no purple. Looks like a printed conference handout
> from a hardware journal.

---

## 2. Hero accent — abstract topographic schematic

**Where it goes:** Behind or beside the hero name as a low-opacity layer,
giving the dot grid a focal point. Currently the hero is intentionally bare.

**Dimensions:** 1600&times;1200, PNG with transparent background, or SVG.

**Filename:** `hero-schematic.png` (or `.svg`).

**Placement:** Insert into `index.html` as an `<img>` inside the `.hero`
container, positioned absolute, right-aligned, with `opacity: 0.18`. CSS slot
already exists in `.hero` (position: relative).

**Suggested markup once added:**
```html
<img class="hero__schematic" src="hero-schematic.png" alt="" aria-hidden="true" />
```
```css
.hero__schematic {
  position: absolute;
  right: -4rem;
  top: 50%;
  transform: translateY(-50%);
  width: 36rem;
  max-width: 60vw;
  opacity: 0.18;
  pointer-events: none;
  mix-blend-mode: screen;
}
@media (max-width: 720px) { .hero__schematic { display: none; } }
```

**Prompt:**

> Technical line-art schematic on a transparent background. Imagine a cross
> between a topographic contour map and a circuit diagram: thin amber
> (#F5A524) hairlines on transparent, no fills. Overlapping concentric
> contours suggest depth without representing anything specific. Small node
> markers at intersection points, mono-style labels with numeric coordinates
> like "44.4056N 8.9463E" or "PHASE-04" scattered sparingly. Asymmetric
> composition leaning to the right edge. Vector-clean line weight, suitable
> for blending mode "screen" over a near-black background. No type beyond
> the coordinate labels. No color outside the amber line.

---

## 3. About-section portrait slot (optional)

**Where it goes:** Right column of the About section at desktop widths.
Currently the layout is text-only with a pull quote. The grid already has
room for a square portrait at the top-right of the section body.

**Dimensions:** 600&times;800 (portrait), grayscale or duotone.

**Filename:** `portrait.jpg`.

**Markup change once added:**
```html
<figure class="about__portrait">
  <img src="portrait.jpg" alt="Mojtaba Alehosseini" />
  <figcaption>Genoa, 2026</figcaption>
</figure>
```
```css
.about__portrait {
  float: right;
  width: 14rem;
  margin: 0 0 var(--s-3) var(--s-3);
  filter: grayscale(1) contrast(1.05);
  border: 1px solid var(--rule);
}
.about__portrait figcaption {
  font-family: var(--mono);
  font-size: 0.72rem;
  color: var(--muted);
  letter-spacing: 0.06em;
  padding-top: var(--s-1);
}
@media (max-width: 720px) { .about__portrait { float: none; width: 100%; max-width: 16rem; margin: 0 auto var(--s-3); } }
```

**Prompt** (if generating instead of using a real photo, though a real photo
is strongly preferred for an "About" section):

> Editorial portrait silhouette, monochrome, high-contrast. A figure facing
> three-quarters toward the camera against a near-black wall (#0A0A0B). Warm
> directional light from the upper left, creating one defined cheek
> highlight and leaving the rest in shadow. Film grain texture. Square frame
> with the subject in the lower two-thirds. No background props, no logos.
> Looks like a magazine contributor photo from a quiet technical publication.

**Note:** A real photo is better here. The "old" photos in the repo history
were academic-style — the new portrait should match the site's editorial
register (warm directional light, slightly grainy, monochrome or duotone).

---

## 4. Riggosaurus exploded-view diagram

**Where it goes:** Below the Riggosaurus role entry, as a one-image visual
break between the long bullet list and the numbers strip. Currently the page
relies on the typography and the numbers strip alone, which works, but a
hand-drawn schematic of a rig would deepen the story for anyone reading the
section in detail.

**Dimensions:** 1400&times;700 (3:1.5 banner), PNG with transparent
background.

**Filename:** `riggosaurus-schematic.png`.

**Markup change once added:**
```html
<figure class="role__diagram">
  <img src="riggosaurus-schematic.png" alt="Open-air GPU rig, exploded view: motherboard, six GPUs on PCIe risers, dual PSUs, frame." />
  <figcaption>Open-air rig, schematic. Not to scale.</figcaption>
</figure>
```

**Prompt:**

> Technical exploded-view schematic of an open-air GPU mining rig, drawn as
> a single-color amber (#F5A524) line drawing on transparent background. No
> fills, no shading. Show six GPUs spread across PCIe risers, two PSUs at
> the bottom, a metal frame holding them, fans drawn as concentric circles,
> cables as gentle curves. Annotate each part with thin pointer lines
> leading to monospace labels: "GPU x6", "PSU", "RISER", "FRAME", "FAN".
> Style references: blueprint, exploded technical illustration, patent
> drawing. Precise hairlines, no decorative flourishes. Composition wide and
> horizontal, suitable for a single-row insert in an article.

---

## 5. Project thumbnails (optional, low priority)

**Where it goes:** The repo list could include a small square thumbnail per
project. Currently it doesn't — the design prefers typography and live
metadata over thumbnails because thumbnails on code-only projects often add
noise (random screenshots of notebooks) rather than information.

**Recommendation:** Skip this unless a project genuinely benefits from a
visual (e.g., a data-visualization project where the chart is the point).
For those, capture a real screenshot from the project itself rather than
generating one.

**Dimensions:** 320&times;320 square, PNG.

**Filename pattern:** `thumbs/{repo-name}.png`.

---

## 6. Favicon and apple-touch-icon

**Where it goes:** Site root. The current favicon is a tiny inline SVG data
URL that renders "M" in amber on near-black. That's fine and ships zero
bytes, but for high-resolution displays an apple-touch-icon is missing.

**Files to add:**

- `favicon.ico` — 32&times;32, fallback for legacy browsers.
- `apple-touch-icon.png` — 180&times;180, for iOS home screens.
- `icon-512.png` — 512&times;512, for PWA manifest if it ever exists.

**Markup change once added:**
```html
<link rel="icon" type="image/png" href="favicon.ico" />
<link rel="apple-touch-icon" href="apple-touch-icon.png" />
```

**Prompt:**

> Square app icon, 512x512. Near-black background (#0A0A0B) with a soft
> radial highlight in the upper-left corner suggesting a warm amber light
> source. A precise monogram "M.A." set in a clean monospace face,
> centered, in warm white (#E7E5E1) with the dots between letters rendered
> in amber (#F5A524). Tiny tick marks at the corners as if it's a
> registration mark. No gradient on the type. Sharp, instrument-like.

---

## What I deliberately did not include

- **Background hero photo of a person typing on a laptop** — cliché, and
  the design is intentionally typographic.
- **Stock dashboards or chart screenshots in the experience section** — the
  numbers strip beneath the Riggosaurus role does this job in pure HTML.
- **Animated GIFs of code being written** — never adds information.
- **A "Working on" project gallery with screenshots** — better to let the
  live GitHub fetch carry that section. Screenshots go stale; the API
  doesn't.
