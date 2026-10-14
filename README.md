# chucklagos.dev

Personal portfolio and searchable technical notebook, built with Astro and Tailwind CSS. English is the canonical language. The original visual design, responsive navigation, and persistent light/dark theme are preserved.

## Local development

Requires Node.js 22.12+ (or a supported newer release).

```bash
npm ci
npm run dev
npm run check
npm run build
npm run preview
```

## Content

- `src/pages/index.astro`: complete professional profile.
- `src/data/projects.json`: short freelance and professional project descriptions, with contribution boundaries. Freelance projects appear first.
- `src/data/certifications.json`: professional development entries.
- `src/components/`: reusable profile sections and navigation.
- `src/layouts/Layout.astro`: shared metadata, footer, and Google Analytics (`G-7HZQN96LNZ`).
- `src/content/blog/*.md`: articles managed as an Astro content collection.
- `src/styles/legacy.css`: existing visual tokens and styles.
- `src/styles/global.css`: Tailwind utilities and shared additions; the reset is omitted to preserve the original design.
- `public/fv/`: existing independent static project.

### Add a blog article

Create `src/content/blog/my-note.md`:

```markdown
---
title: "My technical note"
description: "A short description of what this reference covers."
tags: ["Linux", "Infrastructure"]
draft: false
# Optional, when you actually revise an article:
# updated: 2026-10-13
---

## First section

Write in Markdown. Use fenced code blocks for commands and configuration.
```

The article appears at `/blog/my-note/`. The blog index and homepage discover published articles automatically; `draft: true` excludes an article from routes and search. Search matches the title, description, tags, and full article body, combines multiple search terms, and can be narrowed by topic. It runs locally in the browser. Each article has a generated table of contents.

Existing `/docs/` and `/docs/*.html` addresses redirect to the new blog routes in the static build. Original guide content was migrated without introducing new technical recommendations.

## Deployment

`.github/workflows/deploy.yml` builds and deploys `dist/` on pushes to `master` or `main`. In repository Settings → Pages, select **GitHub Actions** as the source. Keep the custom domain set to `chucklagos.dev`; `public/CNAME` is included in every build. The workflow has not been published or run as part of the local migration.

## Resume

The supplied full-profile CV is the source for the website content. The downloadable summary link is intentionally pending the new PDF. When ready, put the summary at `public/resume.pdf` and add `/resume.pdf` to the hero and contact actions. The original root PDF files are retained as source material and are not copied into the public build.

Analytics loads through the shared layout on every Astro page; it does not depend on navigation markup. Translation widget scripts were removed. `/fv/` remains an independent static project.
