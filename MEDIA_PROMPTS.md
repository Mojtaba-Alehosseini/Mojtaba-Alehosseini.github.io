# Media prompts &mdash; v2

The site ships with one real image: `photo.jpg`. Everything else is
typography. That's intentional &mdash; the brief is "quiet, minimal,
Swiss/Italian modernist," which means images compete with the design unless
they're carefully placed and individually justified.

If you want to add anything later, these are the slots and the prompts.
All prompts assume the v2 palette (cream `#F8F5EE`, ink `#1A1A1A`, sage
`#6B8E5B`). Keep generation tools tightly constrained to that palette.

---

## 1. Open Graph / social-preview card

**Why:** Right now the site has no `og:image`. LinkedIn and X show
plain-text unfurls. A simple OG card lifts the link from "URL" to
"preview tile."

**Dimensions:** 1200&times;630, PNG (or JPEG at quality 90).
**Filename:** `og-card.png` at the repo root.

**Markup change once added:**

```html
<meta property="og:image" content="https://mojtaba-alehosseini.github.io/og-card.png" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="https://mojtaba-alehosseini.github.io/og-card.png" />
```

**Prompt:**

> Editorial layout, 1200x630 pixels, warm cream background (#F8F5EE), subtle
> paper-grain texture barely visible. Set in Inter Tight or a similar neutral
> grotesk. Left-aligned, generous margins. Top line in small lowercase
> letterspaced grey: "mojtaba-alehosseini.github.io". Then a single large
> headline in dark ink (#1A1A1A): "Hi, I'm Mojtaba." Below in a slightly
> softer weight: "M.Sc. AI student at the University of Genova." At the
> bottom, a thin sage-green (#6B8E5B) divider rule and one short line:
> "currently: LLMs, computer vision, the gap from model to product." No
> photography, no illustration, no gradients. Looks like a journal cover.

---

## 2. Photo replacement / Pisa shot

The site uses `photo.jpg` (the older outdoor portrait). If you want to swap
to the Leaning Tower of Pisa shot later, drop the new file in at the same
path and dimensions:

**Dimensions:** 800&times;1000 (4:5 portrait), JPEG, quality 80&ndash;85,
progressive, under 100KB.

```bash
# How the current photo was produced
python -c "
from PIL import Image
im = Image.open('source.jpg')
# crop to 4:5 portrait, centered
w, h = im.size
new_w = int(h * 4 / 5)
left = (w - new_w) // 2
im.crop((left, 0, left + new_w, h)).resize((800, 1000), Image.LANCZOS).save(
    'photo.jpg', 'JPEG', quality=82, optimize=True, progressive=True)
"
```

No HTML changes needed; `index.html` already declares the dimensions.

---

## 3. Favicon set

**Why:** The current favicon is an inline SVG data URL that renders a single
lowercase `m` in dark on cream. That's fine and ships zero bytes, but
iOS doesn't render SVG home-screen icons and high-DPI browsers prefer
PNG.

**Files to add:**

- `favicon.ico` &mdash; 32&times;32, fallback for legacy browsers.
- `apple-touch-icon.png` &mdash; 180&times;180, for iOS home screens.
- `icon-512.png` &mdash; 512&times;512, for a future PWA manifest.

**Markup change once added:**

```html
<link rel="icon" type="image/png" href="favicon.ico" />
<link rel="apple-touch-icon" href="apple-touch-icon.png" />
```

**Prompt:**

> Square app icon, 512x512 pixels. Warm cream background (#F8F5EE) with
> a 32-pixel rounded corner. A single lowercase letter "m" in dark ink
> (#1A1A1A), centered, set in Inter Tight at weight 500. To the right
> of the "m," a small sage dot (#6B8E5B) sized to match the "m"'s
> x-height. No outline, no gradient, no texture. The mark should read
> as a personal monogram, not a logo.

---

## 4. A schematic of the Riggosaurus rig (optional, low priority)

**Why:** The Work section currently describes Riggosaurus in a single
paragraph. If you ever want a deeper page about that chapter, a small
hand-drawn schematic could anchor it. For the front page, skip it.

**Dimensions:** 1200&times;600 banner, PNG with transparent background.

**Filename:** `riggosaurus-schematic.png`.

**Prompt:**

> Hand-drawn schematic, single-color sage (#6B8E5B) line on transparent
> background. Open-air GPU rig in exploded view: motherboard at the
> bottom, six GPUs spread on PCIe risers above, two PSUs to one side,
> a metal frame holding everything together. Annotate each piece with
> thin pointer lines leading to lowercase labels in a neutral sans:
> "gpu &times;6," "psu," "riser," "frame." Hairline weights only, no
> fills. Style: blueprint or patent drawing, drawn for clarity rather
> than detail.

---

## What I did not include

- **Stock dashboards or chart screenshots.** The BI work is described in
  the Work section in plain text. Adding screenshots adds visual weight
  without information.
- **Animated GIFs of code.** Never helpful.
- **Project thumbnails.** The Projects section pulls live data from
  GitHub. Thumbnails for code projects almost always read as screenshots
  of notebooks &mdash; noise rather than signal.
- **A separate "Now" page illustration.** The Now block is small key/value
  text already; an illustration would compete with the typography.
- **A custom dark-mode photo.** The single portrait reads on both light and
  dark backgrounds thanks to a small `filter: saturate(0.92)` desaturation.
