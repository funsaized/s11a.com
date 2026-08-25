# How to bake a new coffee-stain asset

*Task-oriented. Stains are pre-processed PNGs, not CSS-filtered photos.*

## Why pre-bake
CSS filters over a photo cannot cleanly separate "paper" from "stain" — the paper multiplies through as a yellow wash (we learned this the hard way). Baking gives exact color control and a real alpha channel.

## Steps
1. Start from a photo of a stain on white/near-white paper, roughly square, ≥800px.
2. Run it through this canvas pass (Node, browser, or any image tool that can do the equivalent):

```js
// per pixel:
const lum  = .299*r + .587*g + .114*b;      // luminance
const dark = (255 - lum) / 255;              // 0 = paper, 1 = darkest stain
const alpha = dark <= .045 ? 0               // threshold paper to transparent
            : Math.min(1, Math.pow(dark, .38) * 1.15);  // gamma-lift faint marks
// re-tint to coffee brown, slightly darker where the stain is denser:
out.r = 104 + 40 * (1 - dark);
out.g =  62 + 34 * (1 - dark);
out.b =  28 + 22 * (1 - dark);
out.a = alpha * 255;
```

3. Export as transparent PNG into the assets folder.
4. **Verify pixels, not vibes**: sample a stain pixel — it should be ≈ `rgb(136,88,47)` at 40–65% alpha; the clear center must be fully transparent.
5. Use it with the standard treatment: `filter:var(--stain-filter)`, a radial fade mask, slight rotation, `pointer-events:none`.

## Placement rules
- One stain per page maximum; it decorates, never carries information.
- Always behind content; never under body text at reading size.
