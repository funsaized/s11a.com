# Tutorial: Build the napkin tweet widget

*Learning-oriented. Builds on the getting-started tutorial; teaches layered decoration: transparent assets, fade masks, and handwriting type.*

## What you'll build
The home-page widget: a coffee-ring stain that fades into the page, with a handwritten tweet in its clear center.

## 1. Place the container

```html
<div style="position:relative;width:310px;height:295px">
</div>
```

The widget is a fixed-size positioning context. In the real home page it sits in a flex row beside the intro (`gap:40px;flex-wrap:wrap`) so it drops below the text on mobile — nothing about the widget itself changes.

## 2. Add the stain

```html
<img src="stain-ring.png" alt="" style="
  position:absolute;inset:0;width:100%;height:100%;object-fit:cover;
  transform:rotate(-12deg);
  filter:var(--stain-filter);
  mask:radial-gradient(closest-side,black 62%,rgba(0,0,0,.5) 82%,transparent 98%);
  pointer-events:none">
```

Three things to notice:
- `stain-ring.png` is **pre-baked**: transparent, already coffee-brown. Never recreate stains with CSS filters on a photo — that's how you get yellow smudges (see the [stain how-to](../how-to/bake-a-stain-asset.md)).
- `--stain-filter` is a theme token: latte just softens opacity; espresso brightens the stain so it reads on dark.
- The radial `mask` makes the stain **fade out** at its edges instead of ending in a rectangle.

## 3. Write on the napkin

```html
<div style="position:absolute;inset:62px 58px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;text-align:center;transform:rotate(-2deg)">
  <div style="font-family:var(--font-hand);font-size:17px;color:var(--faint)">latest tweet ~</div>
  <div style="font-family:var(--font-hand);font-size:24px;line-height:1.2;color:var(--ink)">shipping a little forest that grows every time claude does my chores 🌳</div>
  <a href="https://twitter.com/s11a" style="font-family:var(--font-hand);font-size:18px;color:var(--accent)">— @s11a, 2h ago</a>
</div>
```

The `inset:62px 58px` keeps the text inside the ring's clear center; the tiny `rotate(-2deg)` sells the handwriting. Caveat (`--font-hand`) appears **only** here — handwriting is a garnish, not a text style.

## 4. Check both brews
Toggle the theme. Latte: brown stain on porcelain. Espresso: the stain brightens into a warm ghost. If the stain vanishes on dark, you dropped `filter:var(--stain-filter)`.

## What you learned
Pre-baked assets + theme-aware filters · fade-out masks · fixed-size decorative widgets inside wrapping flex rows · handwriting as a single-purpose accent.
