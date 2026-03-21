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
