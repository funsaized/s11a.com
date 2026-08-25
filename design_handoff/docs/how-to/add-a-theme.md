# How to add or modify a theme

*Task-oriented. Assumes you know the system basics.*

## Modify an existing theme
1. Open `styles.css`.
2. Edit values inside `[data-theme="latte"]` or `[data-theme="espresso"]` only. Never restyle components.
3. Keep the roles honest: `--bg` < `--card` in elevation; `--ink` > `--dim` > `--faint` in contrast; `--accent` warm, `--accent2` muted green.
4. Check contrast: `--ink` on `--bg` ≥ 7:1; `--dim` on `--bg` ≥ 4.5:1; `--faint` is for meta text only.
5. Verify the stain: adjust `--stain-filter` if the stain no longer reads (light themes: `opacity(…)` alone; dark themes: add `brightness(…) saturate(…)`).

## Add a third theme (e.g. "decaf")
1. Duplicate a theme block:
```css
[data-theme="decaf"] {
  --bg: …; --card: …; --line: …;
  --ink: …; --dim: …; --faint: …;
  --accent: …; --accent2: …;
  --glow: …; --stain-filter: …;
}
```
2. Fill all ten tokens — a missing token silently inherits latte (the `:root` default) and produces mixed-theme bugs.
3. Extend the toggle: the toggle cycles `data-theme` values and its mini-cup fill color; add your theme to both lists (`toggleLabel`, `cupFill`).
4. Persist it: the stored `brew` value is the theme name; no other change needed.
5. Test every screen in the new theme, plus `::selection` and input placeholders.

## Rules
- No component may reference a hex color; if you need a new color, add a token to **every** theme block.
- Background/text transitions are global (`--ease-theme`); don't add per-component theme transitions.
