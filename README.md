# mojtaba-alehosseini.github.io

Source for [mojtaba-alehosseini.github.io](https://mojtaba-alehosseini.github.io/).

## Stack

Pure HTML, CSS, vanilla JS. No build step. GitHub Pages serves the files
as-is.

```
index.html              markup + copy
styles.css              tokens, top bar, hero, sections, portrait + origami
viz.css                 the two repository figures (ring and radar)
app.js                  theme toggle, scroll reveal
portrait-interaction.js webcam hand tracking for the origami portrait
repos-data.js           every public repo, generated from the GitHub API
repo-nest.js            ring figure: repos by field, languages on the outer ring
repo-radar.js           radar figure: repos weighed by field, drag to spin
assets/                 portrait, origami video, hand demo
CV/                     the current CV (PDF)
404.html                error page in the same system
sitemap.xml             two URLs
```

## Design

The aesthetic and the reasoning behind every major choice are in
[`DESIGN_DECISIONS.md`](DESIGN_DECISIONS.md). Image slots and prompts for
anything future are in [`MEDIA_PROMPTS.md`](MEDIA_PROMPTS.md).

## Local preview

Any static server works.

```bash
python -m http.server 8000
# or
npx serve .
```

Then open <http://localhost:8000>.

## Deploy

Push to `main`. GitHub Pages serves the root.

## License

Code is MIT. Copy, CV content, and photograph belong to Mojtaba Alehosseini.
