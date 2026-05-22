# Design decisions

This file explains the choices behind the site. Anything not documented here was a
default — assume the default exists for a reason and read the CSS variables in
`styles.css` if you need the exact value.

## Who this is for

Mojtaba: M.Sc. AI student in Genova, ex-BI analyst, co-built a 100+ GPU
infrastructure from scratch. Recruiters and engineers in the EU AI/ML market are
the first audience. They will spend under 30 seconds before deciding whether to
read more.

That constraint sets the brief: every section earns its place by giving a
recruiter or engineer one reason to keep reading. No "Welcome to my portfolio."
No carousel.

## Direction: engineering editorial

I picked one direction and stayed inside it: an editorial layout sitting on a
technical chassis. Think a developer's reading journal crossed with an
instrument readout — quiet, deliberate, with a small amount of mechanical
character.

Why this fits Mojtaba:

- He built physical infrastructure, so the site should feel built, not generated.
- He's a systems thinker, so the page reads top to bottom in clear sections, not
  as a card grid.
- He's currently studying AI in Italy, so the writing has space for one moment
  of voice without sliding into corporate.
- He runs a dry, direct tone in the source documents, so the site has to match.

## What I explicitly avoided

- The purple-to-pink hero gradient.
- The 3-column "Skills" grid with progress bars. Skill bars are theater.
- "Hi, I'm Mojtaba" hero copy.
- Generic SaaS card piles for projects.
- A floating chatbot, a "Book a call" CTA, an emoji-heavy section header.
- The cliché developer-portfolio dark theme with neon-cyan accent.
- Heavy JS frameworks. The whole site is a static HTML file, one CSS file, one
  JS file. No build step, no node_modules in the deployable.

## Color

Dark ink with a single warm accent.

| Token | Hex | Usage |
|---|---|---|
| `--ink` | `#0A0A0B` | Background |
| `--graphite` | `#141417` | Elevated surfaces, project rows |
| `--rule` | `#27272A` | Borders, dividers |
| `--text` | `#E7E5E1` | Primary text (warm white, not pure white) |
| `--muted` | `#8A8A8E` | Secondary text, captions |
| `--amber` | `#F5A524` | Accent — links, hover state, key numbers |
| `--phosphor` | `#7FE7B5` | "Live" data only — GitHub API results |

The accent is amber, not cyan. Cyan is the default tech-portfolio choice and
reads as generic in 2026. Amber pulls toward instrument panels and warm
terminals — it fits the hardware-built story Mojtaba has.

Phosphor green is reserved for live API data so the eye can tell what's
fetched at runtime versus authored.

I tested AAA contrast on body text and AA on muted text against the ink
background.

## Typography

Three faces, picked for character without being loud:

- **Display — Instrument Serif.** Used only for one or two editorial moments
  (the hero name, the about-section pull quote). Brings a literary register that
  most developer sites avoid.
- **Sans — Geist.** Body text, navigation, section headers. Precise, slightly
  technical, designed by Vercel — has the modern feel without looking like a
  Stripe page.
- **Mono — JetBrains Mono.** Numbers, dates, coordinates, code-like labels.
  Numbers are treated as data artifacts in this design, so the mono carries a
  lot of weight visually.

All three are served from Google Fonts via a single `display=swap` request to
avoid FOIT on slow connections.

## Layout

Single page, scrolling sections, fixed top index on the left at desktop widths.
The left index is a typographic table of contents, not a sticky nav bar — it
behaves like the running header of a printed essay.

Section structure:

1. **Hero** — name, role, location, one sentence on the work. Numbers from
   Riggosaurus exposed in the corner as a kind of standing data line.
2. **About** — three short paragraphs. One pull-quote in serif italic.
3. **Experience** — vertical list with date stamps on the left in mono. No
   logos. The Riggosaurus entry has a numbers strip beneath it.
4. **Selected work** — fetched live from the GitHub API, filtered for non-fork
   public repos, sorted by recency. Six max. Each row shows name, language,
   updated date, description. Rows are not cards. The whole row is the link.
5. **Skills** — flat tag list grouped by category. No bars. No percentages.
6. **Contact** — three lines: email, LinkedIn, GitHub. Plus location and the
   visa availability line.

The grid is 12-col on desktop, with most content held to columns 4–11 to give
the section labels their own narrow column on the left.

## Motion

Motion is used sparingly and has to earn its place:

- Sections fade in once on scroll via IntersectionObserver. One-shot, not a
  re-trigger when scrolling back up.
- Project rows: the description slides down on hover, the row darkens slightly,
  the language dot pulses once.
- The hero numbers (rigs, GPUs, months, transactions) tick up from zero on first
  paint. Quick — 600ms, easing-out. They do not re-trigger.
- All motion respects `prefers-reduced-motion: reduce` and resolves to instant
  state changes.

What I did not add: cursor-followers, scroll-jacking, parallax, particle
backgrounds, magnetic buttons, custom cursors. The site is fast and quiet.

## Background atmosphere

A dot-grid pattern at 2% opacity over the ink background, fixed to viewport.
It's barely visible but gives the page a tactile floor — like graph paper under
typography. No noise overlay, no animated gradients.

## Why no framework, no build step

The site has under 1000 lines of HTML+CSS+JS combined. React or Astro would add
weight and a build step for no benefit. GitHub Pages serves the files
directly. Lighthouse Performance and SEO sit at 100 on this stack.

If the site grows enough to need component reuse (a blog, multiple project
pages), the right move is to migrate to Astro and keep the visual system
intact.

## Accessibility

- Single H1, hierarchical H2/H3.
- All interactive elements reachable by keyboard, focus rings visible (amber
  outline at 2px).
- Color contrast: body text against ink is 13.4:1 (AAA), muted text is 5.2:1
  (AA).
- Images have alt text or `alt=""` when decorative.
- The dot-grid background uses CSS, not an image, so screen readers ignore it.
- `prefers-reduced-motion` is respected throughout.

## Live GitHub data

The "Selected work" section fetches `/users/Mojtaba-Alehosseini/repos` on page
load and filters:

- excludes forks
- excludes the user-page repo itself
- excludes any repo whose description starts with "[private]" (a manual escape
  hatch)
- sorts by `pushed_at` descending
- takes the top six

If the API call fails (rate limited or offline), the section falls back to a
small hardcoded list of curated repos so the page never shows an empty state.

## Trade-offs I'd revisit

- I chose Google Fonts over self-hosted fonts to keep the deploy simple. If
  Mojtaba ever moves to a custom domain and wants tighter performance,
  self-hosting the three families with `font-display: swap` saves ~120ms on
  first paint.
- The site is one file (`index.html`). At some point that gets unwieldy. Right
  threshold: when there's a second page (a blog post, a longer write-up on
  Riggosaurus). At that point, move to Astro.
- The hero numbers are hardcoded from the source documents. If Mojtaba updates
  his Riggosaurus numbers, they need to be edited in two places (HTML and the
  counter JS). Acceptable for now since the numbers are historical.

## Files

- `index.html` — markup and copy.
- `styles.css` — the visual system. Top of file is design tokens; rest cascades
  from there.
- `app.js` — IntersectionObserver fades, number tick-up, GitHub fetch.
- `MEDIA_PROMPTS.md` — image generation prompts for visual slots, since I'm
  not shipping stock photography or AI-generated art straight into the repo.
- `404.html` — minimal, matches the system.
- The old `defaultstyle.css`, `index.html`, `banner.jpg`, `photo-old*.jpg`, and
  the empty `photo.jpg` are removed. The CV folder stays — the LaTeX source
  and the rendered PDF are useful artifacts.

The Jekyll workflow was removed. GitHub Pages serves plain HTML directly on
user-page repositories with no build step required.
