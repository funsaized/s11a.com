# TanStack Start Migration — Learning Backlog

> **Branch:** `feat/tanstack-start-migration`
> **Status:** In progress — E0 and the initial fresh-project scaffold are complete
> **Owner:** Sai (implementation) — this is a hands-on learning exercise, not a hand-off.

### Workspace contract (read before every story)

This is a **side-by-side rebuild**, not an in-place migration. The repository has two
separate applications:

| Name used below | Path from the repository root | Purpose |
|---|---|---|
| **SOURCE** | `./` | Existing Gatsby production blog; migration reference and comparison baseline |
| **TARGET** | `scratch/s11a.com/` | Fresh, standalone TanStack Start project; all new implementation goes here |
| **SPIKE** | `scratch/start-spike/` | Disposable learning project from E0; do not copy production code into it |

Unless a task explicitly says **SOURCE**, every unqualified path (`src/`,
`package.json`, `vite.config.ts`, `public/`, `dist/`, and so on) means a path under
**TARGET**, and every command must be run from `scratch/s11a.com/`.

The SOURCE app remains runnable and unchanged throughout the rebuild. Porting means
copying or deliberately re-implementing a file in TARGET, never moving it out of or
deleting it from SOURCE. SOURCE teardown is not part of this backlog. At cutover,
Netlify changes its base directory to TARGET; it does not require TARGET to replace
the repository root.

Status convention:

- `[x]` means Sai completed the task.
- `**REVISIT:**` after a checked item means the work happened, but the corrected
  two-project layout exposed follow-up work that must be done before its story is
  considered closed.
- `[ ]` remains outstanding. Existing checked state is preserved; unchecked tasks
  are not inferred complete merely because the scaffold generated related files.

### Observed migration baseline (audited 2026-08-16)

- SOURCE has 20 MDX articles, 23 indexable sitemap URLs, and 24 rendered pages when
  the 404 is included.
- SOURCE's sitemap contract is `sitemap-index.xml` → `sitemap-0.xml`, and its
  canonical page URLs have trailing slashes. `robots.txt` points at the sitemap
  index. RSS item GUIDs omit the trailing slash and must remain unchanged.
- SOURCE `public/` is generated/ignored output, not a committed golden fixture. A
  clean SOURCE build must be captured before feed/sitemap comparisons.
- Frontmatter slugs, not filenames, define article URLs. One file intentionally
  differs: `how-to-be-productive-after-work.mdx` serves
  `/articles/stop-wasting-time-how-to-be-productive-after-work/`.
- The real category set is Backend, Cloud, Frontend, DevOps, Productivity, and
  Writing. SOURCE `AGENTS.md` omits the last two and lists unused categories, so it
  is not the validation enum.
- The corpus has 105 fenced code blocks and 31 distinct referenced article-image
  paths. Fence cleanup includes Prism metadata, `k8s`, and four uppercase language
  labels—not only the two issues originally listed.
- SOURCE `RecentArticles.tsx` and the commented `sampleArticles` fixture are dead;
  do not port them. SOURCE `sampleData.ts` still contains live project data and
  category icons, so split those values into honestly named TARGET modules instead
  of copying the mixed fixture file.
- TARGET is already scaffolded with React 19, Vite 8, Tailwind v4, Netlify,
  TanStack Query/devtools, Oxfmt, and Oxlint. Its lockfile currently resolves Start
  1.168.46, Router 1.170.29, React 19.2.8, Vite 8.2.1, and TypeScript 6.0.3.
- TARGET's generated `routeTree.gen.ts` is ignored but still tracked by Git. This is
  the only completed (`[x]`) item found to require explicit cleanup; see S1.1.

### Modern-pattern audit (official docs reviewed 2026-08-16)

Apply a capability only where the site has the matching problem:

| Concern | Pattern for this blog | Explicit non-goal |
|---|---|---|
| Static article data | TanStack Router loaders returning **serializable metadata**, with Router caching and `staleTime: Infinity` | Do not put compiled MDX components/functions in loader data; do not put static content in Query |
| Article rendering | Eager named-export globs for metadata/TOC; lazy full-module glob + one Suspense boundary for the selected MDX component | Do not eagerly bundle all article bodies or add a server function merely to read local build-time content |
| Filters/pagination | Router `validateSearch` + `Route.useSearch()` + typed navigation | No Zustand, Jotai, Redux, or duplicate component state |
| View counter | Query for runtime server state + mutation backed by validated Start server functions | Query is not the content layer and must not block article rendering/prerendering |
| Head/analytics/theme boot | Route `head`, `<HeadContent />`, `<Scripts />`, `ScriptOnce`, and `router.subscribe("onResolved")` | No React Helmet and no component effect that polls router state |
| Global CSS | Keep TARGET `src/styles.css` loaded through the root route; Tailwind v4 `@theme inline`, `@custom-variant`, and `@plugin` | No new JS Tailwind config, forced OKLCH conversion, or CSS-module migration |
| React 19 | Fresh React 19 shadcn output, `ref` as a prop only where needed, and one earned Suspense boundary for lazy MDX | No forced `use()`, deferred loader, React Compiler, `useActionState`, or `useOptimistic` demos |

TanStack Router already caches loader data. TanStack Query is retained only for the
counter because it is asynchronous runtime server state with a mutation lifecycle.
All other site data is local, immutable build input.

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

The SOURCE blog works. The problem is that keeping it working is now an unbounded maintenance tax on a frozen framework, and the abstractions (a GraphQL data layer over 20 local files) cost more than they return. The migration therefore builds TARGET from a clean TanStack Start scaffold and uses SOURCE only as a behavioural and visual specification.

### The learning driver

This migration is deliberately scoped as a **refresher project across four tracks**. Every epic below is tagged with the track(s) it exercises. If a task teaches nothing and saves nothing, it is not in this backlog.

| Track | What it covers | Why it's here |
|---|---|---|
| **A — TanStack Start** | File-based routing, typed loaders, `head` management, server functions, static prerendering, Netlify deployment | The framework being adopted |
| **B — Tailwind v4** | CSS-first config with `@theme inline`, `@custom-variant`, `@plugin`, semantic CSS variables, and no JS config | SOURCE is Tailwind v4 through a v3 compatibility shim; TARGET should express only the theme the blog actually uses |
| **C — State placement** | URL-as-state via Router `validateSearch`; Router loaders/cache for static route data; Query only for the runtime view counter | SOURCE `articles.tsx` holds 4 `useState` hooks that should be URL state; everything else should stay plain props/derived data |
| **D — React 19 compatibility** | Fresh React 19 components, `ref` as a prop when needed, hydration-safe browser integrations | Avoid carrying React 18 framework typings and generated primitives into TARGET; do not manufacture use cases for new hooks |

---

## 2. Locked technical decisions

These were researched and decided before this backlog was written. **Do not re-litigate mid-implementation** — if one turns out wrong, note it in §10 and move on.

| Decision | Choice | Rationale |
|---|---|---|
| Framework | **TanStack Start**, pinned to the version resolved in TARGET's lockfile | TARGET currently resolves `@tanstack/react-start` 1.168.46; keep the working lockfile stable during the migration rather than using moving `latest` ranges |
| Build tool | **Vite 8** | Comes with Start; `@mdx-js/rollup` works natively on Vite 8 with no wrapper plugin |
| React | **19.x** | Track D |
| Styling | **Tailwind v4** via `@tailwindcss/vite` | Track B — CSS-first, no `tailwind.config.js` |
| Components | **shadcn/ui**, initialised fresh in TARGET | Use TARGET's React 19 / Tailwind v4 output, then compare SOURCE's 5 primitives and reapply only intentional local behaviour/styles |
| Content | **MDX v3** via `@mdx-js/rollup` + `import.meta.glob` | Replaces the entire Gatsby GraphQL layer with one Vite-native line |
| Syntax highlighting | **`rehype-pretty-code`** (Shiki) | Dual light/dark themes as CSS vars — replaces `prismjs` + hand-maintained `prism-theme.css` |
| Frontmatter validation | **Zod v4** at build time | Replaces/absorbs `scripts/validate-content.ts` |
| URL state | **TanStack Router `validateSearch`** — *not* nuqs | nuqs' TanStack Router adapter is experimental and explicitly does not cover TanStack Start. Router has this built in and type-safe. |
| Hosting | **Netlify** via `@netlify/vite-plugin-tanstack-start` | Prerender content routes; deploy the view-counter server functions through the official integration. Netlify Blobs needs strong reads + ETag conditional writes because a counter is a concurrent read/modify/write workload. No Nitro layer. |

### Explicitly out of scope

Listed so they don't creep in:

- Redesign. The visual output should be indistinguishable at cutover. Design changes are a separate branch.
- CMS, comments, auth, i18n, search-over-full-post-bodies.
- Editing the 20 `.mdx` files in SOURCE. Copy them into TARGET, then change only the known fence incompatibilities in the TARGET copies (see **S3.5**).
- Test framework. There isn't one today; adding one is not what this project is teaching. Quality gate is typecheck + lint + a one-off accessibility/SEO smoke check.
- Build-time server functions for reading time; the validated frontmatter value already exists.
- Forced container-query rewrites, OKLCH colour conversion, React Compiler, deferred loaders, `use()`, `useActionState`, or optimistic UI exercises. Add them later only for a real product requirement.
- Porting unused SOURCE tokens, starter demo styles/components, Gatsby type wrappers, or generated React 18 shadcn implementation details.

---

## 3. Definition of Done (project level)

- [ ] All 20 articles render at their existing canonical URLs (`/articles/<slug>/`, including the trailing slash used by SOURCE's sitemap) with no slug redirects needed
- [ ] `/`, `/articles`, `/about`, 404 all render
- [ ] From TARGET, `npm run build` produces static HTML for every content route in `dist/client`
- [ ] From TARGET, `npm run check` is clean (format check + Oxlint + TypeScript)
- [ ] No Lighthouse SEO or Accessibility failures (Performance not tracked)
- [ ] `rss.xml`, `sitemap-index.xml`, `sitemap-0.xml`, and `robots.txt` preserve SOURCE's public URLs and semantics; GUIDs and listed canonical URLs are unchanged
- [ ] TARGET contains no Gatsby dependency, Gatsby config, or Gatsby-only override (SOURCE is intentionally unchanged)
- [ ] Netlify deploy preview green
- [ ] Article view counts persist through Netlify server functions and Netlify Blobs
- [ ] Netlify builds from base directory `scratch/s11a.com` and publishes TARGET's `dist/client`
- [ ] §10 learning log filled in

---

## 4. Dependency graph

```
E0 Spike
 └─> E1 Fresh TARGET baseline ──┬─> E2 Tailwind v4 ──┐
                                │                     ├─> E4 Static routes ──> E5 Article route ──┬─> E7 SEO/Feeds ──┐
                                └─> E3 MDX pipeline ──┘                                            ├─> E6 URL state ──┤
                                                                                                   ├─> E8 React 19 ───┤
                                                                                                   └─> E9 View counter┤
                                                                                                                     │
                                                                                E10 Prerender + Deploy <──────────────┘
                                                                                         │
                                                                                         └─> E11 Cutover & docs
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

**Story:** As a learner, I want a disposable TanStack Start app isolated from both SOURCE and TARGET, so that I can break things without affecting either application.

**Tasks:**
- [x] `npx @tanstack/cli@latest create` into `scratch/start-spike/` — select Tailwind + ESLint add-ons
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
1. Compare the `import.meta.glob` object to the `allMdx` GraphQL query in SOURCE `src/pages/articles.tsx`. What did the GraphQL layer buy that the glob doesn't? (Honest answer: sorting and filtering syntax — which is 3 lines of JS.)
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

### E1 — Baseline the Fresh TARGET Application
**Tracks:** A · **Est:** 2 sessions · **Depends on:** E0

Goal: establish `scratch/s11a.com/` as an independent TanStack Start application.
SOURCE and TARGET coexist permanently in the repository during this project. Do not
install Start dependencies into SOURCE, do not add Start files to SOURCE's `src/`,
and do not modify SOURCE merely to make TARGET work.

---

#### S1.1 — Verify the fresh TARGET scaffold
**Story:** As a developer, I want TARGET to build and run independently of SOURCE, so that I always have a working production reference and a clean new application.

**Depends on:** S0.1

**Tasks:**
- [x] Audit TARGET's generated dependencies against the locked decisions. Retain Query and its SSR integration for E9, but remove unused demo/data packages and ensure Router/Query devtools render only in development.
- [x] (IGNORED) Replace moving `latest` dependency ranges with the exact versions already resolved in `package-lock.json`, then run `npm install` once to keep manifest and lockfile aligned. Do not install any of these packages in SOURCE.
- [x] Review TARGET's existing `vite.config.ts` rather than recreating it. Preserve the generated Netlify/devtools integration; keep `mdx()` before `viteReact()` when S3.1 adds it.
- [x] TARGET has `src/router.tsx` exporting `getRouter()`
- [x] TARGET has `src/routes/__root.tsx` with `<HeadContent />` + `<Scripts />`
- [x] TARGET has `src/routes/index.tsx` with a hello placeholder
- [x] TARGET has `"type": "module"` in its own `package.json`
- [x] TARGET uses normal fresh-project scripts (`dev`, `build`, `preview`), not temporary `dev:next`/`build:next` aliases. No later rename is required.
- [x] TARGET's `.gitignore` lists `src/routeTree.gen.ts`. **REVISIT:** the generated file was committed before it was ignored; remove it from Git's index without deleting the working copy, regenerate it with `npm run generate-routes`, and verify `git status` no longer tracks it.

**Acceptance:**
- [x] `npm run dev` from TARGET serves the app on its configured port (`:3001`)
- [x] `npm run develop` from SOURCE still works untouched
- [x] `npm run build` and `npm run check` pass from TARGET without depending on SOURCE's `node_modules`

**Watch for:** SOURCE and TARGET each own a `package.json`, lockfile, Node version, and
`node_modules`. TARGET's `"type": "module"` cannot affect SOURCE's CommonJS Gatsby
files. If a change to TARGET breaks SOURCE, it was made in the wrong directory.

---

#### S1.2 — TypeScript & path aliases
**Story:** As a developer, I want `@/*` imports to resolve inside TARGET, so copied SOURCE components need only framework-specific import changes.

**Depends on:** S1.1

**Tasks:**
- [x] TARGET `tsconfig.json` uses `"moduleResolution": "bundler"`, `"module": "ESNext"`, `"jsx": "react-jsx"`, and `"target": "ES2022"`
- [x] TARGET keeps both its generated `#/*` alias and compatibility alias `@/*`, each pointing to `./src/*`
- [x] TARGET `vite.config.ts` sets `resolve.tsconfigPaths: true`
- [x] `npm run typecheck` passes in TARGET (reverified while this backlog was corrected)

**Acceptance:**
- [x] A TARGET route resolves an aliased utility import with no hand-written Vite alias map

**Checkpoint question:** The old `gatsby-node.js` duplicated these aliases into a webpack config by hand. Why is that no longer necessary?
- Vite reads TARGET's TypeScript path mappings directly; SOURCE's webpack-only alias duplication remains irrelevant to TARGET.
---

#### S1.3 — Root route: layout, head, error boundaries
**Story:** As a developer, I want the shell (`Header`/`Footer`/theme) rendering on every route, so that page work in later epics is pure content.

**Depends on:** S1.2, S2.2

**Execution note:** This story is grouped under E1 because it establishes the app
shell, but do not complete its visual/theme work before E2. Execute the foundation
in this order: capture the SOURCE shell in both themes → S2.1 tokens → S2.2 dark
variant → S1.3 theme boot/toggle and shell components. This prevents copied
components from being tuned against TARGET's temporary starter palette.

**Tasks:**
- [ ] Use SOURCE `src/components/layout/Layout.tsx` as the reference for TARGET `src/routes/__root.tsx`; copy only the reusable layout behaviour and markup
- [x] Recreate the SOURCE page-height contract in the root shell (`min-height: 100dvh`, column layout, and a growing `<main>`); the footer must follow short content at the viewport bottom without `position: fixed` or `position: absolute`
- [x] Port SOURCE `Header.tsx` and `Footer.tsx` into TARGET; swap Gatsby `<Link to>` → TanStack `<Link to>` (note: **`to` is type-checked against the route tree** — broken links become type errors). Replace TARGET's generated demo `Header.tsx`; do not edit SOURCE's components.
- [x] Generate TARGET's Tailwind v4/React 19 shadcn `button` before porting `ThemeToggle`; compare it with SOURCE and reapply only intentional variants/classes rather than copying the generated React 18 primitive
- [x] Port the anti-flash theme logic fro m SOURCE `gatsby-ssr.js` with TanStack Router's `ScriptOnce` in TARGET's root document so it runs before hydration without duplicate execution
- [x] Port SOURCE's existing light/dark/system toggle behaviour, including the `matchMedia` change listener and guarded `localStorage`; its small state/effect implementation already models real browser synchronization and does not require a new global store
- [ ] Wire `defaultErrorComponent` and `defaultNotFoundComponent` in `router.tsx`
- [ ] Port SOURCE `src/pages/404.tsx` into a TARGET not-found component

**Acceptance:**
- [ ] Header/footer render on `/`
- [ ] With the one-line placeholder route, the footer rests at the viewport bottom; with long content it remains in normal document flow
- [ ] No theme flash on hard reload in dark mode
- [ ] Header, footer, theme control, focus states, and mobile navigation are visually compared with SOURCE at 375px and 1440px in light and dark mode before page-section porting begins
- [ ] Root CSS is loaded once using TARGET's existing supported `styles.css?url` + `head.links` pattern; do not add a second global-style import
- [ ] A deliberately broken `<Link to="/nope">` is a **compile** error, not a runtime 404

**Checkpoint question:** Gatsby validated links at runtime (or not at all). What is TanStack Router doing differently, and what file makes it possible?

---

### E2 — Tailwind v4, CSS-First
**Tracks:** B · **Est:** 2 sessions · **Depends on:** S1.1 · **Parallel with:** E3

Goal: recreate SOURCE's appearance in TARGET using native Tailwind v4. SOURCE
`src/styles/globals.css` opens with `@config "../../tailwind.config.js"` and SOURCE's
theme lives in JS. Those files are inputs to inspect, not files to edit or delete.
TARGET already has a generated/customised `src/styles.css`; reconcile it deliberately
with the SOURCE design rather than assuming it is the production theme.

E2 is a staged foundation, not a bulk stylesheet copy. S2.1 establishes only the
tokens consumed by live UI; S2.2 makes class-based dark utilities valid; S1.3 then
connects the runtime theme behavior and ports the shell against those tokens; S2.3
adds article-only typography once an article can render; S2.4 removes temporary and
unused CSS after parity checks. Keep TARGET runnable at every checkpoint.

---

#### S2.1 — Recreate the used theme tokens with `@theme inline`
**Learn (B):** v4's CSS-first model. Design tokens become real CSS custom properties that also generate utilities — no JS object, no `theme()` function calls.

**Story:** As a developer, I want the design tokens defined in CSS, so that there is one source of truth and no build-time JS config.

**Depends on:** S1.1

**Tasks:**
- [ ] Capture SOURCE reference screenshots of the home shell at 375px and 1440px in light and dark mode, and record the computed body/background/font values needed to distinguish intentional styling from starter defaults
- [ ] Keep TARGET's existing `src/styles.css` path and existing root `?url` import; deleting a gratuitous rename avoids churn in `__root.tsx` and `components.json`
- [ ] Inventory semantic classes used by the pages and the four required shadcn primitives, then map only those SOURCE colours through TARGET `@theme inline` `--color-*` tokens
- [ ] Port the SOURCE `:root` / `.dark` HSL custom properties from `src/styles/globals.css`; do not substitute the starter's current teal/green theme if visual parity is still the goal
- [ ] Port `--radius` and the `spotlight` keyframes/animation into `@theme`
- [ ] Do not port unused SOURCE `--chart-*` or `--sidebar-*` tokens; the blog has no chart or sidebar primitive using them
- [ ] Ensure TARGET has no `@config` directive (SOURCE keeps its directive until/unless it is retired separately)
- [ ] **Do not create a TARGET `tailwind.config.js`.** SOURCE's existing config remains as the parity reference.

**Acceptance:**
- [ ] `bg-background`, `text-muted-foreground`, `border-border` etc. all resolve
- [ ] Light and dark semantic values resolve correctly when `.dark` is manually applied; the persisted UI toggle is verified in S1.3
- [ ] No `tailwind.config.js` in TARGET's build path

**Checkpoint questions:**
1. In v4, what's the difference between defining `--color-primary` inside `@theme` vs. inside `:root`?
2. The old config used `theme("colors.foreground")` inside the typography plugin. What replaces that in v4?

#### S2.2 — Dark mode variant
**Learn (B):** `@variant` / `@custom-variant` replaces `darkMode: "class"`.

**Story:** As a developer, I want class-based dark mode without a JS config key.

**Depends on:** S2.1

**Tasks:**
- [ ] Declare the dark variant in CSS (v4 `@custom-variant dark (&:where(.dark, .dark *))`)
- [ ] Verify `dark:` utilities compile
- [ ] Before S1.3 is complete, verify the variant independently by manually adding/removing `.dark` on `<html>`; runtime persistence and system synchronization belong to S1.3

**Acceptance:**
- [ ] `dark:bg-card` responds to the `.dark` ancestor; after S1.3, the real toggle flips it live

---

#### S2.3 — Typography plugin & prose styles
**Learn (B):** how a v3-era plugin config becomes v4 CSS.

**Story:** As a reader, I want article prose to look exactly as it does today.

**Depends on:** S2.1, S5.1

**Tasks:**
- [ ] `@plugin "@tailwindcss/typography";` in TARGET `src/styles.css`
- [ ] Translate the ~80 lines of SOURCE `tailwind.config.js` `typography.DEFAULT.css` overrides into TARGET CSS (`.prose { ... }` customisations or `@utility`)
- [ ] Keep the `max-width: 720px`, `font-size: 18px`, `line-height: 1.7` values exactly
- [ ] Port the `--code-inline-*` / `--code-block-*` tokens

**Acceptance:**
- [ ] Side-by-side screenshot of one TARGET article and the SOURCE Gatsby build at 1440px in both themes is pixel-comparable

**Watch for:** the `code::before` / `code::after` `content: ""` resets. Losing them re-introduces backtick artifacts around inline code.

---

#### S2.4 — CSS necessity and parity audit
**Learn (B):** use modern CSS where it solves a present layout problem, not as a migration quota.

**Story:** As a developer, I want TARGET CSS to contain only styles the blog uses while preserving SOURCE behaviour and accessibility.

**Depends on:** S2.3

**Tasks:**
- [ ] Keep the article page's viewport-responsive grid unless the component is actually embedded in differently sized containers; do not force a container-query rewrite
- [ ] When touching a flex/grid parent, prefer `gap-*` over SOURCE `space-x-*`, but do not create a repo-wide cosmetic rewrite
- [ ] Remove TARGET starter-only fonts, teal/green theme variables, demo utilities, unused `!important`, and tokens with no consumer
- [ ] Preserve SOURCE's reduced-motion rules and test keyboard focus visibility

**Acceptance:**
- [ ] Layout holds at 375 / 768 / 1024 / 1440
- [ ] `rg` confirms unused chart/sidebar and starter demo tokens are absent from TARGET

---

### E3 — MDX Content Pipeline
**Tracks:** A · **Est:** 3 sessions · **Depends on:** S0.2, S1.1 · **Parallel with:** E2

Goal: this is the epic that removes Gatsby's reason to exist **for TARGET**. The
equivalent of SOURCE `gatsby-node.js`, `gatsby-config.ts` MDX configuration, and
page-level GraphQL becomes a Vite plugin configuration and one TARGET module.

First copy the content corpus and required static assets into TARGET so it builds
without reaching across the subdirectory boundary. Runtime imports from SOURCE are
not allowed; SOURCE is a reference, not a shared package.

---

#### S3.1 — Wire MDX into Vite
**Story:** As a developer, I want `.mdx` files to compile to React components with typed frontmatter exports.

**Depends on:** S0.2, S1.1

**Tasks:**
- [ ] Create TARGET `src/content/articles/` and copy all 20 SOURCE `src/content/articles/*.mdx` files into it. Preserve SOURCE files byte-for-byte at this step.
- [ ] Create TARGET `public/images/` and copy the SOURCE static image assets required by pages and articles. TARGET must own its deployable assets.
- [ ] `npm i @mdx-js/rollup remark-frontmatter remark-mdx-frontmatter remark-gfm`
- [ ] Add `mdx()` to `vite.config.ts` **before** `viteReact()`
- [ ] Configure `remarkPlugins: [remarkFrontmatter, [remarkMdxFrontmatter, { name: 'frontmatter' }], remarkGfm]`
- [ ] Do not configure `providerImportSource` or add `@mdx-js/react`; S3.4 uses rehype-generated heading IDs and needs no provider
- [ ] Create `src/types/mdx.d.ts` declaring the `*.mdx` module shape so TS stops complaining

**Acceptance:**
- [ ] `import Post, { frontmatter } from '@/content/articles/some-post.mdx'` type-checks and renders

---

#### S3.2 — Build the content module
**Learn (A/C):** replacing a data layer with a plain module. This is the heart of the migration.

**Story:** As a developer, I want one content registry with a serializable metadata API and a separate MDX-rendering API, so routes never try to dehydrate React components.

**Depends on:** S3.1

**Tasks:**
- [ ] Create TARGET `src/lib/content.ts`
- [ ] Use eager **named-export** globs for `frontmatter` and `toc`, allowing Vite to tree-shake compiled article bodies out of metadata consumers
- [ ] Use a separate lazy `import.meta.glob<ArticleModule>('../content/articles/*.mdx')` registry for full MDX modules; do not use `{ eager: true }` for article components
- [ ] Define a Zod v4 schema matching the real frontmatter: `title, slug, excerpt, date, category, tags[], readingTime, featured, author`
- [ ] Validate against SOURCE's actual category values, not the stale category list in SOURCE `AGENTS.md`: the corpus currently contains Backend (7), Cloud (5), Frontend (4), DevOps (2), Productivity (1), and Writing (1). Do not reject the last two.
- [ ] Create a focused category presentation map for those six live values (including Productivity and Writing); do not copy unused Healthcare/Architecture/Database/Security entries merely because SOURCE's stale fixture contains them
- [ ] Parse every module's frontmatter through the schema — **throw on failure**, so bad content fails the build
- [ ] Define separate types: `ArticleMetadata` contains only serializable frontmatter/TOC data; `ArticleModule` additionally owns the compiled MDX component; cache stable `React.lazy` wrappers by slug outside render
- [ ] Export `getArticles()` (metadata only, sorted `date` DESC), `getArticleMetadataBySlug(slug)`, `getArticleComponentBySlug(slug)`, `getCategories()`, and `getAllTags()`
- [ ] Never return the MDX component, module object, functions, or VFile/plugin objects from a Router loader; loader data is dehydrated for the client
- [ ] Treat validated frontmatter `slug` as the canonical URL key and assert slugs are unique. Do **not** derive URLs from filenames: SOURCE has one intentional mismatch, `how-to-be-productive-after-work.mdx` → `stop-wasting-time-how-to-be-productive-after-work`, and that production URL must remain unchanged.

**Acceptance:**
- [ ] `getArticles()` returns 20 fully-typed articles
- [ ] Both metadata and lazy-component lookups for `stop-wasting-time-how-to-be-productive-after-work` resolve the differently named MDX file
- [ ] Vite output contains separate lazy article chunks; `/` and `/articles` do not eagerly import all compiled MDX bodies
- [ ] Deliberately corrupting one frontmatter date fails the build with a readable Zod error naming the file

**Checkpoint questions:**
1. Line-count TARGET `src/lib/content.ts` against SOURCE `gatsby-node.js` + the three SOURCE `graphql` blocks it replaces.
2. SOURCE `scripts/validate-content.ts` overlaps this functionality, but belongs to the other application. Does TARGET need its own separate validation script, or is build-time Zod validation sufficient? (Do not create duplicate TARGET validation paths.)

---

#### S3.3 — Syntax highlighting via Shiki
**Learn (A/B):** rehype plugins, and dual-theme highlighting driven by CSS variables.

**Story:** As a reader, I want code blocks highlighted in a theme that follows the site's light/dark toggle.

**Depends on:** S3.1, S2.2

**Tasks:**
- [ ] `npm i rehype-pretty-code rehype-slug`
- [ ] Configure with dual themes (e.g. `{ light: 'github-light', dark: 'github-dark' }`)
- [ ] Add the CSS-variable switching rules to TARGET `src/styles.css`
- [ ] Verify all 105 fenced blocks render. The 100 labelled blocks include `java` (28), `json` (18), `bash` (11), `typescript` (7), `go` (6), `yaml` (5), `python` (4), `css` (4), `javascript` (3), `jsx` (2), `docker` (2), plus single-use labels and case variants (`xml`, `log`, `http`, `js`, `dockerfile`, `SQL`, `JavaScript`, `Java`, `Docker`, `k8s`). Normalise unsupported/case-variant labels in S3.5.
- [ ] Confirm TARGET does not install `prismjs` or `gatsby-remark-prismjs` and does not copy SOURCE `src/styles/prism-theme.css`. Do not uninstall or delete them in SOURCE.

**Acceptance:**
- [ ] All 105 fenced blocks render safely in both themes; supported languages are highlighted and deliberate plain-text fallbacks remain readable
- [ ] No `prism` string remains in `src/` or `package.json`

**Watch for:** ` ```log ` may not be a Shiki-supported language. Fall back to plain text rather than adding a custom grammar.

---

#### S3.4 — Heading anchors & table of contents
**Learn (A):** replacing Gatsby's `tableOfContents(maxDepth: 3)` GraphQL field.

**Story:** As a reader, I want the sticky TOC sidebar and clickable heading anchors to work as they do today.

**Depends on:** S3.3

**Tasks:**
- [ ] `rehype-slug` for heading IDs (already installed in S3.3)
- [ ] Add a small remark/rehype plugin that exports a serializable `toc` named export from each compiled MDX module; use the same GitHub-style slug algorithm as `rehype-slug` (including duplicate headings), and consume the named export without bundling raw article source into the client
- [ ] Cap at depth 3 to match current behaviour
- [ ] Port the visual structure of SOURCE `TableOfContents.tsx`, but use ordinary `<a href="#...">` links plus CSS `scroll-margin`; remove the click handler that prevents native hash/history behaviour
- [ ] Do not port SOURCE `HeadingComponents.tsx` or `MDXProvider`: those wrappers only generate IDs, which `rehype-slug` already owns

**Acceptance:**
- [ ] TOC renders for a long article (`building-a-batch-pipeline-01-crash-course-in-spring-batch.mdx` is a good test)
- [ ] Anchor links scroll with correct offset
- [ ] Clicking a TOC link updates the URL hash and works with copy-link, back/forward, keyboard activation, and JavaScript disabled

---

#### S3.5 — Content corpus fixes
**Story:** As a developer, I want TARGET's 20 copied `.mdx` files to compile with prose unchanged and only fence metadata/labels normalised where MDX v3 or Shiki requires it.

**Depends on:** S3.3

**Tasks:**
- [ ] In TARGET only, `cloning-discords-login-form-to-mess-with-styled-components.mdx` line 46: ` ```jsx{7} ` is **Prism** line-highlight syntax. Convert it to `rehype-pretty-code`'s meta format.
- [ ] In TARGET only, change the `k8s` fence label to `yaml`; it was a custom alias in SOURCE `gatsby-config.ts`.
- [ ] In TARGET only, normalise the case variants `SQL`, `JavaScript`, `Java`, and `Docker` to Shiki's canonical lowercase labels. Verify `dockerfile`; treat `log` as plain text if unsupported.
- [ ] Verify all 20 files compile — every JSX-looking block in the corpus is inside a code fence, so no MDX v2→v3 component breakage is expected
- [ ] Verify raw HTML in MDX (`<p>`, `<a href>` in the Discord article) still renders under MDX v3
- [ ] Confirm all 31 distinct `/images/articles/*` references resolve from TARGET `public/`, with no fallback to SOURCE files

**Acceptance:**
- [ ] All 20 articles compile with zero warnings
- [ ] Every image in every article loads (31 distinct article image paths are referenced)

---

### E4 — Static Routes
**Tracks:** A · **Est:** 1 session · **Depends on:** S1.3, S2.2

---

#### S4.1 — Home route
**Story:** As a visitor, I want the homepage to render the hero, 10 most recent articles, and projects.

**Depends on:** S3.2

**Tasks:**
- [ ] TARGET `src/routes/index.tsx` loader returns `getArticles().slice(0, 10)` metadata only; set `staleTime: Infinity` because this data cannot change without a new build
- [ ] Port SOURCE `Hero.tsx`, `ArticleList.tsx`, and `Projects.tsx` into TARGET
- [ ] Do not port unused SOURCE `RecentArticles.tsx` or commented `sampleArticles`; move only live `projects` data to a focused TARGET module
- [ ] Port SOURCE `TextType.tsx` typing behaviour, but replace its GSAP-only cursor blink with a CSS keyframe. Keep the timeout/observer logic that actually drives typing and remove the GSAP dependency.
- [ ] Port SOURCE `spotlight.tsx` and test it the same way

**Acceptance:**
- [ ] `/` matches the Gatsby homepage visually
- [ ] View source on the prerendered build: article titles are present in the HTML

**Checkpoint question:** What's the difference between a TanStack Router `loader` and a `beforeLoad`, and which runs during prerender?

---

#### S4.2 — About route & 404
**Story:** As a visitor, I want `/about` and a 404 page.

**Depends on:** S1.3

**Tasks:**
- [ ] Port SOURCE `src/pages/about.tsx` → TARGET `src/routes/about.tsx`
- [ ] Update the single factual sentence that says the site uses Gatsby so TARGET names TanStack Start; otherwise preserve About-page content and layout
- [ ] Confirm the 404 wired in S1.3 renders for unknown paths
- [ ] Compare SOURCE's catch-all `netlify.toml` 404 redirect with Start/Netlify's generated routing. Do not blindly copy the Gatsby redirect into TARGET if it would intercept server functions; verify unknown paths return the TARGET not-found UI with status 404.

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
- [ ] The loader resolves **serializable metadata/TOC only** via `getArticleMetadataBySlug(params.slug)`, throws `notFound()` if missing, and uses `staleTime: Infinity`
- [ ] The route component resolves the cached lazy component for `params.slug` and renders it inside one focused Suspense boundary with a stable article-body fallback; never return the component from the loader
- [ ] Port the two-sidebar grid layout (TOC left, sharing right)
- [ ] Port only the used behaviour from SOURCE `SharingComponent.tsx`. The hardcoded origin actually lives in SOURCE `src/templates/article.tsx`; build canonical/share URLs from one site-origin constant plus typed route params, not `window.location`

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
- [ ] Recreate the tags with actual consumers: title, description, canonical, OG title/description/image/url/type/site name, article published/modified time, Twitter card fields, author, and RSS alternate
- [ ] Do not port SOURCE's non-standard `<meta name="image">` or redundant default `robots="index, follow"`; emit OG image dimensions only when the selected image's dimensions are known
- [ ] Recreate `BlogPosting` JSON-LD including the `sameAs` social array; use the article's real category/tags instead of hardcoded `articleSection: "Technology"`
- [ ] Extract the shared bits into `src/lib/seo.ts` so E7 can reuse it

**Acceptance:**
- [ ] `curl` a prerendered article and diff its `<head>` against the current production page — only intended differences

---

### E6 — Articles Index & URL-as-State
**Tracks:** A · C · **Est:** 2 sessions · **Depends on:** S5.1

Goal: the state-management refresher, done on real code. SOURCE `src/pages/articles.tsx` holds `searchQuery`, `selectedCategory`, `selectedTags`, and `currentPage` in four `useState` hooks — so filters are unshareable, un-bookmarkable, and lost on back-navigation.

---

#### S6.1 — Type-safe search params
**Learn (C):** URL as the state store. TanStack Router's `validateSearch` gives Zod-validated, type-safe, serialisable search params natively — this is why **nuqs is not being used** (its TanStack Router adapter is experimental and does not cover TanStack Start).

**Story:** As a reader, I want to share a filtered article URL and have the recipient see the same filters.

**Depends on:** S5.1

**Tasks:**
- [ ] Create `src/routes/articles.index.tsx`
- [ ] Its loader returns the full serializable article-metadata list with `staleTime: Infinity`; filtering/pagination remain cheap derived values in the component and do not become loader dependencies or Query data
- [ ] Define a Zod v4 schema with safe fallbacks: `q` string, optional validated category, string-array tags, and a coerced/clamped positive page. Use `.catch(...)` for malformed public URLs so a bad query parameter does not render the route error boundary.
- [ ] Pass the Zod v4 schema directly to `validateSearch`; do not install the Zod v3 adapter
- [ ] Use `stripSearchParams` for empty/default `q`, `tags`, and `page = 1` so generated links remain canonical and readable
- [ ] Replace all four `useState` hooks with `Route.useSearch()`
- [ ] Update filter controls to `navigate({ search: (prev) => ({ ...prev, ... }) })`
- [ ] Reset `page` to 1 whenever `q`/`category`/`tags` change — note this replaces the current `useEffect`, which is a **React anti-pattern** (derived state in an effect)

**Acceptance:**
- [ ] `/articles?q=spring&category=Backend&page=2` loads with those filters applied
- [ ] Browser back/forward moves through filter history
- [ ] Zero `useEffect` in this route

**Checkpoint questions:**
1. Why is `useEffect(() => setCurrentPage(1), [filters])` an anti-pattern, and what are the two idiomatic alternatives?
2. What does `validateSearch` do with a malformed param — and how do you control that?

---

#### S6.2 — Derived state and dependency audit
**Learn (C · D):** most "state" isn't state, and a small static list does not earn a cache/state library.

**Story:** As a developer, I want every value in this route classified as URL state, derived value, or genuine local state.

**Depends on:** S6.1

**Tasks:**
- [ ] Write the classification table into §10
- [ ] Remove SOURCE `useMemo` wrappers where filtering/sorting 20 metadata objects is trivially cheap; keep memoization only if measurement shows a real issue
- [ ] Do not add React Compiler for this route; the migration should first make the data flow simple and correct
- [ ] Confirm the final route has zero `useEffect`

**Acceptance:**
- [ ] Classification table complete
- [ ] A written answer to state placement: no Zustand/Jotai/Redux; Router search owns filters, local derivation owns filtered results, Router loaders own static metadata, and Query owns only the view counter

---

#### S6.3 — Filter components
**Story:** As a reader, I want search, category select, tag toggles, and pagination to work as they do today.

**Depends on:** S6.1

**Tasks:**
- [ ] Keep `SearchInput`, `CategoryFilter`, `TagFilter`, and `Pagination` as controlled/presentational components; let the route translate their values/callbacks to typed search navigation instead of coupling every leaf component to Router
- [ ] Keep only the search box's draft text as genuine local UI state, debounce it against the URL (~200ms), and use `navigate({ replace: true })` for intermediate keystrokes so typing does not spam history
- [ ] Port the active-filter chips and "Clear all"

**Acceptance:**
- [ ] Typing 10 characters adds ≤2 entries to browser history
- [ ] Behaviour otherwise identical to current site

---

### E7 — SEO, Feeds & Sitemaps
**Tracks:** A · **Est:** 2 sessions · **Depends on:** S5.2, S6.1

Goal: replace four Gatsby plugins with owned code. This is where "bespoke" pays off — each of these is ~20 lines you fully understand.

Before implementing this epic, run a clean SOURCE build and copy `rss.xml`,
`robots.txt`, `sitemap-index.xml`, and `sitemap-0.xml` from SOURCE `public/` into a
clearly named TARGET test-fixture directory such as `migration-baseline/`. SOURCE
`public/` is generated and ignored, so do not describe those files as committed or
assume a previous local build is the authoritative baseline. Record the SOURCE
commit used to generate them.

---

#### S7.1 — RSS feed
**Story:** As a subscriber, I want `/rss.xml` to keep working with no change to my reader.

**Depends on:** S3.2

**Tasks:**
- [ ] Create `src/routes/rss[.]xml.ts` as a server route (note the `[.]` escaping convention)
- [ ] Generate the feed from `getArticles()` using validated frontmatter `title`, `excerpt`, and `date`, plus the unchanged URL/GUID format. All 20 posts require an excerpt, so do not build a second prose-excerpt generator.
- [ ] Set `Content-Type: application/rss+xml`
- [ ] Diff against the captured SOURCE `rss.xml` fixture from the same baseline build

**Acceptance:**
- [ ] Feed validates (W3C feed validator)
- [ ] Item GUIDs are **unchanged** from the current feed — changing them re-notifies every subscriber

---

#### S7.2 — Sitemap & robots
**Story:** As a search engine, I want a sitemap and robots.txt equivalent to today's.

**Depends on:** S3.2

**Tasks:**
- [ ] Create `src/routes/sitemap-0[.]xml.ts` listing the 23 canonical indexable pages (20 articles + `/`, `/articles/`, `/about/`); exclude the 404 and non-HTML resource routes. Preserve SOURCE's trailing-slash URL form.
- [ ] Put the fixed SOURCE-compatible sitemap index at TARGET `public/sitemap-index.xml`; it only points to `https://s11a.com/sitemap-0.xml` and does not earn a server route
- [ ] Put the fixed SOURCE-compatible robots content at TARGET `public/robots.txt`, including `Sitemap: https://s11a.com/sitemap-index.xml` and `Host: https://s11a.com`; it does not earn a server route
- [ ] Diff all three outputs against the captured SOURCE sitemap and robots fixtures; preserve their public URL/shape or deliberately record any non-semantic serialization difference.

**Acceptance:**
- [ ] Sitemap index + sitemap document + robots are served correctly and present in `dist/client` after prerender

---

#### S7.3 — Analytics
**Story:** As the site owner, I want GA4 firing as it does today, still respecting DNT.

**Depends on:** S1.3

**Tasks:**
- [ ] Add the gtag script via `__root.tsx` `head.scripts`, gated on the env var (currently `GATSBY_GA_MEASUREMENT_ID` — rename to `VITE_GA_MEASUREMENT_ID`)
- [ ] Reimplement the `respectDNT` behaviour `gatsby-plugin-google-gtag` provided
- [ ] Subscribe once to Router's `onResolved` event for SPA pageviews and return/unregister the subscription during teardown; use Router events for this imperative integration, not reactive render state
- [ ] Add `VITE_GA_MEASUREMENT_ID` to TARGET's Netlify environment before removing/ignoring SOURCE's `GATSBY_GA_MEASUREMENT_ID`; never expose a secret by copying local `.env` files

**Acceptance:**
- [ ] Pageviews fire on client-side navigation, not just hard loads
- [ ] Nothing fires when DNT is on
- [ ] Existing CSP `script-src`/`connect-src` entries still cover it

---

### E8 — React 19 Compatibility Pass
**Tracks:** D · **Est:** 1 session · **Depends on:** E5

Goal: write TARGET-native React 19 code and avoid copying SOURCE's Gatsby/React 18
wrappers. This is a compatibility audit, not a hook-demo epic.

---

#### S8.1 — Generate TARGET shadcn primitives for React 19 + Tailwind v4
**Story:** As a developer, I want TARGET-native shadcn primitives rather than copies of SOURCE's generated React 18 code.

**Depends on:** S2.3

**Tasks:**
- [ ] TARGET is already shadcn-initialised. Keep `components.json` pointed at `src/styles.css` and keep its empty Tailwind config value rather than inventing a JS config file.
- [ ] Audit the `button` generated for S1.3, then add `card`, `badge`, and `select` via the CLI in TARGET; diff each against its SOURCE counterpart and reapply intentional local changes deliberately
- [ ] SOURCE `spotlight.tsx` is custom — port it to TARGET by hand
- [ ] Verify Radix Select works under React 19

**Acceptance:**
- [ ] All four generated primitives plus custom `spotlight` render; no React 19 console warnings

---

#### S8.2 — React 19 compatibility audit
**Learn (D):** React 19 accepts `ref` as a prop, but most blog components do not need a ref API at all.

**Story:** As a developer, I want simple React 19 components without Gatsby types or artificial modern-hook examples.

**Depends on:** S8.1

**Tasks:**
- [ ] Do not copy SOURCE shadcn primitives into TARGET; generate the four used primitives so React 19/ref conventions come from the current generator
- [ ] Grep TARGET for `forwardRef`; if a custom component genuinely exposes a ref, accept `ref` in its typed props, otherwise remove the unused ref plumbing entirely
- [ ] Use plain function components for TARGET routes/components and omit SOURCE `React.FC<PageProps<...>>` Gatsby annotations
- [ ] Keep effects only for real external synchronization (theme storage/media query, menu/DOM events, analytics, counter increment). Keep Suspense limited to the lazy MDX renderer; do not add deferred loaders, `use()`, `useActionState`, `useOptimistic`, or React Compiler.
- [ ] Navigate between articles and confirm the existing synchronous local-content path has no flash before considering a `pendingComponent`; do not add a spinner that never appears in realistic use

**Acceptance:**
- [ ] Zero `forwardRef` in `src/`
- [ ] `npm run check` clean
- [ ] No hydration warning in console

---

### E9 — Runtime Article View Counter
**Tracks:** A · C · **Est:** 2 sessions · **Depends on:** E5

Goal: ship the requested view counter as the only dynamic feature. Static article
content stays in Router/local modules; Query and server functions do not become a
second content architecture.

---

#### S9.1 — Server functions + Query + Netlify Blobs
**Learn (A · C):** the one place on this site where Query is earned—runtime server state with reads, a mutation, cache updates, and failure isolation.

**Story:** As the site owner, I want a per-article view count, so that the framework's dynamic path is proven end-to-end.

**Depends on:** S5.1

**Tasks:**
- [ ] Install `@netlify/blobs`; create a shared Zod slug schema, `article-views.functions.ts` for the public server-function wrappers, and `article-views.server.ts` for Blob-only code
- [ ] Implement validated `GET getViews(slug)` and `POST incrementViews(slug)` with `createServerFn().validator(schema)` and default strict serialization. Import server functions statically; never dynamically import them.
- [ ] Mark counter RPC responses `Cache-Control: no-store`; Query owns the short-lived browser cache, while CDN/browser HTTP caching would serve stale counts
- [ ] Keep all `getStore` access in `.server.ts`; use a site-wide `article-views` store with strong-consistency reads
- [ ] Implement increment as a bounded compare-and-swap retry using Blob ETags plus `onlyIfMatch`/`onlyIfNew`. A naïve read-then-set loses concurrent increments because Blobs is last-write-wins.
- [ ] Treat the metric as best-effort rather than billing-grade analytics; after bounded contention retries, fail without affecting the article page
- [ ] Run the normal Vite dev server and verify the Netlify integration provides a sandboxed local Blob store without `netlify dev`
- [ ] Keep TARGET's generated per-request Query client/SSR integration, but create a focused `viewCountQueryOptions(slug)` factory and mutation; Query keys include the slug
- [ ] Do not call `ensureQueryData`/`prefetchQuery` from the article loader: this widget is non-critical, must not delay SEO content, and must never contact Blobs while prerendering
- [ ] Render a small counter inside Router's `<ClientOnly fallback={...}>` so neither the GET nor POST executes during prerender/build and article HTML never waits for it
- [ ] Increment once per slug per browser session after hydration using guarded `sessionStorage`; the POST returns the authoritative count and `onSuccess` writes it with `queryClient.setQueryData`
- [ ] Do not add `useOptimistic`: a passive counter does not need speculative UI, and showing a false increment on failure is worse than briefly showing the previous value
- [ ] Configure conservative Query behaviour for this non-critical widget (bounded retry, meaningful `staleTime`, and no unnecessary refetch-on-focus); log failures only in development
- [ ] Enable Start's CSRF middleware for mutation server functions and verify same-origin production calls

**Acceptance:**
- [ ] Count displays and increments
- [ ] Article pages still prerender to static HTML — the counter hydrates in, it does not block the build
- [ ] A production build does not mutate or read the production view store
- [ ] Two concurrent increment requests do not silently overwrite one another in the normal retry path
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
- [ ] TARGET's scaffold already has `enabled: true` and `crawlLinks: true`; add `failOnError: true` and remove the temporary novelty `onSuccess` logger once it stops serving the learning exercise
- [ ] Confirm `crawlLinks` discovers all 20 article routes from `/articles` — if any are missed, add them explicitly via the `pages` array
- [ ] Add explicit prerender entries for the generated `rss.xml` and `sitemap-0.xml` routes; `robots.txt` and `sitemap-index.xml` are fixed files copied from TARGET `public/`
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

**Depends on:** S9.1, S10.1

**Tasks:**
- [ ] Confirm `@netlify/vite-plugin-tanstack-start` is active in `vite.config.ts`; do not add Nitro or a Nitro preset
- [ ] Configure the Netlify site/branch deploy with **base directory `scratch/s11a.com`**. TARGET's existing `netlify.toml` already declares `command = "npm run check && npm run build"` and `publish = "dist/client"`; verify Netlify actually discovers that file from the configured base.
- [ ] Keep SOURCE's root `netlify.toml` unchanged until the cutover switch. Do not make TARGET publish SOURCE `public/` or run SOURCE's root build command.
- [ ] Confirm the integration emits the runtime server functions needed by the article view counter
- [ ] Re-verify the CSP — the current policy is strict and hand-written; check `script-src`/`connect-src` still cover Start's hydration bootstrap and any server-function calls
- [ ] Confirm the cache-control header rules still match the new asset paths and hashing scheme
- [ ] Verify TARGET's `.nvmrc`, `package.json` engines, and Netlify image agree on TARGET's chosen Node 24.19.x / npm 11.17.x toolchain. SOURCE remains on Node 22.4.1 because it is an independent app.
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

### E11 — Cutover, Isolation & Documentation
**Tracks:** A · **Est:** 1 session · **Depends on:** E10

Do not start this epic until E10 is green. Cutover changes which subdirectory Netlify
deploys; it does not delete the SOURCE application.

---

#### S11.1 — Prove TARGET is standalone
**Story:** As a maintainer, I want TARGET to install, build, test, and deploy without importing or executing anything from SOURCE.

**Depends on:** S10.3

**Tasks:**
- [ ] Audit TARGET `package.json` and lockfile: no `gatsby`, `gatsby-*`, `prismjs`, Gatsby-specific override, or SOURCE-only Lighthouse harness should have been copied in
- [ ] Audit TARGET source/config for cross-project paths such as `../../src`, `../../public`, or imports that resolve outside TARGET. Replace every one with a TARGET-owned file.
- [ ] Confirm TARGET owns all 20 MDX files, all required images, feed/sitemap/robots generation, metadata, and configuration
- [ ] Confirm TARGET did not copy SOURCE `RecentArticles.tsx`, commented `sampleArticles`, or the mixed `sampleData.ts`; keep live projects/category icons in focused modules and use `ArticleMetadata` from the content registry
- [ ] Remove unused generated starter code and dependencies from TARGET (demo header, production devtools, placeholder styles, and placeholder README text). Retain the focused Query integration required by E9. Do not delete similarly named SOURCE files.
- [ ] Ensure TARGET `.gitignore` covers `dist/`, `.netlify/`, and generated route-tree output; keep migration baselines only if they are deliberate fixtures
- [ ] From a clean clone, run `cd scratch/s11a.com && npm ci && npm run check && npm run build`
- [ ] Separately run SOURCE's normal validation/build once to confirm the reference app was not damaged by the migration branch

**Acceptance:**
- [ ] `rg -i gatsby scratch/s11a.com` returns no runtime code or dependency (historical migration notes may mention Gatsby)
- [ ] TARGET `npm audit` is clean without Gatsby-era overrides
- [ ] Fresh TARGET install/check/build works without installing SOURCE dependencies
- [ ] SOURCE remains present and runnable as the migration reference

---

#### S11.2 — Documentation for a two-project repository
**Story:** As my future self, I want repository-level and TARGET documentation to make the application boundary unmistakable.

**Depends on:** S11.1

**Tasks:**
- [ ] Keep root `AGENTS.md` accurate for SOURCE, but add a short repository-layout note that TARGET has its own instructions. Do not rewrite Gatsby commands as if TARGET replaced the root app.
- [ ] Create TARGET `AGENTS.md` describing TanStack Start, React 19, Vite, Tailwind v4, Oxfmt/Oxlint, TARGET-only commands, and the no-cross-project-import rule
- [ ] Replace TARGET's generated `README.md` with project-specific setup/build/deploy instructions; update the root README only to explain the SOURCE/TARGET layout and which app Netlify deploys
- [ ] Document the content pipeline: how to add an article, what the frontmatter schema requires, how prerendering picks it up
- [ ] Document that TARGET uses Oxfmt/Oxlint while SOURCE keeps its ESLint configuration; do not edit SOURCE ignores as TARGET cleanup

**Acceptance:**
- [ ] A stranger could add an article and deploy it from the README alone

---

#### S11.3 — Merge
**Story:** As the site owner, I want this live.

**Depends on:** S11.2

**Tasks:**
- [ ] Verify all 20 article URLs against the production sitemap — **any 404 here is a broken inbound link and lost SEO**
- [ ] Confirm `rss.xml` GUIDs unchanged (S7.1)
- [ ] Switch the production Netlify site's base directory to `scratch/s11a.com` (or apply the equivalent committed monorepo configuration) and confirm its publish path resolves to TARGET `dist/client`
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
`S0.1 → S0.2 → S1.1 → S1.2 → S2.1 → S2.2 → S1.3 → S3.1 → S3.2 → S5.1 → S2.3 → S0.3 → S10.1` — you now have a themed shell and a real prerendered article. Everything after is filling in.

**Layered** — finish each subsystem before moving on: straight down E0 → E11.

The vertical slice de-risks the two things most likely to be dealbreakers (MDX pipeline, prerendering) inside the first few sessions.

---

## 7. Risk register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| TanStack Start/version-family drift (`latest` ranges currently resolve related TanStack packages to different 1.x patch lines) | High | Medium | Pin TARGET to its known-good lockfile versions; bump deliberately and verify together. |
| Accidental edits or imports across SOURCE/TARGET | Medium | High | Workspace contract, TARGET-owned copies of content/assets, cross-boundary path audit in S11.1. |
| Netlify builds the repository root instead of TARGET | High | High | Set and verify base directory `scratch/s11a.com` in the preview before production cutover. |
| `crawlLinks` misses article routes | Medium | High | S10.1 verifies count = 24. Fall back to the explicit `pages` array. |
| CSP breaks under Start's hydration bootstrap | Medium | High | S10.2 explicitly re-verifies. The existing policy already allows `script-src 'unsafe-inline'`. |
| Netlify cache headers stop matching new asset paths | High | Low | Called out in S10.2. Silent failure mode — check it, don't assume. |
| URL shape changes (trailing slashes) break inbound links | Low | High | `autoSubfolderIndex` in S10.1; full URL verification in S11.3. |
| Blob counter loses concurrent increments | Medium | Medium | Strong reads plus bounded ETag compare-and-swap retries; document the counter as best-effort. |
| E9 scope creep | High | Medium | Keep one counter widget; no dashboard, unique-user analytics, historical charts, or generalized data layer. |
| Lighthouse performance regression vs. Gatsby | Medium | Low | Accepted, not tracked. Hydrating framework on a CDN-served 20-post blog. |

---

## 8. Dependency delta

SOURCE and TARGET have independent manifests; there is no root-level package swap.

**Intentionally not copied from SOURCE into TARGET:** `gatsby`, every `gatsby-*`
package, `prismjs`, `@mdx-js/react`, `gsap` (cursor blink becomes CSS), `postcss`, `@tailwindcss/postcss`, SOURCE's Lighthouse harness packages,
and SOURCE's Gatsby security overrides. They remain in SOURCE because SOURCE remains
an intact reference application.

**Already present in the fresh TARGET scaffold:** `@tanstack/react-router`,
`@tanstack/react-start`, Vite, React 19, `@vitejs/plugin-react`,
`@netlify/vite-plugin-tanstack-start`, `@tailwindcss/vite`, Tailwind,
`@tanstack/react-query`, shadcn support packages, Oxfmt, and Oxlint. Query is
retained specifically for S9.1; unused starter integrations must be removed.

**Still to add to TARGET:** `@mdx-js/rollup`, `remark-frontmatter`,
`remark-mdx-frontmatter`, `remark-gfm`, `rehype-pretty-code`, `rehype-slug`, Zod,
`@netlify/blobs` and any Radix
packages required by the selected shadcn components. Nitro is not part of this
architecture.

---

## 9. Reference

- TanStack Start — Static Prerendering: https://tanstack.com/start/latest/docs/framework/react/guide/static-prerendering
- TanStack Start — Server Functions: https://tanstack.com/start/latest/docs/framework/react/guide/server-functions
- TanStack Start — Execution Model: https://tanstack.com/start/latest/docs/framework/react/guide/execution-model
- TanStack Start — CSS Styling: https://tanstack.com/start/latest/docs/framework/react/guide/css-styling
- TanStack Start — Hosting (Netlify): https://tanstack.com/start/latest/docs/framework/react/guide/hosting#netlify
- Netlify — TanStack Start integration: https://docs.netlify.com/build/frameworks/framework-setup-guides/tanstack-start/
- Netlify — Blobs: https://docs.netlify.com/build/data-and-storage/netlify-blobs/
- TanStack Router — Search Params: https://tanstack.com/router/latest/docs/framework/react/guide/search-params
- TanStack Router — Data Loading: https://tanstack.com/router/latest/docs/framework/react/guide/data-loading
- TanStack Router — Document Head: https://tanstack.com/router/latest/docs/framework/react/guide/document-head-management
- TanStack Router — Router Events: https://tanstack.com/router/latest/docs/framework/react/guide/router-events
- TanStack Router — `ClientOnly`: https://tanstack.com/router/latest/docs/api/router/clientOnlyComponent
- TanStack Query — Query Options: https://tanstack.com/query/latest/docs/framework/react/guides/query-options
- Official example (config reference): https://github.com/TanStack/router/tree/main/examples/react/start-basic
- `@mdx-js/rollup`: https://mdxjs.com/packages/rollup/
- Tailwind v4 — Theme variables: https://tailwindcss.com/docs/theme
- Tailwind v4 — Functions and directives: https://tailwindcss.com/docs/functions-and-directives
- Tailwind v4 upgrade guide: https://tailwindcss.com/docs/upgrade-guide
- shadcn/ui: https://ui.shadcn.com/docs/installation
- React 19 — `forwardRef`: https://react.dev/reference/react/forwardRef

---

## 10. Learning log

> Fill in as you go. This section is the actual deliverable of the exercise — the working site is the side effect.

### Track A — TanStack Start
- File routing vs. `createPages`:
- What `loader` gives you that a GraphQL page query didn't:
- When prerendering surprised me:
- Server-function validation/execution boundaries used by the counter:
- Why local content did not earn a server function:

### Track B — Tailwind v4
- `@theme` vs. `:root`:
- What the JS config was actually doing that CSS now does:
- Which unused SOURCE/starter tokens I intentionally did not port:

### Track C — State management
- Classification table for `articles.index.tsx` (URL state / derived / local):
- Why this project needs neither Zustand nor Jotai:
- Where TanStack Query was earned by the Netlify-backed view counter:
- The `useEffect` I deleted and what replaced it:

### Track D — React 19
- `forwardRef` removals:
- React 18/Gatsby patterns I intentionally did not copy:
- Effects retained for real external synchronization:

### Decisions I'd reverse
-

### Things that took longer than estimated
-
