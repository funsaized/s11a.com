# Handoff: Coffee & Code — s11a.dev Blog Redesign

## Overview
A calm, coffee-themed redesign of Sai's personal blog (s11a). Six screens: Home, Articles (with live search + category filter), Article detail, Projects, About, and 404 — all sharing one visual system ("Latte Editorial"): café-menu dot leaders, coffee-stain watermarks, a handwritten-napkin tweet widget, and a latte/espresso dual theme.

## About the Design Files
The files in this bundle are **design references created in HTML** — a working prototype showing intended look and behavior, NOT production code to copy directly. Recreate these designs in the target codebase's existing environment (the production site is **Gatsby + TypeScript + Tailwind CSS + shadcn/ui, hosted on Netlify**) using its established patterns. `styles.css` provides the design tokens in Tailwind-ready form.

## Fidelity
**High-fidelity.** Colors, type, spacing, and interactions are final. Recreate pixel-perfectly.

## Global Chrome

### Nav (all screens)
- Sticky top bar; flex space-between; padding 14px clamp(16px,4vw,44px); bottom border 1px `--line`; background: page bg at ~88% opacity + backdrop-blur(10px); wraps on mobile (gap 10px 14px).
- **Logo**: mono wordmark "s11a" (Spline Sans Mono 500, 17px, letter-spacing .04em) preceded by a 21×19px CSS-drawn coffee cup: cup body (14×9px, 1.7px border `--accent`, radius 2 2 7 7), round handle (4.5px circle), saucer line (19×1.7px), and 3 steam wisps (1.8px wide, heights 5–7px) animating upward (keyframes `steam`, 2.6s ease-out infinite, staggered delays 0/.5s/1.1s). Clicking goes Home.
- **Links**: home / articles / projects / about — Spline Sans Mono 13px, letter-spacing .08em, lowercase. Active: color `--accent` + 2px dotted `--accent` underline; inactive: `--dim`, hover `--accent`. Article detail keeps "articles" active.
- **Theme toggle** (right): pill button (1px `--line` border, radius 999, padding 5px 14px, mono 12px `--dim`; hover: border+text `--accent`). Contains a 17×14px mini cup: 2 steam wisps (`--faint`, 2.2s), cup outline (`--dim`), and a liquid fill (72% height) whose color transitions .6s between `#3a2413` (when current theme is latte → offering espresso) and `#c9a87c` (when espresso → offering latte). Label = target theme name ("espresso"/"latte").

### Footer (all screens)
Border-top 1px `--line`; flex space-between, wraps; mono 12px `--faint`. Left: "© 2026 Sai Nimmagadda — brewed with gatsby + tailwind". Right: "github · linkedin · rss · 404" (404 is an easter-egg link to the 404 page; hover `--accent`).

## Screens

### 1. Home
Content-led, no hero. Max-width 820px, centered, side padding clamp(18px,4vw,24px).
- **Intro row** (flex, gap 40px, wraps): left column (flex:1, min 280px):
  - Kicker: "// morning pour — thoughts on software & life" — mono 13px, letter-spacing .14em, `--accent`.
  - H1 (Lora 550, clamp(28px,4vw,40px), line-height 1.28): "Hi, I'm Sai — a full-stack engineer writing about healthcare tech, AI, and whatever else is brewing."
  - Links row: "view projects ↗" (mono 13 `--dim`, 2px dotted `--line` underline, hover `--accent`) + "github · linkedin · rss" (`--faint`).
- **Napkin/stain tweet widget** (right, 310×295px, no card/border): oversized coffee-ring stain image (stain-ring.png, rotate -12°, radial fade mask: solid 62% → 50% at 82% → transparent 98%) with the latest tweet handwritten in its clear center (inset 62px 58px, rotate -2°): label "latest tweet ~" (Caveat 17px `--faint`), tweet text (Caveat 24px `--ink`), attribution link "— @s11a, 2h ago" (Caveat 18px `--accent`). Wire to latest-tweet data at build time.
- **From the journal**: H2 (Lora 550 32px) + "see all →" (mono 13 `--accent`); sub "guides, references & tutorials — served daily" (mono 13 `--faint`). 6 most-recent article rows — **dot-leader row** (signature component): flex baseline gap 8/14, padding 15px 2px; title (Source Serif 4, 21px, 500); leader = flex:1 2px-dotted `--line` bottom border (translateY -5px, min-width 42px); date (mono 13 `--faint`, e.g. "mar 2026"). Whole row is a link; hover turns title `--accent`. Rows wrap on mobile (date drops under).
- **Now brewing**: same header pattern ("all projects →"); sub "open source, on the counter". Top 3 projects, each: emoji icon + name (Lora 550 20px) + status tag (mono 11 uppercase, letter-spacing .08em; ACTIVE=`--accent2`, IN PROGRESS=`--accent`, ARCHIVED=`--faint`) + dot leader + "★ n"; description below (`--dim` 16px).
- Page-load: staggered fade-up reveal (keyframes `rise`: 16px translateY + fade, .7s ease, delays 0/.08/.16/.2s).

### 2. Articles
Max-width 820px. Kicker "(mostly)" (mono 13 `--accent2`), H1 "Technical Articles" (Lora 550 42px), dek italic `--dim`.
- **Search input**: full-width, padding 13px 16px, bg `--card`, 1px `--line`, radius 10px, mono 14px; placeholder "search the shelf — title, tag, or topic…" (`--faint`); focus: border `--accent`, no outline. Filters live on title/tags/category (case-insensitive substring).
- **Category chips**: all / writing / tools / life / backend / cloud — mono 12px, padding 6px 14px, radius 999. Active: bg `--accent`, text `--bg`; inactive: transparent, 1px `--line`, text `--dim`. Single-select.
- Count line: "showing X of Y articles" (mono 12 `--faint`).
- Article rows: dot-leader row (title 22px) + excerpt (`--dim` 16.5px) + meta line (mono 12 `--faint`: "8 min · writing · documentation, empathy"). Row bottom border 1px `--line`. Click → article detail.
- Empty state: "nothing on the shelf — try another blend." (mono 14 `--faint`, centered, 48px padding).

### 3. Article detail
Max-width 680px. "← back to articles" (mono 13 `--accent`). Meta line (mono 12 `--faint`: "writing · march 31, 2026 · 8 min read"), H1 (Lora 550 clamp(34,5vw,48), lh 1.15), dek (italic 22px `--dim`), 2px-dotted divider. Body: Source Serif 4 19px / 1.65. H2s Lora 550 27px. Elements:
- Hero image slot (full-width, height 340px, radius 14px).
- **Pull quote**: centered, Lora 26px `--accent`, 2px dotted top+bottom borders, padding 26px 20px.
- **Code block**: bg `--card`, 1px `--line`, radius 12px, padding 20px 22px, mono 13.5px / 1.75; comments `--faint`, muted strings `--dim`, highlighted strings `--accent2`.
- Share row: 2px dotted top border; "share — twitter · linkedin · copy link" (mono 13; links `--accent`).

### 4. Projects
Max-width 820px. H1 "Things I've brewed" (Lora 550 42px), dek italic `--dim`. One row per project (12 total, ordering as in prototype): emoji + name (Lora 23px) + status tag + dot leader + "★ n"; description (`--dim` 17px); links "source ↗ · view ↗" (mono 12.5 `--accent`) → GitHub repo / live URL. Bottom border 1px `--line` per row.

### 5. About
Max-width 680px. Circular avatar image slot (140px) centered; H1 "About me" (Lora 550 40px, centered); dek italic centered; dotted divider; 3 intro paragraphs (from prototype). Then two definition-list sections, "Core expertise" and "The desk" (H2 Lora 26px): rows are grid `minmax(105px,170px) 1fr`, gap 14px, padding 13px 2px, 1px dotted bottom border; key = mono 12.5px `--accent`, value = `--dim` 17px. Philosophy quote block (Lora 24px `--accent2`, dotted top/bottom, sub-line mono 12 `--faint`). Centered connect line: "github · linkedin · read my articles".

### 6. 404
Centered, padding clamp(80px,14vw,130px) top. Coffee-ring stain (stain-ring.png, 290px) behind. "404" (Lora 550 clamp(80,14vw,130)); "this page has gone cold." (mono 14 `--faint`); italic paragraph "Maybe it was never brewed. Maybe it drained away. Either way, there's a fresh pot at home."; "← pour a fresh cup" link (mono 14 `--accent`, dotted underline) → Home.

## Interactions & Behavior
- Theme toggle switches `data-theme` on the root; persist choice (localStorage) and respect it on load; all colors via CSS variables; background/color transition .4s ease.
- Navigation scrolls to top on route change.
- Search + chips filter combine (AND). Both live, no debounce needed at this scale.
- Row hovers: title color → `--accent` (inherit trick: row sets color, title uses inherit).
- Page-load stagger (`rise`) on home intro only; keep lists animation-free.
- Steam wisps loop forever (see keyframes in styles.css); cup liquid transitions on theme change.
- Responsive: no media queries needed — fluid clamp() paddings, flex-wrap everywhere, dot-leader rows wrap; include `<meta name="viewport">`.

## State Management
- `theme: 'latte' | 'espresso'` (default latte; persisted).
- Articles page: `query: string`, `category: string` ('all' default).
- Data: articles (title, date, category, minutes, tags, excerpt, body) and projects (name, emoji icon, status, stars, description, sourceUrl, viewUrl) from the Gatsby content layer; stars can be fetched from the GitHub API at build time. Latest tweet fetched/embedded at build time.

## Design Tokens
See `styles.css` (authoritative). Summary:
- **Fonts**: Lora (display, weight ~550), Source Serif 4 (body), Spline Sans Mono (labels/meta/UI), Caveat (napkin handwriting). All on Google Fonts.
- **Base type**: body 19px / 1.65.
- **Latte**: bg #f7f5f1 · card #fdfcfa · line #ddd8cf · ink #2b2620 · dim #5b554c · faint #8a8378 · accent #95603c · accent2 #6f7d60.
- **Espresso**: bg #171008 · card #221812 · line #3a2a1a · ink #f2e7d3 · dim #c5ad8f · faint #8f7a5f · accent #dfa25b · accent2 #a3b183.
- **Radii**: pills 999px; inputs 10px; code blocks 12px; image slots 14px.
- **Signature motifs**: 2px dotted `--line` leaders/dividers; stains at opacity .85 (latte) / brightness(2.3) saturate(.65) opacity(.45) (espresso).
- Selection: bg #d9c29b, text #2b1a0c.

## Assets
- `stain-ring.png` — coffee cup-ring stain, transparent PNG, pre-tinted brown (derived from user-supplied photo). Used on Home widget + 404.
- `stain-splat.png` — coffee splatter, transparent PNG (available, currently unused — good for extra pages).
- Article hero + avatar are content images supplied by the author.
- Project emoji are plain unicode emoji.

## Files
- `prototype-standalone.html` — **the interactive prototype** (all six screens). Self-contained: just double-click to open in a browser, no server needed.
- `Coffee and Code.dc.html`, `support.js`, `image-slot.js` — the prototype's editable source form (requires this design environment; use the standalone file for viewing).
- `styles.css` — Tailwind CSS v4 token sheet (base + latte + espresso, fonts, keyframes).
- `stain-ring.png`, `stain-splat.png` — stain assets.
