# mojtaba-alehosseini.github.io

Source for [mojtaba-alehosseini.github.io](https://mojtaba-alehosseini.github.io/) — my personal site.

## Stack

Pure HTML, CSS, and vanilla JavaScript. No build step. GitHub Pages serves the
files as-is. The whole thing is three files plus a 404 page.

```
index.html      markup + copy
styles.css      visual system (design tokens at the top)
app.js          section reveal, hero counter, GitHub repo fetch
404.html        matches the system
CV/             LaTeX source and rendered PDF
```

## Design

The aesthetic and the reasoning behind every major choice live in
[`DESIGN_DECISIONS.md`](DESIGN_DECISIONS.md). Visual slots and the prompts
used to generate any image assets live in
[`MEDIA_PROMPTS.md`](MEDIA_PROMPTS.md).

## Local preview

Any static server works.

```bash
python3 -m http.server 8000
# or
npx serve .
```

Then open `http://localhost:8000`.

## Deploy

Push to `main`. GitHub Pages serves the root of the repository.

## License

The code in this repository is MIT. The copy and the CV content are
copyrighted by Mojtaba Alehosseini.
