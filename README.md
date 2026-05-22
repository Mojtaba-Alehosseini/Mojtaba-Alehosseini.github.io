# mojtaba-alehosseini.github.io

Source for [mojtaba-alehosseini.github.io](https://mojtaba-alehosseini.github.io/).

## Stack

Pure HTML, CSS, vanilla JS. No build step. GitHub Pages serves the files
as-is.

```
index.html              markup + copy
styles.css              single-column visual system, tokens at the top
app.js                  theme toggle, footer year, live GitHub fetch
photo.jpg               800x1000 portrait
404.html                error page in the same system
CV/                     LaTeX source and rendered PDF
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
