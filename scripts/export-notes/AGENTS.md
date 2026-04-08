# AGENTS.md — Apple Notes Export Pipeline

Standalone TypeScript CLI. Own `tsconfig.json` (CommonJS module). Not part of Gatsby build.

## Run

```bash
npm run export-notes              # Full export
npm run export-notes -- --dry-run  # Preview without writing
npm run export-notes -- --verbose  # Per-note details
```

## Pipeline (sequential)

```
jxa-bridge.ts    → Fetch all notes via osascript JXA
filter.ts        → Exclude #private/#work, map folders → categories
image-processor  → Extract base64/URLs, HEIC→JPEG via sharp
html-processor   → Strip Apple Notes HTML quirks (fonts, styles, empty spans)
md-converter     → Turndown HTML→Markdown (checkboxes, hashtag stripping)
frontmatter.ts   → Generate slug, excerpt, readingTime (ceil(words/200))
writer.ts        → MDX escaping + atomic write (temp dir → swap)
```

## Key Design Decisions

- **Deterministic**: Same notes → identical output every run. No AI/LLM.
- **Crash-safe**: Atomic swap via rename. Rollback on failure.
- **JXA not SQLite**: Apple Notes accessed via `Application("Notes")` COM automation.
- **Native tags inaccessible**: JXA cannot read Apple Notes hashtags — tags extracted from body text `#hashtag` patterns instead.
- **Image limits**: 50MB per image, 30s download timeout, HEIC detected by `ftyp` magic bytes.

## Module Responsibilities

| File                 | Purpose                                                                              |
| -------------------- | ------------------------------------------------------------------------------------ |
| `index.ts`           | Entry point, orchestrates pipeline, CLI args                                         |
| `types.ts`           | `RawNote`, `ProcessedNote`, `ProcessedImage`, `ExportConfig`, `ExportStats`          |
| `jxa-bridge.ts`      | Writes JXA script to temp, executes via `osascript -l JavaScript`                    |
| `filter.ts`          | Folder→category mapping, `#private`/`#work` exclusion, hashtag extraction            |
| `html-processor.ts`  | Strip first `<h1>`, `<font>`, `style` attrs, normalize `<br>`, checkbox Unicode→HTML |
| `md-converter.ts`    | Turndown with custom rules: checkbox, stripImages, stripHashtags                     |
| `image-processor.ts` | Base64/URL extraction, HEIC→JPEG, placeholder tokens, image restoration              |
| `frontmatter.ts`     | Slug generation (NFKD, collision detection), excerpt extraction (first paragraph)    |
| `writer.ts`          | MDX JSX escaping (`{}`→`\{\}`, `<Uppercase>`→`&lt;`), atomic file swap               |

## Folder → Category Mapping

Emoji-stripped, PascalCase with hyphens. Edit `folderToCategory()` in `filter.ts` to change.

## Anti-Patterns

- Do NOT import these modules from the Gatsby app — they run standalone via `npx tsx`
- Do NOT use `sharp` in the main Gatsby build — it's only for this CLI pipeline
- Slug collisions handled by appending `-2`, `-3` — do not change this logic without checking existing note URLs

## Gotchas

- `tsconfig.json` here specifies `module: "CommonJS"` — different from root tsconfig
- Images written to `static/images/articles/` (flat, no subdirs) — shared with article images
- Archived folders filtered by name pattern: archive, archived, old, deleted, trash, backup
