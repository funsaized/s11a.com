# Master reference

*Information-oriented. Facts only; see Explanation for reasoning. Authoritative source for values: `styles.css`.*

## 1. Color tokens (by role)

| Token | Role | Latte | Espresso |
|---|---|---|---|
| `--bg` | page background | `#f7f5f1` | `#171008` |
| `--card` | inputs, code blocks, raised surfaces | `#fdfcfa` | `#221812` |
| `--line` | borders, leaders, dividers | `#ddd8cf` | `#3a2a1a` |
| `--ink` | primary text | `#2b2620` | `#f2e7d3` |
| `--dim` | secondary text, deks, descriptions | `#5b554c` | `#c5ad8f` |
| `--faint` | meta text, placeholders, footer | `#8a8378` | `#8f7a5f` |
| `--accent` | links, active nav, kickers, quotes | `#95603c` | `#dfa25b` |
| `--accent2` | sage: strings, quotes, ACTIVE status | `#6f7d60` | `#a3b183` |
| `--glow` | ambient radial washes | `rgba(168,156,140,.16)` | `rgba(224,163,92,.1)` |
| `--stain-filter` | stain image treatment | `opacity(.85)` | `brightness(2.3) saturate(.65) opacity(.45)` |

Selection: `#d9c29b` on `#2b1a0c`. Theme attribute: `data-theme="latte" | "espresso"` on root; latte is the `:root` default.

## 2. Typography

| Token | Face | Use | Notes |
|---|---|---|---|
| `--font-display` | Lora | headings, project names | weight 550 |
| `--font-body` | Source Serif 4 | body, list titles | base 19px / 1.65 |
| `--font-mono` | Spline Sans Mono | kickers, meta, dates, chips, buttons, footer | 400/500 |
| `--font-hand` | Caveat | napkin widget only | — |

**Scale** (px): H1 list pages 42 · H1 detail clamp(34,5vw,48) lh 1.15 · H1 home clamp(28,4vw,40) lh 1.28 · H2 section 32 · H2 prose 26–27 · list title 21–22 (wt 500) · body 19 · desc 16–17 · dek italic 22 · pull quote 26 (Lora) · mono meta 13 · mono label 12 · status tag 11 (uppercase, ls .08em) · kicker 13 (ls .14em).

## 3. Spacing & radii
- Page container: 820px (680px reading pages); side padding `clamp(18px,4vw,24px)`; top `clamp(44px,7vw,72px)`.
- Row padding: 15px (compact lists) / 20–24px (rich lists) vertical.
- Radii: `--radius-pill` 999 · `--radius-input` 10 · `--radius-code` 12 · `--radius-media` 14.
- Rules: `--rule-dotted` = 2px dotted `--line` (content); 1px solid `--line` (chrome/rows).

## 4. Components

### Dot-leader row
Flex, `flex-wrap:wrap`, baseline, gap 8px 14px. Title (body serif, color:inherit) + leader (`flex:1;min-width:42px;border-bottom:var(--rule-dotted);transform:translateY(-5px)`) + meta (mono, `--faint`, nowrap). Row hover: container color → `--accent`.

### Kicker + heading
Mono kicker, lowercase, ls .14em, `--accent` → Lora heading → optional italic dek `--dim`.

### Category chip
Mono 12, padding 6px 14px, radius pill. Active: bg `--accent`, text `--bg`. Inactive: transparent, 1px `--line`, text `--dim`. Single-select.

### Search input
Full-width, 13px 16px padding, bg `--card`, 1px `--line`, radius input, mono 14. Focus: border `--accent`, outline none.

### Status tag
Mono 11 uppercase ls .08em. ACTIVE → `--accent2` · IN PROGRESS → `--accent` · ARCHIVED → `--faint`.

### Cup logo (nav)
21×19 CSS cup: body 14×9 (1.7px `--accent` border, radius 2 2 7 7), handle 4.5px circle, saucer 19×1.7, 3 steam wisps 1.8px wide (`steam` 2.6s, delays 0/.5/1.1s).

### Theme toggle
Pill button (mono 12, `--dim`, 1px `--line`; hover `--accent`). Mini cup 17×14: 2 wisps (`--faint`, 2.2s), outline cup, liquid fill 72% height, background transitions .6s — `#3a2413` ↔ `#c9a87c`. Label = target theme name.

### Napkin tweet widget
310×295 relative box. Stain img: inset 0, cover, rotate -12°, `filter:var(--stain-filter)`, mask `radial-gradient(closest-side,black 62%,rgba(0,0,0,.5) 82%,transparent 98%)`, pointer-events none. Text: inset 62px 58px, rotate -2°, Caveat — label 17 `--faint` / tweet 24 `--ink` / attribution 18 `--accent`.

### Pull quote / philosophy block
Centered Lora 24–26, `--accent` (or `--accent2`), dotted top+bottom borders, padding 26px 20px.

### Code block
`--card` bg, 1px `--line`, radius code, padding 20px 22px, mono 13.5/1.75. Comments `--faint`, muted lines `--dim`, highlighted strings `--accent2`.

### Definition row (About)
Grid `minmax(105px,170px) 1fr`, gap 14, padding 13px 2px, 1px dotted bottom. Key mono 12.5 `--accent`; value `--dim` 17.

## 5. Motion

| Name | Keyframes | Use |
|---|---|---|
| `rise` | 16px translateY + fade, .7s ease | page-entry stagger (delays 0/.08/.16/.2s), `both` fill |
| `steam` | translateY(2→-9px), scaleX(1→1.7), fade in/out | logo & toggle wisps, infinite |
| liquid | background .6s ease | toggle cup on theme change |
| theme | background/color .4s ease | global cross-fade |

Prohibited: scroll-triggered animation, hover transforms, animated list entries.

## 6. Data shapes
```ts
type Article = { title: string; date: string; category: 'writing'|'tools'|'life'|'backend'|'cloud';
  minutes: number; tags: string[]; excerpt: string; body: Markdown };
type Project = { name: string; icon: string /* emoji */; status: 'ACTIVE'|'IN PROGRESS'|'ARCHIVED';
  stars: number; description: string; sourceUrl: string; viewUrl?: string };
```

## 7. Assets
`stain-ring.png` (home widget, 404) · `stain-splat.png` (spare) — transparent, pre-tinted ≈ `rgb(136,88,47)`, alpha 40–65%. Baking recipe: [how-to](../how-to/bake-a-stain-asset.md).

## 8. Screens
Home (intro + napkin widget → journal ×6 → now brewing ×3) · Articles (search + chips + full list) · Article (680px prose) · Projects (12 rows) · About (avatar, prose, definition lists, quote) · 404 (stain + "gone cold"). Full per-screen specs: [../../README.md](../../README.md).
