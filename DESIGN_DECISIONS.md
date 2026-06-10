# Design decisions

The site ships in two versions side by side. Both reach the same content;
they differ in register.

- **v2** at `/` &mdash; the quiet, minimal, light-default page. This is the
  default landing. Most recruiters and visitors will only ever see this.
- **v3** at `/v3/` &mdash; an interactive 3D scene built with Three.js.
  Reached from the small "spatial" pill in v2's top bar. v3 also offers a
  "switch to flat" link back to v2 in its top corner.

The v2 rationale is below. The v3 rationale follows further down.

---

# v2 &mdash; quiet minimal

The first attempt (dark ink, amber accent, "engineering editorial") missed
badly. It led with the Riggosaurus 100-GPU number, used a black-and-gold
palette that didn't fit a European AI/ML student, and felt more "studio
brochure" than personal site.

This version starts from a different brief.

## Brief, in the user's own framing

- AI/ML student in Genova, curious-learner voice.
- Quiet and minimal &mdash; Swiss/Italian modernist.
- Light theme primary, dark theme as an optional toggle.
- A real photo on the page.
- "A bit fun," but never loud.
- Show a life, not a CV in a hardware costume.

## Direction: quiet personal essay

A single column. One typeface. One muted accent. A small photo. Sections
read top to bottom like a well-set personal essay, not like a portfolio.
The page should feel like the kind of site you stay on for two minutes
because the writing is clear, not because something animated tried to make
you stay.

Reference register (not to imitate, but to set the bar):

- **Brian Lovin** &mdash; calm, list-first, single accent.
- **Paco Coursey** &mdash; immaculate spacing, very few words, micro-section labels in muted small-caps.
- **Maggie Appleton** &mdash; warm cream, personal "Now" page, restrained.
- **Lee Robinson** &mdash; plain rows for "selected work" instead of cards.
- **Andrej Karpathy** &mdash; year-prefixed timeline rows, ruthless scannability.
- **Lucas Beyer** &mdash; inline middot navigation as plain text.

## Color

Light is the default and the design's primary state. Dark is a clean mirror
of the same hierarchy, with no separate visual language.

| Token | Light | Dark |
|---|---|---|
| `--bg` | `#F8F5EE` &mdash; warm cream, Renaissance-paper feel | `#14161A` &mdash; soft graphite |
| `--surface` | `#FFFFFF` | `#1B1E23` |
| `--text` | `#1A1A1A` | `#EAE8E2` |
| `--text-soft` | `#3D3D3D` | `#C4C2BD` |
| `--muted` | `#6B6B6B` | `#8A8D92` |
| `--rule` | `#DCD8CE` | `#2A2D34` |
| `--accent` | `#6B8E5B` &mdash; sage green | `#8FAE7C` &mdash; lighter sage for dark |

Sage as accent is deliberate. The user explicitly rejected black/gold ("not
this black gold bullshit"). Sage:

- Pairs cleanly with cream without warming it into "vintage."
- Picks up the green tones already in the user's photograph.
- Is distinct from the standard developer-portfolio cyan or terracotta.
- Survives dark mode by shifting to a slightly lighter chroma.
- Reads as "European garden" rather than tech.

The accent appears in three places only: timeline date stamps, link text,
and the hover state on project rows. Nothing else gets color.

## Typography

One typeface: **Inter Tight**, served from Google Fonts. Variable weight,
italic available, opentype features `ss01` and `cv11` enabled for the more
restrained Geist-style letterforms.

Why one face: Swiss/Italian modernist sites tend to be monolithic in
typography. Two faces or three add noise unless the second one is doing real
narrative work. Here it's not needed &mdash; the personality lives in the
writing.

Sizes:

- Body: 17px / 1.6 line-height. Comfortable for a single-column essay.
- Section labels (`h2`): 12.5px, lowercase, +0.08em tracking, muted color.
  These act like printed running headers, not like headlines.
- Timeline role titles: 16px / 500 weight, near-black.
- Hero name: clamped 1.7 to 2.15rem &mdash; intentionally restrained. The page
  doesn't need to shout the name; the URL already does.

## Layout

Single column, 44rem max width (~700px). Generous gutters on either side.
On desktop the photo sits in a 9.5rem column to the left of the hero text,
which is the only multi-column moment on the page. Everything else
is a single editorial column.

No card grid. No sidebar. No floating CTA.

## Motion

Almost none.

- Theme toggle: 180ms color transition.
- Link hover: color shift + the project row arrow nudges 3px.
- No scroll animations. No entrance fades. No parallax.

The user's first reaction to v1 included "useless" and "disaster" &mdash; the
fastest way to read as "designed, not engineered" is to remove the
animation and trust the typography.

## Section structure

1. **Hero** &mdash; small photo on the left, "Hi, I'm Mojtaba." in clamped 30px sans,
   one-line tagline, location + EU-2026/2027 availability.
2. **About** &mdash; four short paragraphs, in voice. The Iran-to-Italy
   trajectory, the BI chapter, Riggosaurus as a side chapter (not the
   lead), and what the M.Sc. is for.
3. **Now** &mdash; a small two-column key/value list: thesis, reading,
   building, learning, looking for. Easy to update every season.
4. **Work** &mdash; timeline list, year on the left, title in slightly bolder
   weight, then a short blurb. Five entries, reverse-chronological.
5. **Projects** &mdash; live-fetched from the GitHub API, six rows max, plain
   list. Each row: name + arrow, description, language dot + year on the
   right. Hover tints the row sage.
6. **Contact** &mdash; key-value list. Email, LinkedIn, GitHub, CV PDF.
7. **Currently** &mdash; one italic line at the bottom of main, before the
   footer. "currently: somewhere in Genova, fixing one more bug before
   the espresso wears off." This is the "a bit fun" touch, and it sits
   alone &mdash; easy for Mojtaba to hand-edit per season.

## Theme toggle behavior

Set on first paint via inline script in `<head>` to avoid a flash. Priority:

1. `localStorage.theme` if set to "light" or "dark."
2. Otherwise, `prefers-color-scheme`.
3. Otherwise, light.

The toggle stores the user's manual choice. The icon swaps between a moon
(light theme &mdash; click to go dark) and a sun (dark theme &mdash; click to go light).

## Accessibility

- Single H1 (`Hi, I'm Mojtaba.`), hierarchical H2/H3.
- Body text contrast: light theme 12.6:1, dark theme 12.4:1 &mdash; both AAA.
- Muted text contrast: light theme 4.8:1, dark theme 5.2:1 &mdash; both AA.
- Focus rings: 2px sage outline with 3px offset.
- `prefers-reduced-motion` respected (transitions resolve to ~0ms).
- Keyboard reachable: every interactive element responds to Enter/Space.
- The skip link is visible on focus and the first tab stop.

## What I deliberately did not include

- A "stats" strip with a counter animating 0&rarr;100+ GPUs. This was the
  loudest mistake in v1.
- A "tapestry" hero gradient or any background ornament.
- Hover-locked easter eggs / cursor effects.
- Multiple typefaces.
- A "skills" matrix with bars or percentages.
- A "what makes me different" section.
- Open Graph image &mdash; ships without one rather than ship something wrong.
  See `MEDIA_PROMPTS.md` for the OG card prompt if/when one is added.

## Files

```
index.html         all markup, all copy
styles.css         tokens at the top, single column from there
app.js             theme toggle, footer year, GitHub fetch
photo.jpg          800x1000 portrait, 4:5, compressed JPEG ~80KB
404.html           matches the system
CV/                LaTeX source + rendered PDF
sitemap.xml
DESIGN_DECISIONS.md (this file)
MEDIA_PROMPTS.md
README.md
```

No build step. GitHub Pages serves the files directly. The whole site is
under 30KB excluding the photo and the Google Fonts subset.

---

# v3 — spatial

## Brief

The user asked for a "high-end modern 3D personal website," explicitly in
the register of [bruno-simon.com](https://bruno-simon.com) (drivable 3D
portfolio). Two constraints made a full Bruno-Simon equivalent impossible
in scope: it has to ship as static files on GitHub Pages (no backend, no
build step), and a polished interactive 3D world takes months, not a
single session.

The compromise this version makes: an interactive Three.js scene strong
enough to feel like a real spatial experience, with a clear path for the
user (or me, on a follow-up) to grow it into something deeper.

## What v3 actually is

A dark room with a soft horizon glow. The user's initials hang in glass at
the center. Five iridescent objects orbit the medallion — one for each
section. Drag to look around. Click an object to open its section as a
frosted-glass panel that floats over the scene.

| Section | Geometry | Why |
|---|---|---|
| about | icosahedron | one of the platonic solids — "the self" |
| now | torus | a ring, time cycling |
| work | cube | the solid block of accumulated history |
| projects | torus knot | connected loops — the projects link into each other |
| contact | cone | a signal pointing outward |

The shapes are mostly an aesthetic choice; the symbolism is a happy
accident, not a rule.

## Tech

- **Three.js 0.160**, loaded as ES modules from `unpkg` via an importmap.
  No bundler, no build step.
- **`MeshPhysicalMaterial`** for the orbiting shapes, with `transmission`,
  `iridescence`, and a procedural cubemap environment to give them
  something to reflect.
- **A small inline `CanvasTexture`** for the initials on the central
  medallion. When the user supplies a new photo for v3, this slot becomes
  an image plane on top of the medallion.
- **`OrbitControls`** with damping, auto-rotation that pauses on first
  user interaction.
- **`Raycaster`** for hover (cursor + scale pulse) and click (opens the
  panel).
- HTML panels for content. Doing the section content as DOM (rather than
  3D text) keeps the copy selectable, screen-reader accessible, and
  trivial to edit later.

## Color

The v3 palette is its own thing, not a mirror of v2:

| Token | Hex | Usage |
|---|---|---|
| `--space` | `#08081A` | Background, deep blue-black |
| `--ink` | `#F5F5FA` | Primary text |
| `--ink-soft` | `#C2C2D0` | Secondary text |
| `--ink-dim` | `#76768A` | Tertiary text, eyebrows |
| `--accent` | `#8FB5E8` | Iceberg blue — used for highlights, links |
| `--accent-2` | `#C9B6F0` | Soft violet — second pole of the iridescent gradient |

The accent stays on the cool side deliberately. The brief said "no
black/gold," so v3 stays away from any warm metallic. The iceberg blue
plus the soft violet are a deliberate Apple Vision Pro / iOS 17 Liquid
Glass register, not the Italian luxury palette the design-system tool
initially suggested.

## Performance

- Pixel ratio capped at `min(devicePixelRatio, 2)`.
- Particle count halved on screens narrower than 700px (250 instead of
  600).
- No `EffectComposer` / postprocessing in v1 — every effect is in the
  base material.
- The procedural cubemap is generated once on load (six 256×256 canvases).
- WebGL feature probe at boot. If WebGL is unavailable, the page
  immediately redirects to v2.

## Accessibility

- The 3D scene is decorative. All section content is reachable in the DOM
  via the panel overlays, which are standard HTML.
- Panels respect ESC to close.
- A noscript fallback links to v2.
- `prefers-reduced-motion` collapses transitions to ~0.
- A persistent "switch to flat" link in the top corner sends the user
  back to v2 at any time.

## What v3 deliberately is NOT

- A driveable car / Bruno Simon parity. That's weeks of physics work plus
  custom asset modeling. The current scene is the foundation, not the
  goal.
- A flat dark version of v2. v3 has its own palette, its own type
  treatment, its own register.
- Mobile-equal experience. The panel UI works on mobile, but the orbit
  feel and the materials are best on a real machine with hardware
  acceleration. On phones, recruiters will likely use v2 anyway.

## What v3 could grow into (notes for next time)

- A real custom font for the initials, loaded via `FontLoader`, replaced
  with the user's actual name in 3D extruded text.
- Per-section camera animations (fly in / fly out) instead of a static
  panel overlay.
- Postprocessing: subtle bloom on the medallion, depth-of-field on the
  orbit objects when one is focused.
- A photograph plane on the medallion once the user sends one — already
  scaffolded in `makeTextTexture` and the central group.
- Replace the geometric primitives with custom GLTFs that represent the
  sections more literally: a tiny rig for work, a notebook for now, etc.

## Files

```
v3/
  index.html         entry point + panels markup
  style.css          overlay UI styles
  main.js            Three.js scene
```

