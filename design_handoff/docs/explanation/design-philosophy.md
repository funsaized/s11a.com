# Explanation: the methodology behind Coffee & Code

*Understanding-oriented. No instructions here — the reasoning that makes the system coherent.*

## The premise: a calm café, not a dashboard
The system's brief was "calming coffee & code." Every decision follows from one test: **does this feel like reading in a quiet café?** Density, gradients, cards-in-cards, badges and stat clutter all fail that test. The result is a content-first system: almost every screen is typography, dotted lines, and one piece of atmosphere.

## Warmth lives in the accents, not the canvas
Early iterations put coffee tones in the page background — cream, tan, mocha. All of them read as "yellow screen" and tired the eyes. The settled principle: **the canvas is porcelain (near-neutral); the coffee lives in the accents** — clay links, brown stains, caramel highlights in espresso mode. This is why the palette looks restrained in a swatch list but unmistakably "coffee" in situ.

## The dot leader is the system's voice
The café-menu dot leader (title … meta) does three jobs at once: it's an information pattern (title→date scanning), a brand motif (menus), and the system's answer to visual hierarchy without boxes. Wherever a lesser system would draw a card, this one draws a dotted line. Corollary: dotted rules mean *content structure*; solid 1px rules mean *chrome* (nav, footer, row separators).

## Two brews, one structure
Latte and espresso are the same design at different times of day, not two designs. That's enforced mechanically: components may only reference role tokens (`--bg`, `--ink`, `--accent`…), and themes are pure token blocks. Anything that can't be expressed as a token swap (the stains) gets a theme-aware treatment token (`--stain-filter`) rather than a component fork.

## Atmosphere is evidence, not decoration
The stains, the steam, the napkin handwriting — each is a *trace of a person drinking coffee*, not a coffee-themed sticker. This is why stains are photographic (pre-baked from real stains), why they fade out rather than ending in shapes, and why handwriting appears only where a human would plausibly have scribbled (the napkin). The test for new decoration: could this mark have been left on a real desk?

## Motion: one pour, then stillness
Calm interfaces move once and then hold still. The system allows: a single staggered `rise` on page entry, the perpetual (but peripheral) steam wisps, and the toggle's liquid transition. It forbids scroll-triggered effects, hover motion beyond color, and animated lists. Motion answers "did the page respond?", never "look at me."

## Responsive by fluidity, not breakpoints
There are no media queries. Layout resilience comes from `clamp()` paddings and type, `flex-wrap` everywhere, and `min-width` floors on leaders. The philosophy: a design that has to *change* at a breakpoint wasn't calm to begin with; a design that *flows* never breaks.

## Typography as the whole hierarchy
Four faces, four jobs, never mixed: Lora (display — what things are), Source Serif 4 (body — the reading), Spline Sans Mono (meta — dates, labels, UI, the "code" half of the theme), Caveat (the one human touch). Size and face changes do all hierarchy work; there are no weight-900 headlines, no color-coded headings, no boxes.
