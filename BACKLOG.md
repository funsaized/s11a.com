# TanStack Start Migration — Learning Backlog

> **Branch:** `feat/tanstack-start-migration`
> **Status:** Not started
> **Owner:** Sai (implementation) — this is a hands-on learning exercise, not a hand-off.

---

## 1. Why this project exists

### The technical driver

Gatsby 5 shipped its last major in November 2022. As of August 2026 the situation is:

| Signal | State |
|---|---|
| `gatsby` weekly npm downloads | ~305K and declining (was ~450K in early 2023) |
| Last major release | Gatsby 5, Nov 2022 |
| React ceiling | Pinned at 18.x — React is at 19.2 |
| MDX ceiling | `gatsby-plugin-mdx` pins MDX v2 — MDX is at v3 |
| Transitive CVE burden | 5 entries in `overrides` (`cookie`, `immutable`, `lodash`, `path-to-regexp`, `webpack`) |
| Recent commit history | Last two non-feature commits are both dependency-security patches |

The blog works. The problem is that keeping it working is now an unbounded maintenance tax on a frozen framework, and the abstractions (a GraphQL data layer over 20 local files) cost more than they return.

### The learning driver

This migration is deliberately scoped as a **refresher project across four tracks**. Every epic below is tagged with the track(s) it exercises. If a task teaches nothing and saves nothing, it is not in this backlog.

| Track | What it covers | Why it's here |
|---|---|---|
| **A — TanStack Start** | File-based routing, typed loaders, `head` management, server functions, static prerendering, Netlify deployment | The framework being adopted |
| **B — Tailwind v4** | CSS-first config (`@theme`, `@utility`, `@variant`), OKLCH, `color-mix()`, container queries, killing the JS config | The current setup is Tailwind v4 running through a v3 compatibility shim — this is a half-finished migration to close out |
| **C — Modern state management** | URL-as-state via TanStack Router `validateSearch`, TanStack Query for server state, Zustand for client-global — **and knowing when each is unnecessary** | Current `articles.tsx` holds 4 `useState` hooks that should be URL state |
| **D — Modern React 19** | `ref` as a prop (no `forwardRef`), `use()`, `useActionState`, `useOptimistic`, `<form action>`, Suspense boundaries, React Compiler | Codebase is React 18 idiom throughout: `React.FC<PageProps<T>>`, `forwardRef` in shadcn primitives |

---

## 2. Locked technical decisions

These were researched and decided before this backlog was written. **Do not re-litigate mid-implementation** — if one turns out wrong, note it in §10 and move on.

| Decision | Choice | Rationale |
|---|---|---|
| Framework | **TanStack Start** `^1.168` | Vite 8 native, pure React (no `.astro`, no RSC/App Router), file-based routing, SSG since v1.138 (Dec 2025), server functions as the dynamic escape hatch |
| Build tool | **Vite 8** | Comes with Start; `@mdx-js/rollup` works natively on Vite 8 with no wrapper plugin |
| React | **19.x** | Track D |
| Styling | **Tailwind v4** via `@tailwindcss/vite` | Track B — CSS-first, no `tailwind.config.js` |
| Components | **shadcn/ui**, re-initialised | Existing 5 primitives port over; re-init to get React 19 / Tailwind v4 output |
| Content | **MDX v3** via `@mdx-js/rollup` + `import.meta.glob` | Replaces the entire Gatsby GraphQL layer with one Vite-native line |
| Syntax highlighting | **`rehype-pretty-code`** (Shiki) | Dual light/dark themes as CSS vars — replaces `prismjs` + hand-maintained `prism-theme.css` |
| Frontmatter validation | **Zod v4** at build time | Replaces/absorbs `scripts/validate-content.ts` |
| URL state | **TanStack Router `validateSearch`** — *not* nuqs | nuqs' TanStack Router adapter is experimental and explicitly does not cover TanStack Start. Router has this built in and type-safe. |
| Hosting | **Netlify** via `@netlify/vite-plugin-tanstack-start` | Prerender every content route to static HTML; deploy the view-counter server functions through the official Netlify integration. No Nitro layer. |

### Explicitly out of scope

Listed so they don't creep in:

- Redesign. The visual output should be indistinguishable at cutover. Design changes are a separate branch.
- CMS, comments, auth, i18n, search-over-full-post-bodies.
- Migrating the 20 `.mdx` files' prose. They move byte-for-byte except for the two fence fixes in **S3.5**.
- Test framework. There isn't one today; adding one is not what this project is teaching. Quality gate is typecheck + lint + a one-off accessibility/SEO smoke check.

---

## 3. Definition of Done (project level)

- [ ] All 20 articles render at their existing URLs (`/articles/<slug>`) with no redirects needed
- [ ] `/`, `/articles`, `/about`, 404 all render
- [ ] `npm run build` produces static HTML for every content route in `dist/client`
- [ ] `npm run typecheck` and `npm run lint` clean
- [ ] No Lighthouse SEO or Accessibility failures (Performance not tracked)
- [ ] `rss.xml`, `sitemap.xml`, `robots.txt` byte-comparable to current output
- [ ] `gatsby*` fully removed from `package.json`; `overrides` block empty or gone
- [ ] Netlify deploy preview green
- [ ] Article view counts persist through Netlify server functions and Netlify Blobs
- [ ] §10 learning log filled in

---

## 4. Dependency graph

```
E0 Spike
 └─> E1 Bootstrap ──┬─> E2 Tailwind v4 ──┐
                    │                     ├─> E4 Static routes ──> E5 Article route ──┬─> E7 SEO/Feeds ──┐
                    └─> E3 MDX pipeline ──┘                                            └─> E6 URL state ──┤
                                                                                                          │
                                        E8 React 19 pass  <────────────────────────────────────────────────┤
                                        E9 Server functions <───────────────────────────────────────────────┤
                                                  │                                                       │
                                                  └────────> E10 Prerender + Deploy <───────────────────────┘
                                                                      │
                                                                      └─> E11 Cutover & teardown
```

**Critical path:** E0 → E1 → E3 → E5 → E9 → E10 → E11.
**Parallelisable:** E2 can run alongside E3. E8 can slot in anywhere after E5.

Estimates are in **sessions** (1 session ≈ 1–2 focused hours), not story points.

---

## 5. Epics & Stories

---

### E0 — Spike & Orientation
**Tracks:** A · **Est:** 2 sessions · **Depends on:** —

Goal: build throwaway muscle memory before touching the real repo. Resist the urge to skip this — the failure mode for this whole project is bootstrapping the real app while still guessing at the framework's conventions.

---

#### S0.1 — Scaffold a throwaway Start app
**Learn (A):** the generated file layout, what `routeTree.gen.ts` is and who writes it, how `vite dev` differs from `gatsby develop`.

**Story:** As a learner, I want a disposable TanStack Start app outside this repo, so that I can break things without polluting the migration branch.

**Tasks:**
- [x] `npx @tanstack/cli@latest create` into `~/scratch/start-spike` — select Tailwind + ESLint add-ons
- [x] Run `vite dev`; note cold-start time vs `gatsby develop`
- [x] Add a route by creating a file. Watch `routeTree.gen.ts` regenerate. **Add it to `.gitignore` mentally — it is generated, never hand-edited.**
- [x] Add a nested route and a dynamic route (`$param`) and read the param
- [x] Open TanStack Router Devtools; inspect the matched route tree

**Acceptance:**
- [x] Can add a static route, a nested route, and a dynamic route from memory without docs

**Checkpoint questions:**
1. What generates `routeTree.gen.ts`, and what happens if you edit it by hand?
2. What does `defaultPreload: 'intent'` in `router.tsx` actually do on hover?
3. Where does `<HeadContent />` render, and what feeds it?

---

#### S0.2 — Spike the MDX pipeline in isolation
**Learn (A):** that MDX here is a *Vite* concern, not a *framework* concern. This is the single biggest conceptual shift from Gatsby.

**Story:** As a learner, I want to import an `.mdx` file as a React component in the spike app, so that I understand the pipeline I'm about to own.

**Tasks:**
- [x] `npm i @mdx-js/rollup remark-frontmatter remark-mdx-frontmatter`
- [x] Add `mdx()` to `vite.config.ts` plugins — **note it must come before `viteReact()`**
- [x] Drop one `.mdx` file with frontmatter into the spike; `import Post, { frontmatter } from './post.mdx'`
- [x] Render it. Log `frontmatter`.
- [x] Now do it with `import.meta.glob('./content/*.mdx', { eager: true })` and log the resulting object shape

**Acceptance:**
- [x] Can explain what `import.meta.glob` returns and why `eager: true` matters for prerendering

**Checkpoint questions:**
1. Compare the `import.meta.glob` object to the `allMdx` GraphQL query in the current `src/pages/articles.tsx`. What did the GraphQL layer buy that the glob doesn't? (Honest answer: sorting and filtering syntax — which is 3 lines of JS.)
2. Why must `mdx()` precede `viteReact()` in the plugin array?

---

#### S0.3 — Spike static prerendering
**Learn (A):** how SSG actually happens in Start, and what `crawlLinks` does.

**Story:** As a learner, I want to produce static HTML from the spike app, so that I trust the deploy model before committing to it.

**Tasks:**
- [x] Add `prerender: { enabled: true, crawlLinks: true }` to the `tanstackStart()` plugin options in `vite.config.ts`
- [x] `vite build`, then inspect `dist/client/`
- [x] Confirm your dynamic route did **not** prerender automatically
- [x] Link to it from the index page, rebuild, confirm `crawlLinks` picked it up
- [x] Try the `pages` array config to prerender a path explicitly

**Acceptance:**
- [x] `dist/client` contains real HTML (view source — content must be in the markup, not injected by JS)

**Checkpoint questions:**
1. Why are routes with path params excluded from `autoStaticPathsDiscovery`?
    2. Dynamic routes are exlcuded because dynamic routes are route templates. Tanstack cannot know which concrete IDs should be generated, so routes containing `$` are skipped
2. What are the two ways to get a dynamic route prerendered, and which will this blog use for `/articles/$slug`?
    3. Linking to a concrete URL from another pre-rendered page w/ crawlLinks: true
    4. Adding concrete URL to the pages array 

---

### E1 — Bootstrap the Application Shell
**Tracks:** A · **Est:** 2 sessions · **Depends on:** E0

Goal: a running TanStack Start app inside this repo, coexisting with Gatsby until E11. **Do not delete anything Gatsby-related in this epic.**

---

#### S1.1 — Stand up Start alongside Gatsby
**Story:** As a developer, I want the new app to build and run without removing the Gatsby app, so that I always have a working site to compare against and fall back to.

**Depends on:** S0.1

**Tasks:**
- [ ] Install: `@tanstack/react-router @tanstack/react-start react@19 react-dom@19`
- [ ] Install dev: `@netlify/vite-plugin-tanstack-start @tanstack/react-router-devtools @vitejs/plugin-react @tailwindcss/vite tailwindcss vite @types/react@19 @types/react-dom@19`
- [ ] Create `vite.config.ts`:
  ```ts
  import { tanstackStart } from '@tanstack/react-start/plugin/vite'
  import netlify from '@netlify/vite-plugin-tanstack-start'
  import { defineConfig } from 'vite'
  import viteReact from '@vitejs/plugin-react'
  import tailwindcss from '@tailwindcss/vite'

  export default defineConfig({
    resolve: { tsconfigPaths: true },
    plugins: [
      tailwindcss(),
      tanstackStart({ srcDirectory: 'src' }),
      netlify(),
      viteReact(),
    ],
  })
  ```
- [x] Create `src/router.tsx` exporting `getRouter()`
- [x] Create `src/routes/__root.tsx` with `<HeadContent />` + `<Scripts />`
- [x] Create `src/routes/index.tsx` — "hello" placeholder only
- [x] Add `"type": "module"` to `package.json`
- [x] Add scripts: `"dev:next": "vite dev"`, `"build:next": "vite build"` (temporary names; renamed in E11)
- [x] Add `src/routeTree.gen.ts` to `.gitignore`

**Acceptance:**
- [x] `npm run dev:next` serves a page on :3000
- [x] `npm run develop` (Gatsby) still works untouched

**Watch for:** adding `"type": "module"` will break `gatsby-node.js` / `gatsby-ssr.js` (CommonJS). If it does, rename them to `.cjs` — Gatsby only needs to survive until E11.

---

#### S1.2 — TypeScript & path aliases
**Story:** As a developer, I want `@/*` imports to resolve in the new app, so that the existing components port over with zero import rewrites.

**Depends on:** S1.1

**Tasks:**
- [ ] Update `tsconfig.json`: `"moduleResolution": "bundler"`, `"module": "esnext"`, `"jsx": "react-jsx"`, `"target": "es2022"`
- [ ] Confirm `paths: { "@/*": ["./src/*"] }` still present
- [ ] Set `resolve.tsconfigPaths: true` in vite config (already in S1.1 — verify it works)
- [ ] `npm run typecheck` passes on the new files

**Acceptance:**
- [ ] `import { cn } from "@/utils/cn"` resolves in a route file with no vite alias config

**Checkpoint question:** The old `gatsby-node.js` duplicated these aliases into a webpack config by hand. Why is that no longer necessary?

---

#### S1.3 — Root route: layout, head, error boundaries
**Story:** As a developer, I want the shell (`Header`/`Footer`/theme) rendering on every route, so that page work in later epics is pure content.

**Depends on:** S1.2, S2.1

**Tasks:**
- [ ] Port `src/components/layout/Layout.tsx` into `__root.tsx`'s component
- [ ] Port `Header.tsx` and `Footer.tsx`; swap Gatsby `<Link to>` → TanStack `<Link to>` (note: **`to` is type-checked against the route tree** — broken links become type errors)
- [ ] Move the anti-flash theme script from `gatsby-ssr.js` into `__root.tsx` `head.scripts`
- [ ] Wire `defaultErrorComponent` and `defaultNotFoundComponent` in `router.tsx`
- [ ] Port `src/pages/404.tsx` as the not-found component

**Acceptance:**
- [ ] Header/footer render on `/`
- [ ] No theme flash on hard reload in dark mode
- [ ] A deliberately broken `<Link to="/nope">` is a **compile** error, not a runtime 404

**Checkpoint question:** Gatsby validated links at runtime (or not at all). What is TanStack Router doing differently, and what file makes it possible?

---

### E2 — Tailwind v4, CSS-First
**Tracks:** B · **Est:** 2 sessions · **Depends on:** S1.1 · **Parallel with:** E3

Goal: finish the Tailwind v4 migration that the current repo started and abandoned. Today `src/styles/globals.css` opens with `@config "../../tailwind.config.js"` — a v3 compatibility shim — and the theme lives in JS. Kill the shim.

---

#### S2.1 — Port the theme to `@theme`
**Learn (B):** v4's CSS-first model. Design tokens become real CSS custom properties that also generate utilities — no JS object, no `theme()` function calls.

**Story:** As a developer, I want the design tokens defined in CSS, so that there is one source of truth and no build-time JS config.

**Depends on:** S1.1

**Tasks:**
- [ ] Create `src/styles/app.css`; `@import "tailwindcss";`
- [ ] Move every colour from `tailwind.config.js` `theme.extend.colors` into an `@theme { }` block as `--color-*` tokens
- [ ] Port the `:root` / `.dark` HSL custom properties from `globals.css`
- [ ] Port `--radius` and the `spotlight` keyframes/animation into `@theme`
- [ ] Delete the `@config` directive
- [ ] **Do not create `tailwind.config.js`.** If you find yourself wanting to, that's the lesson.

**Acceptance:**
- [ ] `bg-background`, `text-muted-foreground`, `border-border` etc. all resolve
- [ ] Dark mode toggles correctly
- [ ] No `tailwind.config.js` in the new build path

**Checkpoint questions:**
1. In v4, what's the difference between defining `--color-primary` inside `@theme` vs. inside `:root`?
2. The old config used `theme("colors.foreground")` inside the typography plugin. What replaces that in v4?

**Stretch:** convert the HSL triplets to OKLCH and use `color-mix()` for the hover-opacity variants. Note whether the rendered colours actually shift.

---

#### S2.2 — Dark mode variant
**Learn (B):** `@variant` / `@custom-variant` replaces `darkMode: "class"`.

**Story:** As a developer, I want class-based dark mode without a JS config key.

**Depends on:** S2.1

**Tasks:**
- [ ] Declare the dark variant in CSS (v4 `@custom-variant dark (&:where(.dark, .dark *))`)
- [ ] Verify `dark:` utilities compile
- [ ] Confirm the `.dark` class toggle from the inline head script still drives it

**Acceptance:**
- [ ] `dark:bg-card` works; toggle flips it live

---

#### S2.3 — Typography plugin & prose styles
**Learn (B):** how a v3-era plugin config becomes v4 CSS.

**Story:** As a reader, I want article prose to look exactly as it does today.

**Depends on:** S2.1

**Tasks:**
- [ ] `@plugin "@tailwindcss/typography";` in `app.css`
- [ ] Port the ~80 lines of `typography.DEFAULT.css` overrides from `tailwind.config.js` into CSS (`.prose { ... }` customisations or `@utility`)
- [ ] Keep the `max-width: 720px`, `font-size: 18px`, `line-height: 1.7` values exactly
- [ ] Port the `--code-inline-*` / `--code-block-*` tokens

**Acceptance:**
- [ ] Side-by-side screenshot of one article at 1440px in both themes is pixel-comparable to the Gatsby build

**Watch for:** the `code::before` / `code::after` `content: ""` resets. Losing them re-introduces backtick artifacts around inline code.

---

#### S2.4 — Modern CSS refresher pass
**Learn (B):** what v4 gives you that v3 didn't, applied to real components.

**Story:** As a developer, I want to replace at least two responsive breakpoint hacks with modern CSS, so that the refresher produces something better rather than just equivalent.

**Depends on:** S2.3

**Tasks:**
- [ ] Convert the article page's `lg:grid-cols-6` sidebar layout to **container queries** (`@container` / `@lg:`) and evaluate whether it's actually better here
- [ ] Replace any `space-x-*` usage with `gap-*` on flex/grid parents
- [ ] Audit for `!important` and arbitrary values that v4 tokens now cover
- [ ] Write down one thing container queries solved and one thing they didn't

**Acceptance:**
- [ ] Layout holds at 375 / 768 / 1024 / 1440
- [ ] Notes captured in §10

---

### E3 — MDX Content Pipeline
**Tracks:** A · **Est:** 3 sessions · **Depends on:** S0.2, S1.1 · **Parallel with:** E2

Goal: this is the epic that deletes Gatsby's reason to exist. The entire `gatsby-node.js` + `gatsby-config.ts` MDX plugin block + every page-level `graphql` template literal collapses into a Vite plugin config and one module.

---

#### S3.1 — Wire MDX into Vite
**Story:** As a developer, I want `.mdx` files to compile to React components with typed frontmatter exports.

**Depends on:** S0.2, S1.1

**Tasks:**
- [ ] `npm i @mdx-js/rollup remark-frontmatter remark-mdx-frontmatter remark-gfm`
- [ ] Add `mdx()` to `vite.config.ts` **before** `viteReact()`
- [ ] Configure `remarkPlugins: [remarkFrontmatter, [remarkMdxFrontmatter, { name: 'frontmatter' }], remarkGfm]`
- [ ] Add `providerImportSource` only if you keep `MDXProvider` (see S3.4 — you probably won't need it)
- [ ] Create `src/types/mdx.d.ts` declaring the `*.mdx` module shape so TS stops complaining

**Acceptance:**
- [ ] `import Post, { frontmatter } from '@/content/articles/some-post.mdx'` type-checks and renders

---

#### S3.2 — Build the content module
**Learn (A/C):** replacing a data layer with a plain module. This is the heart of the migration.

**Story:** As a developer, I want a single `getArticles()` returning sorted, validated article metadata, so that every route reads from one typed source.

**Depends on:** S3.1

**Tasks:**
- [ ] Create `src/lib/content.ts`
- [ ] `const modules = import.meta.glob('../content/articles/*.mdx', { eager: true })`
- [ ] Define a Zod v4 schema matching the real frontmatter: `title, slug, excerpt, date, category, tags[], readingTime, featured, author`
- [ ] Parse every module's frontmatter through the schema — **throw on failure**, so bad content fails the build
- [ ] Export `getArticles()` (sorted `date` DESC), `getArticleBySlug(slug)`, `getCategories()`, `getAllTags()`
- [ ] Derive the slug from the filename and **assert it matches the frontmatter `slug`** — the current repo trusts these agree

**Acceptance:**
- [ ] `getArticles()` returns 20 fully-typed articles
- [ ] Deliberately corrupting one frontmatter date fails the build with a readable Zod error naming the file

**Checkpoint questions:**
1. Line-count `src/lib/content.ts` against `gatsby-node.js` + the three `graphql` blocks it replaces.
2. `scripts/validate-content.ts` now overlaps this. Which one should survive? (Decide, don't keep both.)

---

#### S3.3 — Syntax highlighting via Shiki
**Learn (A/B):** rehype plugins, and dual-theme highlighting driven by CSS variables.

**Story:** As a reader, I want code blocks highlighted in a theme that follows the site's light/dark toggle.

**Depends on:** S3.1, S2.2

**Tasks:**
- [ ] `npm i rehype-pretty-code rehype-slug`
- [ ] Configure with dual themes (e.g. `{ light: 'github-light', dark: 'github-dark' }`)
- [ ] Add the CSS-variable switching rules to `app.css`
- [ ] Verify every language in the corpus renders: `java` (28 blocks), `json` (18), `bash` (11), `typescript` (7), `go` (6), `yaml` (5), `python` (4), `css` (4), `javascript` (3), `jsx` (2), `docker` (2), `xml`, `log`, `http`, `js`
- [ ] Delete `prismjs`, `gatsby-remark-prismjs`, `src/styles/prism-theme.css`

**Acceptance:**
- [ ] All 109 fenced blocks render highlighted in both themes
- [ ] No `prism` string remains in `src/` or `package.json`

**Watch for:** ` ```log ` may not be a Shiki-supported language. Fall back to plain text rather than adding a custom grammar.

---

#### S3.4 — Heading anchors & table of contents
**Learn (A):** replacing Gatsby's `tableOfContents(maxDepth: 3)` GraphQL field.

**Story:** As a reader, I want the sticky TOC sidebar and clickable heading anchors to work as they do today.

**Depends on:** S3.3

**Tasks:**
- [ ] `rehype-slug` for heading IDs (already installed in S3.3)
- [ ] Extract headings — either a small rehype plugin exporting a `toc`, or parse `^##`/`^###` from the raw source in `content.ts`. **Pick the simpler one.**
- [ ] Cap at depth 3 to match current behaviour
- [ ] Port `src/components/article/TableOfContents.tsx` to consume the new shape
- [ ] Decide whether `src/components/mdx/HeadingComponents.tsx` + `MDXProvider` is still needed, or whether `rehype-slug` + `prose-headings:scroll-mt-8` covers it

**Acceptance:**
- [ ] TOC renders for a long article (`building-a-batch-pipeline-01-crash-course-in-spring-batch.mdx` is a good test)
- [ ] Anchor links scroll with correct offset

---

#### S3.5 — Content corpus fixes
**Story:** As a developer, I want the 20 `.mdx` files to compile unchanged except for two known incompatibilities.

**Depends on:** S3.3

**Tasks:**
- [ ] `cloning-discords-login-form-to-mess-with-styled-components.mdx` line 46: ` ```jsx{7} ` is **Prism** line-highlight syntax. Convert to `rehype-pretty-code`'s meta format.
- [ ] `k8s` fence language was a **custom alias** defined in the old `gatsby-config.ts` Prism options. Change to `yaml`.
- [ ] Verify all 20 files compile — every JSX-looking block in the corpus is inside a code fence, so no MDX v2→v3 component breakage is expected
- [ ] Verify raw HTML in MDX (`<p>`, `<a href>` in the Discord article) still renders under MDX v3
- [ ] Confirm all `/images/articles/*` references resolve from `public/`

**Acceptance:**
- [ ] All 20 articles compile with zero warnings
- [ ] Every image in every article loads (there are ~20 across the corpus)

---

### E4 — Static Routes
**Tracks:** A · **Est:** 1 session · **Depends on:** S1.3, S2.3

---

#### S4.1 — Home route
**Story:** As a visitor, I want the homepage to render the hero, 10 most recent articles, and projects.

**Depends on:** S3.2

**Tasks:**
- [ ] `src/routes/index.tsx` with a `loader` calling `getArticles().slice(0, 10)`
- [ ] Port `Hero.tsx`, `ArticleList.tsx`, `Projects.tsx`
- [ ] `TextType.tsx` (GSAP) is client-only — confirm it doesn't break prerendering; guard with a mount check if it does
- [ ] `spotlight.tsx` likewise

**Acceptance:**
- [ ] `/` matches the Gatsby homepage visually
- [ ] View source on the prerendered build: article titles are present in the HTML

**Checkpoint question:** What's the difference between a TanStack Router `loader` and a `beforeLoad`, and which runs during prerender?

---

#### S4.2 — About route & 404
**Story:** As a visitor, I want `/about` and a 404 page.

**Depends on:** S1.3

**Tasks:**
- [ ] Port `src/pages/about.tsx` → `src/routes/about.tsx`
- [ ] Confirm the 404 wired in S1.3 renders for unknown paths
- [ ] Check `netlify.toml`'s 404 redirect still points somewhere valid

**Acceptance:**
- [ ] Both render; 404 returns a real 404 status on the deployed preview

---

### E5 — Article Route
**Tracks:** A · **Est:** 2 sessions · **Depends on:** E3, S4.1

The most important route on the site. 20 of 24 pages.

---

#### S5.1 — Dynamic article route
**Story:** As a reader, I want `/articles/<slug>` to render the full article with its metadata header.

**Depends on:** S3.2, S3.4

**Tasks:**
- [ ] Create `src/routes/articles.$slug.tsx`
- [ ] `loader` resolves the article via `getArticleBySlug(params.slug)`; throw `notFound()` if missing
- [ ] Render the MDX component + frontmatter header (category badge, title, excerpt, date, reading time, author, tags)
- [ ] Port the two-sidebar grid layout (TOC left, sharing right)
- [ ] Port `SharingComponent.tsx` — replace the hardcoded `https://s11a.com${location.pathname}` with the router's location

**Acceptance:**
- [ ] All 20 slugs render
- [ ] URLs are **identical** to production today — no redirects required
- [ ] Unknown slug renders the 404 component

**Watch for:** the current template hardcodes the origin. Pull it from a single config constant so the preview deploy doesn't emit production URLs.

---

#### S5.2 — Article `head` metadata
**Learn (A):** `head` on a route replaces Gatsby's `Head` export + the `SEO.tsx` component.

**Story:** As a search engine, I want per-article title, description, OG tags, and JSON-LD.

**Depends on:** S5.1

**Tasks:**
- [ ] Implement `head: ({ loaderData }) => ({ meta: [...], links: [...], scripts: [...] })`
- [ ] Port every tag from `SEO.tsx`: title, description, canonical, OG (title/description/image/url/type/site_name/image dims), article published/modified time, Twitter card set, robots, author, RSS alternate
- [ ] Port the `BlogPosting` JSON-LD including the `sameAs` social array
- [ ] Extract the shared bits into `src/lib/seo.ts` so E7 can reuse it

**Acceptance:**
- [ ] `curl` a prerendered article and diff its `<head>` against the current production page — only intended differences

---

### E6 — Articles Index & URL-as-State
**Tracks:** A · C · **Est:** 2 sessions · **Depends on:** S5.1

Goal: the state-management refresher, done on real code. Today `src/pages/articles.tsx` holds `searchQuery`, `selectedCategory`, `selectedTags`, and `currentPage` in four `useState` hooks — so filters are unshareable, un-bookmarkable, and lost on back-navigation.

---

#### S6.1 — Type-safe search params
**Learn (C):** URL as the state store. TanStack Router's `validateSearch` gives Zod-validated, type-safe, serialisable search params natively — this is why **nuqs is not being used** (its TanStack Router adapter is experimental and does not cover TanStack Start).

**Story:** As a reader, I want to share a filtered article URL and have the recipient see the same filters.

**Depends on:** S5.1

**Tasks:**
- [ ] Create `src/routes/articles.index.tsx`
- [ ] Define a Zod schema: `{ q: string().default(''), category: string().optional(), tags: array(string()).default([]), page: number().default(1) }`
- [ ] Wire `validateSearch`
- [ ] Replace all four `useState` hooks with `Route.useSearch()`
- [ ] Update filter controls to `navigate({ search: (prev) => ({ ...prev, ... }) })`
- [ ] Reset `page` to 1 whenever `q`/`category`/`tags` change — note this replaces the current `useEffect`, which is a **React anti-pattern** (derived state in an effect)

**Acceptance:**
- [ ] `/articles?q=spring&category=Java&page=2` loads with those filters applied
- [ ] Browser back/forward moves through filter history
- [ ] Zero `useEffect` in this route

**Checkpoint questions:**
1. Why is `useEffect(() => setCurrentPage(1), [filters])` an anti-pattern, and what are the two idiomatic alternatives?
2. What does `validateSearch` do with a malformed param — and how do you control that?

---

#### S6.2 — Derived state audit
**Learn (C · D):** most "state" isn't state. The current file already gets this partly right (`useMemo` for categories/tags/filtering) and partly wrong (the page-reset effect).

**Story:** As a developer, I want every value in this route classified as URL state, derived value, or genuine local state.

**Depends on:** S6.1

**Tasks:**
- [ ] Write the classification table into §10
- [ ] Remove `useMemo` wrappers where the computation is trivially cheap over 20 items — measure before assuming
- [ ] **Try React Compiler** (`babel-plugin-react-compiler` via `@vitejs/plugin-react`) and check whether the remaining memos become redundant
- [ ] Confirm the final route has zero `useEffect`

**Acceptance:**
- [ ] Classification table complete
- [ ] A written answer to: "does this blog need Zustand, Jotai, or TanStack Query anywhere?" (Expected answer: **no** — and being able to defend that is the actual learning outcome. Track C is about recognising when the dependency isn't earned.)

---

#### S6.3 — Filter components
**Story:** As a reader, I want search, category select, tag toggles, and pagination to work as they do today.

**Depends on:** S6.1

**Tasks:**
- [ ] Port `SearchInput`, `CategoryFilter`, `TagFilter`, `Pagination` to read/write search params instead of props-and-callbacks
- [ ] Debounce the search input against the URL (~200ms) so typing doesn't spam history entries — use `navigate({ replace: true })` for intermediate keystrokes
- [ ] Port the active-filter chips and "Clear all"

**Acceptance:**
- [ ] Typing 10 characters adds ≤2 entries to browser history
- [ ] Behaviour otherwise identical to current site

---

### E7 — SEO, Feeds & Sitemaps
**Tracks:** A · **Est:** 2 sessions · **Depends on:** S5.2, S6.1

Goal: replace four Gatsby plugins with owned code. This is where "bespoke" pays off — each of these is ~20 lines you fully understand.

---

#### S7.1 — RSS feed
**Story:** As a subscriber, I want `/rss.xml` to keep working with no change to my reader.

**Depends on:** S3.2

**Tasks:**
- [ ] Create `src/routes/rss[.]xml.ts` as a server route (note the `[.]` escaping convention)
- [ ] Generate the feed from `getArticles()` — replicate `gatsby-plugin-feed`'s `serialize` exactly: `title`, `description` (frontmatter `excerpt` || generated), `date`, `url`, `guid`
- [ ] Set `Content-Type: application/rss+xml`
- [ ] Diff against the committed `public/rss.xml` from the last Gatsby build

**Acceptance:**
- [ ] Feed validates (W3C feed validator)
- [ ] Item GUIDs are **unchanged** from the current feed — changing them re-notifies every subscriber

---

#### S7.2 — Sitemap & robots
**Story:** As a search engine, I want a sitemap and robots.txt equivalent to today's.

**Depends on:** S3.2

**Tasks:**
- [ ] `src/routes/sitemap[.]xml.ts` listing all 24 routes with `lastmod` from frontmatter dates
- [ ] `src/routes/robots[.]txt.ts` matching current output, referencing the sitemap
- [ ] Diff both against `public/sitemap-0.xml` and the current robots output

**Acceptance:**
- [ ] Both served correctly and present in `dist/client` after prerender

---

#### S7.3 — Analytics
**Story:** As the site owner, I want GA4 firing as it does today, still respecting DNT.

**Depends on:** S1.3

**Tasks:**
- [ ] Add the gtag script via `__root.tsx` `head.scripts`, gated on the env var (currently `GATSBY_GA_MEASUREMENT_ID` — rename to `VITE_GA_MEASUREMENT_ID`)
- [ ] Reimplement the `respectDNT` behaviour `gatsby-plugin-google-gtag` provided
- [ ] Fire a pageview on router navigation — SPA route changes don't trigger it automatically
- [ ] Update the Netlify env var name

**Acceptance:**
- [ ] Pageviews fire on client-side navigation, not just hard loads
- [ ] Nothing fires when DNT is on
- [ ] Existing CSP `script-src`/`connect-src` entries still cover it

---

### E8 — React 19 Refresher Pass
**Tracks:** D · **Est:** 2 sessions · **Depends on:** E5

Goal: the codebase is React 18 idiom throughout. Modernise it deliberately rather than by accident.

---

#### S8.1 — Re-init shadcn for React 19 + Tailwind v4
**Story:** As a developer, I want shadcn primitives generated for the current stack rather than hand-patched.

**Depends on:** S2.3

**Tasks:**
- [ ] Update `components.json` — remove the `tailwind.config` key, point `css` at `src/styles/app.css`
- [ ] Re-add `button`, `card`, `badge`, `select` via the CLI; **diff against your existing versions** and reapply any local changes deliberately
- [ ] `spotlight.tsx` is custom — port by hand
- [ ] Verify Radix Select works under React 19

**Acceptance:**
- [ ] All 5 primitives render; no React 19 console warnings

---

#### S8.2 — `ref` as a prop
**Learn (D):** `forwardRef` is unnecessary in React 19 — `ref` is an ordinary prop on function components.

**Story:** As a developer, I want no `forwardRef` in the codebase.

**Depends on:** S8.1

**Tasks:**
- [ ] Grep `src/` for `forwardRef`
- [ ] Convert each to a plain `ref` prop
- [ ] Remove the now-redundant `ElementRef` / `ComponentPropsWithoutRef` type gymnastics
- [ ] Delete `React.FC<...>` annotations on the ported pages/templates — they were a Gatsby-typing convention with no remaining value

**Acceptance:**
- [ ] Zero `forwardRef` in `src/`
- [ ] Typecheck clean

---

#### S8.3 — Suspense & modern data access
**Learn (D):** `use()`, Suspense boundaries, and how they interact with router loaders.

**Story:** As a reader, I want no layout shift or spinner flash on navigation.

**Depends on:** S5.1

**Tasks:**
- [ ] Add a Suspense boundary around the MDX content render
- [ ] Experiment with `use()` on a deferred loader promise — TanStack Router supports streaming deferred data
- [ ] Decide honestly whether it's warranted here (prerendered content resolves instantly, so it may not be) and record the reasoning
- [ ] Add `pendingComponent` on the article route for slow client-side navigations

**Acceptance:**
- [ ] Navigation between articles has no visible flash
- [ ] Written note on when `use()` is and isn't worth it

---

#### S8.4 — Theme toggle modernisation
**Learn (D):** `useSyncExternalStore` for external state (system colour scheme).

**Story:** As a reader, I want the theme toggle to track OS preference changes live.

**Depends on:** S1.3

**Tasks:**
- [ ] Rewrite `src/hooks/useTheme.ts` with `useSyncExternalStore` subscribing to `matchMedia('(prefers-color-scheme: dark)')`
- [ ] Ensure the server snapshot matches the inline head script so hydration doesn't mismatch
- [ ] Verify the three-state cycle (light / dark / system) still works

**Acceptance:**
- [ ] Changing macOS appearance updates the site live when set to "system"
- [ ] No hydration warning in console

---

### E9 — Dynamic Content via Server Functions
**Tracks:** A · C · **Est:** 2 sessions · **Depends on:** E5

Goal: prove the dynamic escape hatch works *before* cutover, so it isn't a leap of faith later. **Ship exactly one dynamic feature.** Scope discipline is part of the exercise.

---

#### S9.1 — Static server function (build-time)
**Learn (A):** static server functions execute at build and get cached as JSON — the same primitive as runtime server functions, different execution phase.

**Story:** As a developer, I want to compute something at build time via `createServerFn`, so that I understand the build/runtime split.

**Depends on:** S5.1

**Tasks:**
- [ ] Replace the frontmatter `readingTime` string with a build-time computed value via a static server function
- [ ] Confirm the result is baked into the prerendered HTML with no client fetch
- [ ] Inspect the emitted JSON artifact in `dist/client`

**Acceptance:**
- [ ] Reading times render in prerendered HTML
- [ ] Network tab shows no runtime request for them

---

#### S9.2 — Runtime server function: article view counter
**Learn (A · C):** the one place on this site where TanStack Query is genuinely earned — real server state with caching, revalidation, and optimistic updates.

**Story:** As the site owner, I want a per-article view count, so that the framework's dynamic path is proven end-to-end.

**Depends on:** S9.1

**Tasks:**
- [ ] Install `@netlify/blobs` and create a dedicated `article-views` store
- [ ] Implement `getViews(slug)` and `incrementViews(slug)` with `createServerFn`; keep all Blob access inside the server-function handlers
- [ ] Run the normal Vite dev server and verify the Netlify integration provides a sandboxed local Blob store without `netlify dev`
- [ ] Render the count in `SharingComponent`, wrapped in Suspense so it never blocks prerender
- [ ] Add `@tanstack/react-query` **only for this** and justify it in §10
- [ ] Use `useOptimistic` for the increment (Track D)
- [ ] Rate-limit or debounce the increment so a refresh loop can't inflate it

**Acceptance:**
- [ ] Count displays and increments
- [ ] Article pages still prerender to static HTML — the counter hydrates in, it does not block the build
- [ ] With the counter endpoint down, the page still renders
- [ ] A production deploy persists counts in Netlify Blobs; local development does not read or mutate production counts

**Watch for:** this is the story most likely to expand. Keep the persisted counter, but cut nonessential UI polish or caching experiments if the epic exceeds 2 sessions.

---

### E10 — Prerendering & Deployment
**Tracks:** A · **Est:** 2 sessions · **Depends on:** E4, E5, E7, E9

---

#### S10.1 — Configure static prerendering
**Story:** As a visitor, I want every page served as static HTML from the CDN.

**Depends on:** S5.1, S7.2

**Tasks:**
- [ ] Add to `tanstackStart()` options: `prerender: { enabled: true, crawlLinks: true, failOnError: true }`
- [ ] Confirm `crawlLinks` discovers all 20 article routes from `/articles` — if any are missed, add them explicitly via the `pages` array
- [ ] Set `autoSubfolderIndex` to whichever matches the current URL shape (trailing slash behaviour must not change)
- [ ] `vite build`, then verify `dist/client` contains 24 HTML files
- [ ] View source on 3 articles — prose must be in the markup

**Acceptance:**
- [ ] Every route prerenders
- [ ] `failOnError: true` and the build is green
- [ ] JS disabled in the browser: articles are fully readable

**Checkpoint question:** Which of your routes would *not* prerender if `crawlLinks` were false, and why?

---

#### S10.2 — Netlify deploy
**Story:** As the site owner, I want a green deploy preview from this branch.

**Depends on:** S9.2, S10.1

**Tasks:**
- [ ] Confirm `@netlify/vite-plugin-tanstack-start` is active in `vite.config.ts`; do not add Nitro or a Nitro preset
- [ ] Update `netlify.toml`: `publish` → `dist/client`, `command` → the new build script
- [ ] Confirm the integration emits the runtime server functions needed by the article view counter
- [ ] Re-verify the CSP — the current policy is strict and hand-written; check `script-src`/`connect-src` still cover Start's hydration bootstrap and any server-function calls
- [ ] Confirm the cache-control header rules still match the new asset paths and hashing scheme
- [ ] Update the local and Netlify Node version from 22.4.1 to a Vite 8-supported 22.x release (22.12 or newer)
- [ ] Deploy preview from the branch

**Acceptance:**
- [ ] Preview URL live, all 24 pages reachable
- [ ] View counts read and persist through the deployed Netlify server functions and Blob store
- [ ] Zero CSP violations in console
- [ ] Static assets served with `immutable` cache headers

**Watch for:** the existing `[[headers]]` rules key off `/static/*` and `/*.js`. Vite's output layout differs from Gatsby's — the rules likely need updating or they'll silently stop applying.

---

#### S10.3 — Smoke check
**Story:** As a reader, I want no broken metadata or accessibility regressions.

**Depends on:** S10.2

**Tasks:**
- [ ] `npx lighthouse <preview-url> --view` on one article and the articles index
- [ ] Fix anything flagged under SEO or Accessibility — those catch real bugs (missing meta, bad heading order, unlabelled controls)
- [ ] Ignore the Performance score

**Acceptance:**
- [ ] No SEO or Accessibility failures

> Not tracking performance. It's a hydrating framework on a 20-post blog served from a CDN — the score will be fine and chasing it isn't what this project is for.

---

### E11 — Cutover & Teardown
**Tracks:** A · **Est:** 1 session · **Depends on:** E10

The satisfying epic. Do not start it until E10 is green.

---

#### S11.1 — Remove Gatsby
**Story:** As a maintainer, I want zero Gatsby code or dependencies in the repo.

**Depends on:** S10.3

**Tasks:**
- [ ] Delete `gatsby-config.ts`, `gatsby-node.js`, `gatsby-browser.js`, `gatsby-ssr.js`, `tailwind.config.js`, `postcss.config.js`
- [ ] Remove `gatsby` + all 8 `gatsby-*` packages, `prismjs`, `@mdx-js/react` (if S3.4 dropped `MDXProvider`)
- [ ] **Empty the `overrides` block** — re-audit with `npm audit` and only re-add what's still genuinely needed. This block existing solely to patch Gatsby's transitive deps is the most satisfying deletion in the project.
- [ ] Delete `src/pages/`, `src/templates/`
- [ ] Delete the Lighthouse harness — `scripts/performance/lighthouse-test.js`, the `lighthouse` / `chrome-launcher` / `start-server-and-test` devDeps, and the `lighthouse`, `lighthouse:ci`, `perf` scripts. Nothing tracks performance now (S10.3); an unused harness is just three more things to keep patched.
- [ ] Delete the tracked `public/` build output; confirm `.gitignore` covers `dist/` and `public/`
- [ ] Rename `dev:next`/`build:next` → `dev`/`build`
- [ ] Delete `src/data/sampleData.ts` if only `categoryIcons` was live — move that constant somewhere honest
- [ ] Retire `gatsby-browser.js`'s service-worker cleanup — that one-time fix has long since shipped to all visitors

**Acceptance:**
- [ ] `grep -ri gatsby` returns nothing outside `BACKLOG.md` and git history
- [ ] `npm audit` clean without overrides
- [ ] Fresh `npm ci && npm run build` works from a clean clone

---

#### S11.2 — Documentation
**Story:** As my future self, I want `AGENTS.md` and `README.md` to describe the actual stack.

**Depends on:** S11.1

**Tasks:**
- [ ] Rewrite `AGENTS.md` — every command, path, and convention in it currently describes Gatsby
- [ ] Update `README.md`
- [ ] Document the content pipeline: how to add an article, what the frontmatter schema requires, how prerendering picks it up
- [ ] Update `eslint.config.mjs` — remove the `gatsby-node.js`/`gatsby-ssr.js` ignore entries

**Acceptance:**
- [ ] A stranger could add an article and deploy it from the README alone

---

#### S11.3 — Merge
**Story:** As the site owner, I want this live.

**Depends on:** S11.2

**Tasks:**
- [ ] Verify all 20 article URLs against the production sitemap — **any 404 here is a broken inbound link and lost SEO**
- [ ] Confirm `rss.xml` GUIDs unchanged (S7.1)
- [ ] Merge to `master`, watch the production deploy
- [ ] Spot-check 5 articles on production
- [ ] Fill in §10

**Acceptance:**
- [ ] Production live on TanStack Start
- [ ] Zero URL regressions

---

## 6. Suggested order

Two sensible sequences depending on how you like to work:

**Vertical slice (recommended)** — get one article rendering end to end as early as possible, then widen:
`S0.1 → S0.2 → S1.1 → S1.2 → S2.1 → S3.1 → S3.2 → S5.1 → S0.3 → S10.1` — you now have a real prerendered article. Everything after is filling in.

**Layered** — finish each subsystem before moving on: straight down E0 → E11.

The vertical slice de-risks the two things most likely to be dealbreakers (MDX pipeline, prerendering) inside the first few sessions.

---

## 7. Risk register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| TanStack Start version churn (v1.168.45 shipped the day this was written) | High | Medium | Pin exact versions in `package.json`. Bump deliberately, never with `^` drift mid-project. |
| `crawlLinks` misses article routes | Medium | High | S10.1 verifies count = 24. Fall back to the explicit `pages` array. |
| CSP breaks under Start's hydration bootstrap | Medium | High | S10.2 explicitly re-verifies. The existing policy already allows `script-src 'unsafe-inline'`. |
| Netlify cache headers stop matching new asset paths | High | Low | Called out in S10.2. Silent failure mode — check it, don't assume. |
| URL shape changes (trailing slashes) break inbound links | Low | High | `autoSubfolderIndex` in S10.1; full URL verification in S11.3. |
| E9 scope creep | High | Medium | Preserve the Netlify-backed counter; cut optional UI polish or caching experiments if the epic exceeds 2 sessions. |
| Lighthouse performance regression vs. Gatsby | Medium | Low | Accepted, not tracked. Hydrating framework on a CDN-served 20-post blog. |

---

## 8. Dependency delta

**Removing:** `gatsby`, `gatsby-plugin-feed`, `gatsby-plugin-google-gtag`, `gatsby-plugin-mdx`, `gatsby-plugin-robots-txt`, `gatsby-plugin-sitemap`, `gatsby-remark-prismjs`, `gatsby-source-filesystem`, `gatsby-plugin-webpack-bundle-analyser-v2`, `prismjs`, `@mdx-js/react`, `postcss`, `@tailwindcss/postcss`, `lighthouse`, `chrome-launcher`, `start-server-and-test`, and the entire `overrides` block.

**Adding:** `@tanstack/react-router`, `@tanstack/react-start`, `vite`, `@vitejs/plugin-react`, `@netlify/vite-plugin-tanstack-start`, `@tailwindcss/vite`, `@mdx-js/rollup`, `remark-frontmatter`, `remark-mdx-frontmatter`, `remark-gfm`, `rehype-pretty-code`, `rehype-slug`, `zod`, `@netlify/blobs`, and `@tanstack/react-query`. The last two are earned specifically by the S9.2 view counter; Nitro is not part of this architecture.

**Unchanged:** `@radix-ui/*`, `class-variance-authority`, `clsx`, `tailwind-merge`, `tailwindcss`, `gsap`, `@tailwindcss/typography`.

Net: roughly flat on count, but every remaining dependency is actively maintained and the security-override block disappears.

---

## 9. Reference

- TanStack Start — Static Prerendering: https://tanstack.com/start/latest/docs/framework/react/guide/static-prerendering
- TanStack Start — Static Server Functions: https://tanstack.com/start/latest/docs/framework/react/guide/static-server-functions
- TanStack Start — Hosting (Netlify): https://tanstack.com/start/latest/docs/framework/react/guide/hosting#netlify
- Netlify — TanStack Start integration: https://docs.netlify.com/build/frameworks/framework-setup-guides/tanstack-start/
- Netlify — Blobs: https://docs.netlify.com/build/data-and-storage/netlify-blobs/
- TanStack Router — Search Params: https://tanstack.com/router/latest/docs/framework/react/guide/search-params
- Official example (config reference): https://github.com/TanStack/router/tree/main/examples/react/start-basic
- `@mdx-js/rollup`: https://mdxjs.com/packages/rollup/
- Tailwind v4 upgrade guide: https://tailwindcss.com/docs/upgrade-guide
- shadcn/ui: https://ui.shadcn.com/docs/installation

---

## 10. Learning log

> Fill in as you go. This section is the actual deliverable of the exercise — the working site is the side effect.

### Track A — TanStack Start
- File routing vs. `createPages`:
- What `loader` gives you that a GraphQL page query didn't:
- When prerendering surprised me:
- Server functions — build-time vs. runtime:

### Track B — Tailwind v4
- `@theme` vs. `:root`:
- What the JS config was actually doing that CSS now does:
- Container queries — worth it here?
- OKLCH observations:

### Track C — State management
- Classification table for `articles.index.tsx` (URL state / derived / local):
- Why this project needs neither Zustand nor Jotai:
- Where TanStack Query was earned by the Netlify-backed view counter:
- The `useEffect` I deleted and what replaced it:

### Track D — React 19
- `forwardRef` removals:
- Did React Compiler make my `useMemo`s redundant?
- `use()` — worth it here?
- `useSyncExternalStore` vs. the old `useTheme`:

### Decisions I'd reverse
-

### Things that took longer than estimated
-
