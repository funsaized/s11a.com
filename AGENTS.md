# s11a.com

TanStack Start blog. React 19, Vite 8, Tailwind v4, Oxfmt/Oxlint. Hosted on Vercel via Nitro.

## Commands

Run from the repository root:

```bash
npm ci
npm run dev          # :3001
npm run check        # generate-routes + format + lint + typecheck
npm run build        # prerender → .output
npm run test:e2e     # desktop + mobile Chromium
```

Do not use prettier or eslint. Format with `oxfmt`, lint with `oxlint`.

## Layout

- `src/routes/` — file-based routes (`__root`, `index`, `about`, `articles/$slug`)
- `src/content/articles/` — MDX. Frontmatter `slug` is the URL, not the filename.
- `src/lib/article-metadata.ts` — Zod-validated registry
- `src/lib/seo.ts` — `head` helpers
- `src/lib/site.ts` — `SITE_ORIGIN`

There is no Gatsby app in this tree. Historical SOURCE lives in git history.

## Content

Add an article by dropping an `.mdx` file in `src/content/articles/` with the frontmatter schema in `article-metadata.ts`. Prerender discovers linked routes via `crawlLinks`.
