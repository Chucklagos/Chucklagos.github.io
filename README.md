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

For a complete step-by-step tutorial in Spanish, see [Publishing posts](guides/PUBLISHING_POSTS.md).

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

The project build command is `npm run build` and its output directory is `dist/`. These are the build and publish settings to use when connecting the repository to Netlify.

The existing `.github/workflows/deploy.yml` also builds and deploys `dist/` to GitHub Pages on pushes to `master` or `main`, if Pages is configured to use **GitHub Actions**. This configuration is retained while the hosting choice is reviewed. `public/CNAME` is included in every build for the existing custom domain, `chucklagos.dev`.

## Resume

The supplied full-profile CV was the source for the website content. The downloadable summary is `public/Chuck_Guifarro_Resume.pdf`, linked from the hero and contact section. Replace this file when updating the resume and run `npm run build` to refresh the tracked `dist/` output.

Analytics loads through the shared layout on every Astro page; it does not depend on navigation markup. Translation widget scripts were removed. `/fv/` remains an independent static project.
