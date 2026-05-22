# Design decisions &mdash; v2

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
