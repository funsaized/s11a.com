# AGENTS.md — s11a.com Personal Blog

Gatsby 5 + React 18 + TypeScript blog. Tailwind CSS v3 + shadcn/ui components. MDX content. Deployed on Netlify.

## Build & Dev Commands

```bash
npm run dev              # Start Gatsby dev server (localhost:8000)
npm run build            # Production build → public/
npm run serve            # Serve production build locally
npm run clean            # Clear .cache/ and public/
npm run typecheck        # tsc --noEmit (strict mode)
npm run lint             # ESLint with airbnb + prettier config
npm run format:js        # Prettier write on all JS/TS files
npm run export-notes      # Export Apple Notes to MDX (use --dry-run to preview)
npm run export-notes -- --dry-run   # Preview export without writing files
npm run export-notes -- --verbose   # Show per-note details during export
npm run lighthouse       # Lighthouse performance audit
npm run lighthouse:ci    # Build → serve → Lighthouse → kill
```

No test framework is configured. `npm test` is a placeholder that exits 1.
No pre-commit hooks (no Husky/lint-staged).

- **Node version**: v22.4.1 (.nvmrc). Netlify builds use Node 18.
- **Note**: No Python dependencies required — pipeline is pure TypeScript.

## Lint & Type Configuration

- **ESLint**: flat config (`eslint.config.mjs`), airbnb-style rules + prettier
  - `@typescript-eslint/parser` for `.ts/.tsx`
  - Unused vars: prefix with `_` to ignore (`argsIgnorePattern: "^_"`)
  - `no-console`: warn level, `console.warn` and `console.error` allowed
  - `react/no-unescaped-entities`: error — use `&apos;` `&quot;` in JSX
  - `import/order`: off (no enforced import sorting)
  - Ignored: `src/content/**`, `src/components/ui/**`, `gatsby-node.js`, `gatsby-ssr.js`
- **TypeScript**: `strict: true`, target es2018, `noEmit: true`
  - Path alias: `@/*` → `./src/*` (also in webpack config via `gatsby-node.js`)
- **Prettier**: v3, no config file — uses defaults (double quotes, trailing commas)

## Code Style

### Imports

Order (convention, not enforced):

1. React core (`import React from "react"`, `import { useState } from "react"`)
2. Gatsby (`import { graphql, Link } from "gatsby"`, `import type { HeadFC, PageProps } from "gatsby"`)
3. External libraries (`@mdx-js/react`, `@radix-ui/*`, `class-variance-authority`)
4. Internal — relative paths (`../components/layout/Layout`, `../../utils/cn`)

Use `import type { ... }` for type-only imports. Double quotes throughout.

### Components

- **Functional components only** — no class components
- **Named exports** for reusable components: `export function Layout({ ... }: LayoutProps)`
- **Default exports** for pages and templates: `export default IndexPage`
- **Pages**: typed as `React.FC<PageProps<DataType>>`
- **Templates**: typed as `React.FC<TemplateProps>` with inline interface
- **UI primitives** (shadcn): plain `function` declarations, named exports at bottom
- **No `React.FC`** on small/utility components — use plain functions with typed props
- Destructure props in function signature

```tsx
// Reusable component pattern
interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function Layout({ children, title }: LayoutProps) {
  return <div>...</div>;
}

// Page pattern
const MyPage: React.FC<PageProps<MyPageData>> = ({ data }) => { ... };
export default MyPage;

// shadcn/ui pattern
function Button({ className, variant, ...props }: ButtonProps) { ... }
export { Button, buttonVariants };
```

### TypeScript

- `strict: true` — do NOT use `as any`, `@ts-ignore`, or `@ts-expect-error`
- Interfaces for component props — PascalCase, no `I` prefix (`LayoutProps`, not `ILayoutProps`)
- Inline interfaces in the file where used; shared types in `src/data/sampleData.ts`
- Union types for constrained values: `type Theme = "light" | "dark" | "system"`
- GraphQL result types defined as interfaces above the component

### Naming Conventions

| Item             | Convention | Example                           |
| ---------------- | ---------- | --------------------------------- |
| Components       | PascalCase | `Hero.tsx`, `TableOfContents.tsx` |
| Pages            | kebab-case | `articles.tsx`, `404.tsx`         |
| Directories      | kebab-case | `text-type/`, `article/`          |
| Hooks            | camelCase  | `useTheme.ts`                     |
| Utilities        | camelCase  | `cn.ts`                           |
| Interfaces/Types | PascalCase | `Article`, `LayoutProps`          |
| CSS variables    | kebab-case | `--primary`, `--background`       |

### Styling

- **Tailwind CSS v3** with `class` dark mode strategy
- `cn()` utility (`src/utils/cn.ts`) for conditional class merging — uses `clsx` + `tailwind-merge`
- CSS custom properties for theming in `src/styles/globals.css`
- shadcn/ui components use `cva` (class-variance-authority) for variant styling
- No CSS modules, no styled-components, no SCSS
- Theme tokens: `bg-background`, `text-foreground`, `text-muted-foreground`, `border`, etc.

### Error Handling

- `try/catch` for async operations (clipboard API, fetch, etc.)
- Log errors with `console.error("descriptive message:", err)`
- No error boundary components currently exist
- Gatsby `reporter.panicOnBuild()` for GraphQL errors in `gatsby-node.js`

## Project Structure

```
src/
  components/
    article/        # Single-article view (TableOfContents, SharingComponent)
    articles/       # Article listing (SearchInput, Pagination, filters)
    home/           # Homepage sections (Hero, Projects, ArticleList)
    layout/         # Layout, Header, Footer, SEO, ThemeToggle
    mdx/            # MDX custom renderers (HeadingComponents)
    text-type/      # Typing animation component
    ui/             # shadcn/ui primitives (button, badge, card, select)
  content/
    articles/       # MDX blog posts
    notes/          # MDX notes
  data/             # Shared TypeScript interfaces and static data
  hooks/            # Custom React hooks (useTheme)
  lib/              # Library utilities
  pages/            # Gatsby pages (index, articles, notes, 404)
  styles/           # Global CSS (globals.css, prism-theme.css)
  templates/        # Page templates (article.tsx, note.tsx)
  utils/            # Utility functions (cn.ts)
scripts/
  export-notes/     # Apple Notes → MDX export pipeline (TypeScript CLI, own tsconfig)
  deploy/           # Pre-deploy validation + build script
  performance/      # Lighthouse CI runner (thresholds: P:90 A:95 BP:90 S:95)
```

## Content (MDX)

Articles in `src/content/articles/`, notes in `src/content/notes/`.

Required frontmatter for articles:

```yaml
---
title: "Article Title"
slug: article-slug
excerpt: "Brief description"
date: "2024-01-15"
category: "Backend"
tags: ["Node.js", "API"]
readingTime: "5 min read"
featured: false
author: "Sai Nimmagadda"
---
```

Categories: Backend, Frontend, Healthcare, Architecture, DevOps, Database, Cloud, Security.

### Notes Export Pipeline

Notes are exported from Apple Notes via `npm run export-notes`. Categorization is folder-based — each Apple Notes folder maps to a category directory in `src/content/notes/`.

- **Access method**: JXA/osascript (not SQLite) — Apple Notes native hashtags are NOT accessible via JXA
- **Categorization**: Folder name → emoji-stripped PascalCase (e.g. `📋 Planning & Strategy` → `Planning-Strategy`)
- **Excluded**: Notes with `#private` or `#work` in body text, archived folders
- **Images**: Extracted from HTML (base64 + web URLs), HEIC converted to JPEG via sharp, written to `static/images/articles/`
- **Atomic write**: Notes written to temp directory, then swapped atomically (crash-safe)

## GraphQL Patterns

- **Page queries**: `export const query = graphql` at bottom of page/template files
- **Type results** with interfaces above the component
- **Gatsby Head API**: `export const Head: HeadFC = () => (...)` — no react-helmet
- Content filtering: `filter: { internal: { contentFilePath: { regex: "/content/articles/" } } }`
- Page creation in `gatsby-node.js` (CommonJS — `exports.createPages`)

## Key Files

- `gatsby-config.ts` — Plugin configuration (MDX, images, sitemap, analytics)
- `gatsby-node.js` — Page creation + webpack `@/` alias (CommonJS, not TS)
- `gatsby-ssr.js` — Theme flash prevention (CommonJS)
- `netlify.toml` — Build config, security headers, cache rules, `--legacy-peer-deps`
- `tailwind.config.js` — Content paths, typography plugin, custom animations
- `eslint.config.mjs` — Flat config, airbnb-style rules + prettier
- `tsconfig.json` — Strict TS, path aliases
- `components.json` — shadcn/ui component config (aliases, icon lib: lucide)

## Gotchas

- `gatsby-node.js` and `gatsby-ssr.js` are CommonJS (`require`/`exports`) — the rest of the project is ESM
- Path alias `@/*` requires BOTH `tsconfig.json` paths AND `gatsby-node.js` webpack alias
- No test suite — validate changes with `npm run typecheck && npm run lint && npm run build`
- Prettier has no config file — uses defaults (double quotes, trailing commas, 80 char width)
- MDX content uses `gatsby-remark-prismjs` for syntax highlighting, not rehype-prism
- JSX text: `react/no-unescaped-entities` is error-level — use `&apos;` not `'` in JSX
- `gatsby-plugin-preact` swaps React for Preact at runtime (smaller bundle)
- No GitHub Actions CI — build/deploy is Netlify-only (push triggers deploy)
