# Tutorial: Build your first Coffee & Code page

*Learning-oriented. In ~20 minutes you'll build a working themed page with the system's signature list — and touch every core mechanic once: tokens, fonts, the dotted rule, and theme switching.*

## What you'll build
A minimal "reading list" page: themed background, a heading, three dot-leader rows, and a working latte/espresso toggle.

## Prerequisites
- A Tailwind v4 project (or any page where you can include `styles.css`)
- `styles.css` from this package

## 1. Wire up the tokens
Include the token sheet and the fonts:

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lora:wght@400..600&family=Source+Serif+4:opsz,wght@8..60,400..600&family=Spline+Sans+Mono:wght@400;500&family=Caveat&display=swap">
<link rel="stylesheet" href="styles.css">
```

Set the theme on the root element:

```html
<html data-theme="latte">
```

Open the page. The background should be porcelain (`#f7f5f1`), not white. If it's white, `styles.css` isn't loading — fix that before continuing. Every color from here on comes from a variable; you will never hard-code a hex.

## 2. Add the page scaffold

```html
<main style="max-width:820px;margin:0 auto;padding:64px 24px">
  <div style="font-family:var(--font-mono);font-size:13px;letter-spacing:.14em;color:var(--accent)">// reading list</div>
  <h1 style="font-family:var(--font-display);font-weight:550;font-size:40px;margin:16px 0 0">Worth a slow sip</h1>
</main>
```

Notice the pattern you'll see everywhere in this system: a mono kicker in `--accent` above a Lora heading. That pairing *is* the voice of the system.

## 3. Build a dot-leader row
The dot-leader row is the system's signature component — a café-menu line connecting a title to its metadata:

```html
<a href="#" style="display:flex;flex-wrap:wrap;align-items:baseline;gap:8px 14px;padding:15px 2px;color:var(--ink)">
  <span style="font-family:var(--font-body);font-size:21px;font-weight:500;color:inherit">The Art of Explaining Hard Things Simply</span>
  <span style="flex:1;min-width:42px;border-bottom:var(--rule-dotted);transform:translateY(-5px)"></span>
  <span style="font-family:var(--font-mono);font-size:13px;color:var(--faint);white-space:nowrap">mar 2026</span>
</a>
```

Three parts: **title** (body serif), **leader** (`flex:1` with the dotted rule), **meta** (mono, faint). Duplicate it twice with different titles. Narrow your browser: the rows wrap instead of squashing — that's the `flex-wrap` + `min-width` doing responsive work with no media query.

## 4. Make the theme switch
Add a button and five lines of JS:

```html
<button onclick="toggleBrew()" style="font-family:var(--font-mono);font-size:12px;color:var(--dim);background:none;border:1px solid var(--line);border-radius:var(--radius-pill);padding:5px 14px;cursor:pointer">espresso</button>
<script>
function toggleBrew() {
  const el = document.documentElement;
  el.dataset.theme = el.dataset.theme === 'latte' ? 'espresso' : 'latte';
  localStorage.setItem('brew', el.dataset.theme);
}
</script>
```

Click it. Everything — background, text, dotted leaders — re-colors, because every style you wrote referenced a variable. That's the whole theming mechanic; there is no second stylesheet.

## 5. Add the load animation
Give the kicker and heading a staggered entrance:

```html
style="…;animation:rise .7s ease both"          <!-- kicker -->
style="…;animation:rise .7s ease .08s both"     <!-- heading -->
```

Reload. The page settles in quietly, top to bottom.

## What you learned
Tokens over hex values · the kicker + display-serif voice · the dot-leader row · `data-theme` switching · the `rise` stagger. You now know enough to read any screen in the prototype and see the same five ideas repeating.

**Next:** [Build the napkin tweet widget](./02-napkin-widget.md).
