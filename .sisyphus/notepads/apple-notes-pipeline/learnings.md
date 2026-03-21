## [2026-03-21] Task T1: Scaffold

- tsconfig uses CommonJS + node moduleResolution (NOT NodeNext) for tsx compatibility
- types.ts defines 5 interfaces: RawNote, ProcessedImage, ProcessedNote, ExportConfig, ExportStats
- ProcessedNote does NOT include featured/author (always false/"Sai Nimmagadda")
- Dependencies installed: turndown, @types/turndown, sharp, @types/sharp, tsx
- npm script: "export-notes": "npx tsx scripts/export-notes/index.ts"
- Used --legacy-peer-deps due to gatsby-plugin-mdx peer dependency conflict with @mdx-js/react
- @types/sharp is deprecated (sharp provides its own types) but installed per spec

## [2026-03-21] Task T3: Tag Extraction + Filter

- Tag regex: /(?:^|\s)#([a-z][a-z0-9-]\*)/gi applied after stripping HTML/code/URLs
- false positive "url#fragment" blocked by (?:^|\s) requiring space/start before #
- #3 rejected (starts with digit, not matching [a-z] after #)
- #fff matches as tag (acceptable per spec - unlikely in real notes)
- getCategory: first tag split('-').map(capitalize).join('-') for kebab → PascalCase
- ARCHIVE_PATTERN = /archive|archived|archives|old|deleted|trash|backup/i
- filterNotes returns { exported: RawNote[]; stats: ExportStats }
- All QA tests pass: tag extraction, filtering, category conversion

## [2026-03-21] Task T2: JXA Bridge

- JXA uses temp file approach (execFileSync + tmpdir) for complex scripts
- Archive detection: regex /archive|archived|archives|old|deleted|trash|backup/i on folder name
- Dates: note.creationDate().toISOString() works in JXA context
- body() returns HTML string; locked notes throw on body() call - caught per-note
- osascript timeout: 120000ms (2 min) for large note collections

## [2026-03-21] Task T5: Image Processor

- extractImages is ASYNC — T8 orchestrator must await it
- HEIC detection: bytes 4-7 = "ftyp", bytes 8-11 = brand (heic/heif/mif1/etc.)
- Image naming: {slug}-{NNN}.jpg with String(idx).padStart(3,'0')
- markdown syntax: ![{slug} {NNN}](/images/articles/{slug}-{NNN}.jpg)
- htmlBody.matchAll collects matches from ORIGINAL html; replace on updatedHtml
- Failed downloads: console.warn and continue (no crash)
- Format detection: magic bytes first (JPEG=FF D8 FF, PNG=89 50 4E 47, WEBP=RIFF+WEBP), then MIME fallback
- sharp converts HEIC→JPEG at quality 85
- writeImages uses mkdirSync recursive + writeFileSync, warns on empty files

## [2026-03-21] Task T4: HTML Preprocessor + MD Converter

- preprocessHtml: strip H1, font tags, style attrs, empty spans, normalize br, convert unicode checkboxes
- TurndownService: headingStyle atx, codeBlockStyle fenced, bulletListMarker "-"
- Custom rules: checkbox (li+input), stripImages (img→""), stripHashtags (p/div content cleanup)
- postProcess: trimEnd each line FIRST (Turndown's `  \n` for <br> breaks blank-line collapse), then collapse 3+ blank lines to 2
- turndown checkbox rule: check innerHTML string for 'checked' (avoid DOM method issues)
- tsconfig needed "DOM" in lib for @types/turndown's HTMLElement references (skipLibCheck alone insufficient)
- stripHashtags filter expanded to ["p", "div"] — Apple Notes uses both for block content

## [2026-03-21] Task T6: Frontmatter Generator

- generateSlug: normalize NFKD, strip diacritics, lowercase, keep [a-z0-9-], max 80 chars
- generateFrontmatter: accepts pre-computed slug (NOT regenerated internally)
- excerpt: first meaningful paragraph ≥20 chars, no headers/images/code, cleaned of markdown
- formatExcerpt: literal block scalar (|-) for excerpts >60 chars
- date: note.modificationDate.slice(0,10) → YYYY-MM-DD
- tags YAML: " - {tag}" (2 spaces + hyphen)
- collision detection: append -2, -3, etc. until unique
- Field order: title, slug, excerpt, date, category, tags, readingTime, featured, author
- title double-quoted, slug/date/category/readingTime/featured/author unquoted
- readingTime: Math.max(1, Math.ceil(wordCount / 200)) + " min read"

## [2026-03-21] Task T7: MDX Writer

- NoteToWrite interface defined in writer.ts (not types.ts) — orchestrator imports from writer.ts
- validateMdx returns { valid, errors, fixed } — caller uses fixed content
- Brace escaping: only outside code blocks and frontmatter
- Category filesystem: note.category.toLowerCase() — "Food" → "food/" directory
- Atomic swap: tmpDir and oldDir are siblings of notesDir under src/content/
- renameSync is atomic on same filesystem (POSIX)
- rmSync(oldDir, { recursive: true, force: true }) cleans up backup

## [2026-03-21] Task T8: CLI Orchestrator

- main() is async — top-level await via main().catch()
- extractImages MUST be awaited (it downloads web images via fetch)
- Order: slug -> extractImages -> htmlToMarkdown -> generateFrontmatter
- writeImages called ONCE for all notes (not per-note)
- atomicWriteNotes fatal error exits with code 1
- NoteToWrite imported from ./writer (not ./types)
- Idempotency: same Apple Notes -> same output (deterministic)

## [2026-03-21] Task T9: Cleanup
- Deleted: exporter/, ExportNotesHtml.workflow/, scripts/notes/
- Removed: notes:sync and notes:cleanup from package.json scripts
- New pipeline verified working after cleanup
