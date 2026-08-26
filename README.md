# chucklagos.dev

Personal website for Chuck Guifarro Lagos, presenting professional experience across web development, systems and infrastructure, production support, and hands-on technical coordination.

The site is intentionally built without a framework or build process. It uses semantic HTML, CSS, and a small amount of vanilla JavaScript, and is published through GitHub Pages.

## Project structure

```text
/
├── index.html          # Main professional website
├── css/custom.css      # Site design, responsive layout, and themes
├── js/main.js          # Theme switcher, mobile navigation, and footer year
├── img/                # Optimized site and social-preview images
├── resume.pdf          # Downloadable resume
├── docs/
│   ├── index.html      # Technical Notes landing page
│   ├── bash.html       # Linux and Bash reference
│   └── git.html        # Git and GitHub reference
└── fv/                 # Independent static project, available by direct URL
```

## View locally

Because there is no build step, the site can be served from the repository root with any static file server. For example:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

Opening `index.html` directly also displays the content, but a local server is recommended because it reproduces GitHub Pages routing more accurately.

## Deployment

The repository is designed for GitHub Pages. Changes pushed to the configured publishing branch are served as the website; no generated build directory is required.

## Notes

- `resume.pdf` is maintained separately from the web content.
- `/docs/` is the Technical Notes section and shares the portfolio's design, responsive navigation, and theme preference.
- `/fv/` is an independent static page and is intentionally not linked from the professional portfolio.
- The main page respects system light/dark preferences and stores a manual theme selection in `localStorage`.

## Add a technical guide

1. Create a new semantic HTML file under `/docs/`.
2. Reuse the documentation header, footer, `../css/custom.css`, and `../js/main.js` from an existing guide.
3. Add the guide to `/docs/index.html`.
4. Keep relative navigation, heading hierarchy, keyboard focus, and mobile code-block overflow accessible.
