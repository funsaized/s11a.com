# Outline: Migrating s11a.com from Gatsby to TanStack Start

Planning document for a blog post. Not the published article.

The [migration backlog](https://github.com/funsaized/s11a.com) and git history (`feat/tanstack-start-migration`, cutover `39b5a40`) are the cookbook. This post is the *why*: the tax that made a working blog worth replacing, the method that avoided an in-place rewrite, and the pattern map a reader can steal.

---

## Intent

Write a first-person methodology piece about leaving Gatsby 5 for TanStack Start on a 20-post personal blog.

The reader should leave with a transferable approach, not a framework tour. After the post they should be able to answer:

1. Why leave a Gatsby site that still builds and still ranks.
2. How to migrate without a big-bang rewrite (spike, SOURCE/TARGET coexistence, locked decisions, cutover).
3. Which Gatsby patterns map 1:1 onto Start, and which ones you delete instead of porting.
4. What Start actually buys a small static-ish blog — and what you now own that plugins used to hide.
5. Where the honest cons sit, including the calls that drifted mid-flight.

**This post is not** a Start tutorial, an epic-by-epic recap of the backlog, a Lighthouse bake-off, or a "Gatsby is dead" dunk.

---

## Working title and frontmatter

**Title options** (pick one before drafting):

1. **Why I Left Gatsby: Migrating a Blog to TanStack Start** — searchable, matches the hosting-migration post. Preferred.
2. **GraphQL Was the Tax** — sharper, thesis-led. Undersells the method (coexistence, locked decisions).
3. **Replacing Gatsby Without Rewriting the Blog** — accurate about process, weaker as a headline.

Recommendation: **Why I Left Gatsby: Migrating a Blog to TanStack Start**.

```yaml
title: "Why I Left Gatsby: Migrating a Blog to TanStack Start"
slug: migrating-gatsby-to-tanstack-start
excerpt: >-
  The site wasn't broken. Gatsby 5 was a frozen framework wrapping GraphQL
  around twenty local files. Here's the method I used to leave it, and what
  actually mapped onto TanStack Start.
date: "2026-09-03"
category: Frontend
tags:
  - TanStack
  - Gatsby
  - Vite
  - MDX
  - Migration
readingTime: 10 min read
featured: true
author: Sai Nimmagadda
```

Tone: first person, conversational, problem-first. Same register as the Netlify hosting post and the Tailscale piece: systems thinking, then the setup that fell out of it. Short sentences. One new idea per section. Mapping tables, not command dumps.

Audience: a developer running a Gatsby / Next / Remix personal site who already suspects the data layer is overkill, has maybe tried Vite, and does not need a "hello route" walkthrough. They need a method they can steal and a honest map of equivalents.

Length target: 1,800–2,400 words. Link git history / the cutover commit at the close, not as a tour.

---

## Thesis

The site wasn't broken. Gatsby 5 was a frozen framework — last major November 2022, React 18 / MDX v2 ceiling, five CVE `overrides` — wrapping a GraphQL data layer around ~20 local files. Keeping it working had become an unbounded maintenance tax.

The migration was not an in-place rewrite. It was a planned SOURCE/TARGET coexistence with decisions locked before coding, a throwaway spike so the real app wasn't the learning environment, and a cutover that deleted Gatsby only after Start already rendered every URL.

The win is owning a Vite-native pipeline and putting state where it belongs — loaders for static metadata, `validateSearch` for filters, server functions + Query only for runtime data. It is not "SSG but newer."

The unintuitive move: **do not port the GraphQL layer.** `import.meta.glob` plus a Zod schema replaces `allMdx`. Sorting and filtering are three lines of JS. Everything else Gatsby bought (pages, RSS, sitemap, theme boot) has a smaller, local equivalent.

---

## Section beats

### 1. Open: the site still worked

**Job:** Establish that this is a maintenance story, not an outage story. One concrete image of the tax.

Must cover:

- Gatsby 5, last major Nov 2022. Blog still deployed, still had its URLs, still had its posts.
- The recent non-feature commits were dependency-security patches. Five `overrides`: `cookie`, `immutable`, `lodash`, `path-to-regexp`, `webpack`.
- React pinned at 18 while the rest of the stack wanted 19. `gatsby-plugin-mdx` pinned MDX v2.
- GraphQL over a folder of MDX files. `gatsby-source-filesystem` → `allMdx` → `createPages` in `gatsby-node.js` to turn frontmatter slugs into `/articles/<slug>`.
- Callback to the 2019 [Netlify hosting post](/articles/migrating-my-hosting-to-netlify): this blog has been migrated before, always because the *ops* got worse than the *site*. Same energy.

Skip: npm-download charts as the argument. One line of context is enough ("downloads down from the 2023 peak"). Do not open with "I love trying new frameworks."

Beat: "The problem was not that Gatsby failed. The problem was that keeping it working had no ceiling."

---

### 2. Why leave: two drivers, one project

**Job:** Technical driver first. Learning driver second, and only as a constraint on scope — not as "I wanted to play with Start."

Must cover:

Technical tax, as of August 2026:

| Signal | State |
| --- | --- |
| Last Gatsby major | 5, Nov 2022 |
| React ceiling | 18.x (React was at 19.2) |
| MDX ceiling | plugin pins v2 (MDX was at v3) |
| CVE burden | 5 entries in `overrides` |
| Data layer | GraphQL over ~20 local files |

Learning driver: scoped as a refresher across four tracks, and **only where the site had the matching problem.**

| Track | What it actually exercised here |
| --- | --- |
| A — TanStack Start | file routes, loaders, `head`, prerender, server functions |
| B — Tailwind v4 | CSS-first `@theme`, kill the PostCSS/v3 shim |
| C — State placement | URL-as-state; Query only for runtime server state |
| D — React 19 | drop `React.FC` / `forwardRef` baggage; one earned Suspense boundary |

Explicit non-goals (one short list, then move): no redesign at cutover, no CMS, no full-text search, no forced `use()` / Compiler / optimistic-UI demos, no porting dead SOURCE components (`RecentArticles`, mixed `sampleData.ts`).

Skip: the 12-epic / 35-story backlog as a feature. Mention that a backlog existed and that decisions were locked in it. Do not narrate E0–E11.

---

### 3. Method: don't rewrite in place

**Job:** This is the stealable part. A reader should be able to run the same play on Next → Start, Gatsby → Astro, etc.

Must cover, in this order:

1. **Spike first.** Throwaway app (`scratch/start-spike`). File route, `$param`, `routeTree.gen.ts` is generated, `import.meta.glob` on one MDX file, `prerender.crawlLinks`. The failure mode for the whole project is bootstrapping the real app while still guessing at conventions.
2. **SOURCE stays production.** Gatsby at repo root kept building. TARGET lived in `scratch/s11a.com/` as a fresh Start scaffold. Two `package.json`s, two lockfiles, two Node versions. TARGET's `"type": "module"` cannot break SOURCE's CommonJS `gatsby-node.js`.
3. **Lock decisions before coding.** Framework, Vite 8, MDX via `@mdx-js/rollup` (plugin **before** `viteReact()`), Shiki over Prism, Zod over `scripts/validate-content.ts`, `validateSearch` over nuqs, visual freeze. If a decision is wrong, note it and move — do not relitigate mid-implementation.
4. **Capability only where the site has the problem.** Static article data → loaders, `staleTime: Infinity`. Article bodies → lazy glob + one Suspense boundary. Filters → `validateSearch`. View counter / latest tweet → Query + `createServerFn`. Do not put compiled MDX in loader data. Do not put static content in Query.
5. **Content contract.** 20 MDX files move byte-for-byte. Frontmatter `slug` is the URL, not the filename — `how-to-be-productive-after-work.mdx` still serves `/articles/stop-wasting-time-how-to-be-productive-after-work`. Trailing-slash canonicals and RSS GUIDs stay stable.
6. **Cutover is a delete.** `39b5a40` guts SOURCE and promotes TARGET to repo root. Gatsby remains in git history. No dual-app forever.

Drift paragraph (honest, short — this is method too):

| Locked | Shipped |
| --- | --- |
| Netlify + official Start plugin, no Nitro | Vercel + Nitro (`7463d42`) |
| Netlify Blobs for view counts | Upstash Redis (`KV_REST_API_*`) |
| No test framework | Playwright e2e after cutover |
| Nitro removed from TARGET early, then | Nitro came back with Vercel |

Nitro in/out/in is a one-liner: the host adapter followed the host, not the other way around.

Skip: Netlify.toml archaeology, CSP header dumps, Dependabot, swamp. Skip "I used an agent to write the RSS XML."

Beat: "The Gatsby app was the spec. The Start app was the implementation. Cutover was deleting the spec."

---

### 4. Pattern map (the spine)

**Job:** One table the reader screenshots. Then 4–5 short notes on the mappings that are not obvious. This section is the reason the post exists.

Table:

| Gatsby | TanStack Start |
| --- | --- |
| `gatsby-source-filesystem` + `allMdx` | `import.meta.glob` + Zod in `article-metadata.ts` |
| `gatsby-node` `createPages` | `src/routes/articles/$slug.tsx` + `prerender.crawlLinks` |
| page / static queries | route `loader` + `staleTime: Infinity` |
| `gatsby-plugin-mdx` v2 | `@mdx-js/rollup` + MDX v3 |
| Prism + hand-maintained theme CSS | `rehype-pretty-code` / Shiki (lotus / dragon) |
| `scripts/validate-content.ts` | Zod at glob parse time |
| `HeadFC` / SEO component | route `head` + `seo.ts` |
| `gatsby-ssr` theme anti-flash | `ScriptOnce` in `ThemeProvider` |
| `gatsby-plugin-feed` / sitemap / robots | `rss[.]xml.ts`, `sitemap[.]xml.ts` |
| webpack aliases in `gatsby-node` | `tsconfig` paths + Vite `tsconfigPaths` |
| 4× `useState` on `/articles` | `validateSearch` (`q`, `category`) |
| `Layout.tsx` wrap | `__root.tsx` `shellComponent` |
| `gatsby-plugin-google-gtag` | `analytics.ts` |
| (none — static only) | `createServerFn` + Query for views and tweets |

Notes that need a sentence each, not a subsection:

- **GraphQL bought syntax, not power.** `allMdx(sort: { frontmatter: { date: DESC } })` is `.sort()` in `getArticlesMetadata()`. Filtering articles out of drafts is a glob path, not a GraphQL `filter`.
- **`createPages` vs `crawlLinks`.** Gatsby enumerates slugs at build and calls `createPage`. Start will not auto-discover `$param` routes; you either link every concrete URL from a prerendered page (`crawlLinks: true` — what this blog uses) or list them in `pages`. Dynamic routes are templates. That is the whole trick.
- **Loaders return serializable metadata only.** Frontmatter + TOC, cached forever. The MDX component is a separate lazy glob (`article-modules.ts`) behind one Suspense boundary. Putting a component function in loader data is the footgun.
- **`mdx()` before `viteReact()`.** Vite plugin order is a real constraint. One line. Do not make it a war story.
- **Query is not the content layer.** Views and the latest tweet are asynchronous runtime server state with a mutation/refresh lifecycle. Articles are local, immutable build input. Mixing them is how you accidentally undoes prerender.

Skip: pasting `vite.config.ts`. Skip rehype-mdx-toc ESTree internals beyond "headings become a `toc` export at compile time." Skip shadcn re-init.

---

### 5. What you actually get

**Job:** Benefits as consequences of the method, not a feature list. Three to five, each one paragraph.

Must cover:

- **Dev loop.** `vite dev` vs `gatsby develop`. Cold start and HMR are why you stop dreading local work. Typed `<Link to>` — a broken internal href is a type error, not a 404 after deploy.
- **The `overrides` block goes to zero.** Leaving Gatsby is the security patch. Node 22 → 24, Prettier/ESLint → Oxfmt/Oxlint, Tailwind v4 via `@tailwindcss/vite` instead of a v3-shaped PostCSS shim.
- **SSG with an escape hatch.** Articles still prerender to HTML. View counts and the latest tweet are `createServerFn`s that do not block that prerender. Gatsby would have wanted a plugin or a client-only fetch with no shared type boundary.
- **URL-as-state.** `/articles?q=batch&category=Backend` is shareable because filters live in `validateSearch`, not four `useState` hooks. Pagination and tag chips did not come along — see cons.
- **You own the MDX pipeline.** Frontmatter schema, Shiki themes, TOC depth, fence labels. That is the cost and the benefit.

Skip: React 19 as a selling point. It was compatibility, not a product feature. Skip "Nitro on Vercel" as a benefit — it is hosting, covered in drift / cons.

---

### 6. Pros, cons, and the corners we cut

**Job:** Honest accounting. Do not bury the cons. Do not apologize for them.

Pros (short, already earned in §5 — restate as a punch list, do not re-argue):

- Vite-native content layer instead of GraphQL-over-files
- Typed routes and typed search params
- Prerender kept; server functions available without a second app
- Dependency/CVE surface collapsed
- State lives in the URL or the loader, not ad-hoc React state

Cons / corners:

- **You own the pipeline.** RSS and sitemap are string-built XML. TOC is a custom rehype plugin (`mdast → hast → ESTree`). There is no `gatsby-plugin-*` to absorb a spec change.
- **Start is still moving.** Dependencies on `latest` for Router/Start. Server-route type gaps needed `ts-ignore` so CI and local `tsc` agree. The backlog pinned lockfile versions during migration for a reason; post-cutover drifted.
- **Hosting is no longer "static files on a CDN plus a toml."** Planned Netlify static. Shipped Vercel + Nitro because server functions (views, tweets) wanted a real backend. That is a bigger ops surface than 2019 Netlify. The 2019 post's "pipeline for free" pitch still applies; the compute story does not.
- **Gatsby image pipeline not ported.** Article images stay in `public/images/articles`. No `gatsby-plugin-image`, no sharp transforms at build. Fine at this corpus size; name the ceiling.
- **Visual freeze was a lie at the edges.** `/articles` dropped pagination and tag filters for `q` + category. Dead SOURCE components were not ported. That is YAGNI, not pixel-perfect cutover. Say so.
- **`crawlLinks` is implicit.** A new article must be linked from a prerendered page (the articles index is that page) or it will not exist as HTML. Gatsby's `createPages` made that enumeration obvious. Forget a link, forget a page.

Skip: inventing performance numbers. Performance tracking was explicitly dropped from the backlog.

---

### 7. Close

**Job:** Land the thesis. Point at history. Do not sell Start.

Must cover:

- Cutover commit `39b5a40` — "Gut the Gatsby SOURCE app… Gatsby remains in git history."
- The Gatsby tree is gone from HEAD; `AGENTS.md` says so on purpose. If you want the old `gatsby-config.ts`, it is a checkout away.
- What I would repeat: spike, coexistence, lock decisions, glob+Zod, cutover as delete.
- What I would not repeat: treating the host adapter as a locked decision before the host is chosen; promising pixel-perfect cutover and then simplifying the listing page anyway — just name the listing changes in the backlog.
- Not a framework war. Gatsby was the right blog engine for years (S3 → Netlify → this). It froze. The method for leaving a frozen engine is the post.

Optional last line: the next post on this blog is just an MDX file in `src/content/articles/` with a Zod-valid frontmatter `slug`. That is the whole remaining ceremony.

---

## What not to write

- Epic walkthrough (E0 spike through E11 teardown). The method section already compresses it.
- Full `vite.config.ts`, RSS XML, CSP, `vercel.json`.
- Lighthouse / bundle-analyzer comparison (never the quality gate).
- React Compiler, `use()`, `useActionState`, Zustand, nuqs — they were explicit non-goals.
- Agent-coding asides. The RSS commit message stays in git.
- Redesign / Coffee-and-Code handoff. Separate branch, separate post.

---

## Drafting notes

- Open with the tax, not the stack names.
- Put the mapping table at the midpoint. Readers who bounce still get it.
- One drift paragraph, not a chronology of Nitro.
- Category `Frontend` (stack migration) not `DevOps` (the Vercel move is supporting cast).
- Internal links: `/articles/migrating-my-hosting-to-netlify`. Do not invent a BACKLOG.md link; that file was deleted at cutover.
- If a code sample is needed, one is enough: the eager `import.meta.glob` + Zod parse in `article-metadata.ts`. That is the GraphQL replacement. Everything else is a sentence.
- Reading time ~10 min is a guess; measure after the draft.
