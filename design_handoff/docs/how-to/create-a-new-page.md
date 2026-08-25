# How to create a new page

*Task-oriented: adding a screen (e.g. /uses, /talks) that belongs to the system.*

1. **Scaffold**: `<main>` with `max-width:820px` (680px for long-form reading pages), centered, side padding `clamp(18px,4vw,24px)`, top padding `clamp(44px,7vw,72px)`.
2. **Header pattern**: mono kicker in `--accent` (lowercase, letter-spacing .14em) → H1 in `--font-display` weight 550 (42px list pages / clamp(34px,5vw,48px) detail pages) → optional italic dek in `--dim`.
3. **Lists** use dot-leader rows (see master reference §Components). **Prose** uses `--font-body` 19px/1.65 with Lora H2s at 26–27px.
4. **Dividers** are always `var(--rule-dotted)` — never solid hairlines between content; solid 1px `--line` is reserved for row bottom-borders, nav, and footer.
5. **Nav**: add the page to the nav list; active state = `--accent` text + dotted underline.
6. **Motion**: at most one `rise` stagger on the page header (delays 0/.08/.16s). Lists don't animate.
7. **Decoration**: at most one stain per page, faded with a radial mask, `pointer-events:none`, behind content.
8. **Checklist before shipping**: works in both themes · no hex values · wraps cleanly at 360px wide · footer present · scroll resets on navigation.
