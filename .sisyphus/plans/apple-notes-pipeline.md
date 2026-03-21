# Apple Notes → Markdown Pipeline Refactor

## TL;DR

> **Quick Summary**: Replace the existing Python Apple Notes exporter (`exporter/`) with a deterministic TypeScript CLI pipeline that exports notes categorized by Apple Notes `#tags`, excludes `#personal`/`#private`/archived/untagged notes, extracts images robustly, and writes Gatsby-compatible MDX directly to `src/content/notes/`.
>
> **Deliverables**:
>
> - TypeScript CLI pipeline in `scripts/export-notes/` (10 source files)
> - npm script `npm run export-notes` (+ `--dry-run` flag)
> - Full cleanup of old Python exporter, sync scripts, and Automator workflow
> - Updated AGENTS.md and README.md
>
> **Estimated Effort**: Medium
> **Parallel Execution**: YES — 5 waves (max 4 concurrent in Wave 2)
> **Critical Path**: T1 → T4 → T7 → T8 → T9

---

## Context

### Original Request

Replace the existing Python Apple Notes exporter with a TypeScript pipeline that is:

1. **Deterministic** — no AI/LLM calls, same input produces identical output every run
2. **Unified stack** — TypeScript instead of Python
3. **Proper tag filtering** — categorize by `#tags`, exclude `#personal`/`#private`
4. **Archive-aware** — skip archived notes entirely
5. **Performant** — no rate-limited API calls, no unnecessary staging steps

### Interview Summary

**Key Discussions**:

- **Access method**: JXA/AppleScript via `osascript` (same as current, rewritten in TS). Simpler than SQLite+protobuf parsing.
- **Frontmatter**: Fully deterministic. Tags parsed from note body, first `#tag` = category, slug from title, excerpt from first paragraph, reading time from word count. No AI.
- **Tag strategy**: Apple Notes `#tags` only (can add keyword extraction later). Accept sparser tags vs current AI-generated richness.
- **Multi-tag**: First tag encountered = category. All tags in frontmatter array.
- **Excerpt**: First paragraph of body after H1 title (strip markdown). Natural summary without AI.
- **Export mode**: Full export every run. Clean `src/content/notes/` before write.
- **Output**: Direct write to final locations (no staging/sync step). Atomic swap via temp directory.
- **Images**: Keep in `static/images/articles/` (existing convention). Do NOT clean image directory (shared with articles).
- **Untagged notes**: Skip entirely (not blog-worthy).
- **Code location**: `scripts/export-notes/` (consistent with existing `scripts/` pattern).
- **Cleanup**: Full removal of `exporter/`, `ExportNotesHtml.workflow`, `scripts/notes/`, old npm scripts.
- **Tests**: No unit test framework. QA scenarios as primary verification.

**Research Findings**:

- Existing pipeline uses AppleScript/JXA via `osascript` subprocess with parallel batching (50/batch, 4 workers)
- Claude Haiku API for frontmatter is the main nondeterminism source (1.5s rate-limit per note)
- Apple Notes HTML has quirks: `<font>` tag pollution, triple-nested `<span>` for bold, Unicode checklists, base64 inline images
- Tags are plain text `#word` in note body — not structured metadata
- Key TS libs: `turndown` (HTML→MD), `sharp` (HEIC→JPEG), `tsx` (TS script runner, 20ms startup)
- Images named `{slug}-{NNN}.jpg` (zero-padded 3-digit index), referenced as `/images/articles/{name}.jpg` in MDX
- Content uses frontmatter field order: title, slug, excerpt, date, category, tags, readingTime, featured, author
- `getCategoryEmoji()` in `notes.tsx` does `.toLowerCase()` lookup — category casing flexible

### Metis Review

**Identified Gaps** (addressed):

- **Tag richness regression**: Accepted — ship with `#tags` only, enhance later
- **Excerpt quality**: Resolved — first paragraph extraction (best quality without AI)
- **Image cleanup safety**: `static/images/articles/` is NOT cleaned (shared with article images). Only `src/content/notes/` is cleaned.
- **Category casing**: PascalCase ("Food", "Technology") to match existing content
- **Crash safety**: Atomic swap — write to temp dir, rename only on success
- **MDX validation**: Validate each file before writing (check for unescaped `{`/`<`)
- **Tag false positives**: Strict regex `/(?:^|\s)#([a-z][a-z0-9-]*)/g` — avoids hex colors, URL fragments, code
- **Duplicate slugs**: Track in Set, append `-2`/`-3` suffix on collision
- **Error handling**: Skip failed notes with logged warning, continue export

---

## Work Objectives

### Core Objective

Build a deterministic TypeScript CLI that exports Apple Notes to Gatsby-compatible MDX, categorized by `#tags`, with robust image extraction and zero AI dependencies.

### Concrete Deliverables

- `scripts/export-notes/index.ts` — CLI entry point with `--dry-run` and `--verbose` flags
- `scripts/export-notes/jxa-bridge.ts` — Apple Notes access via JXA/osascript
- `scripts/export-notes/filter.ts` — Tag extraction + note filtering (archive, private, untagged)
- `scripts/export-notes/html-processor.ts` — Apple Notes HTML preprocessing
- `scripts/export-notes/md-converter.ts` — Turndown with custom Apple Notes rules
- `scripts/export-notes/image-processor.ts` — Base64 extraction + HEIC→JPEG conversion
- `scripts/export-notes/frontmatter.ts` — Deterministic frontmatter generation
- `scripts/export-notes/writer.ts` — MDX validation + atomic directory swap
- `scripts/export-notes/types.ts` — Shared TypeScript interfaces
- `scripts/export-notes/tsconfig.json` — TypeScript configuration
- npm script: `"export-notes": "npx tsx scripts/export-notes/index.ts"`
- MDX output in `src/content/notes/{category}/`
- Images in `static/images/articles/{slug}-{NNN}.jpg`

### Definition of Done

- [ ] `npx tsx scripts/export-notes/index.ts` exports notes successfully
- [ ] `npx tsx scripts/export-notes/index.ts --dry-run` prints stats without writing
- [ ] `npm run build` succeeds with exported notes (Gatsby builds cleanly)
- [ ] `npx tsc --noEmit -p scripts/export-notes/tsconfig.json` passes with zero errors
- [ ] Running export twice produces identical output (deterministic)
- [ ] No `#personal` or `#private` tagged notes in output
- [ ] No archived notes in output
- [ ] No untagged notes in output
- [ ] Old `exporter/` directory fully removed
- [ ] Old `scripts/notes/` sync scripts fully removed
- [ ] Old `ExportNotesHtml.workflow` fully removed

### Must Have

- Deterministic output — same notes produce byte-identical MDX every run
- Tag-based categorization — first `#tag` = category folder + frontmatter category
- Exclusion filters — `#personal`, `#private`, archived, untagged
- Image extraction — base64 data URLs + web URL images + HEIC→JPEG conversion
- Atomic write — crash during export never leaves `src/content/notes/` empty
- MDX validation — every file checked for syntax before writing
- Dry-run mode — preview what would be exported without writing
- Frontmatter field order: title, slug, excerpt, date, category, tags, readingTime, featured, author

### Must NOT Have (Guardrails)

- **NO AI/LLM API calls** — the entire point is deterministic output. Zero Anthropic/OpenAI dependencies.
- **NO changes to Gatsby UI code** — do not touch `gatsby-node.js`, `src/templates/note.tsx`, `src/pages/notes.tsx`, `src/pages/index.tsx`
- **NO unit test framework setup** — QA scenarios are the verification method
- **NO SQLite database access** — use JXA/AppleScript only
- **NO staged output + sync step** — write directly to final locations via atomic swap
- **NO cleaning of `static/images/articles/`** — shared with article images, only clean `src/content/notes/`
- **NO processing of Apple Notes drawings/sketches** — binary data, not extractable via JXA
- **NO processing of password-protected notes** — JXA fails silently, log and skip
- **NO over-abstraction** — this is a CLI script, not a framework. No plugin system, no config files, no extensibility hooks
- **NO excessive error handling** — skip failed notes with warning, don't wrap every line in try/catch
- **NO unnecessary dependencies** — `turndown`, `sharp`, `tsx`, `@types/*` only. No lodash, no moment, no kitchen-sink utilities

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision

- **Infrastructure exists**: NO
- **Automated tests**: NO
- **Framework**: None
- **Agent-Executed QA**: ALWAYS (mandatory for all tasks)

### QA Policy

Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **CLI pipeline**: Use Bash — run commands, check exit codes, validate output files
- **File output**: Use Bash — `ls`, `head`, `grep`, `diff`, `file` commands to verify content
- **Gatsby build**: Use Bash — `npm run build` to verify integration (Gatsby build is the real gate)

### QA Gate Scoping (CRITICAL)

The existing codebase has pre-existing typecheck and lint failures in files OUTSIDE our scope (`src/pages/notes.tsx`, `src/pages/articles.tsx`, `src/templates/note.tsx`, `src/components/article/SharingComponent.tsx`). These are NOT caused by our changes and are NOT in scope to fix.

**All pre-commit and task QA gates MUST be scoped to new pipeline files only:**

- **Typecheck**: `npx tsc --noEmit -p scripts/export-notes/tsconfig.json` (NOT `npm run typecheck`)
- **Lint**: `npx eslint scripts/export-notes/` (NOT `npm run lint`)
- **Build**: `npm run build` remains the integration gate (Gatsby build succeeds despite pre-existing TS errors)

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation — scaffold):
└── T1: Project scaffold + types + dependencies [quick]

Wave 2 (Core modules — 4 PARALLEL):
├── T2: JXA bridge (Apple Notes access via osascript) [deep]
├── T3: Tag extraction + note filtering [quick]
├── T4: HTML preprocessor + Turndown MD converter [unspecified-high]
└── T5: Image extractor + HEIC conversion [unspecified-high]

Wave 3 (Assembly — sequential):
├── T6: Deterministic frontmatter generator (depends: T3) [quick]
└── T7: MDX writer + validator + atomic swap (depends: T4, T5, T6) [deep]

Wave 4 (Integration + Cleanup — sequential):
├── T8: CLI entry point + end-to-end wiring (depends: T2, T3, T7) [deep]
├── T9: Delete old Python pipeline + scripts (depends: T8) [quick]
└── T10: Update AGENTS.md + README.md (depends: T9) [writing]

Wave FINAL (4 PARALLEL reviews → user approval):
├── F1: Plan compliance audit [oracle]
├── F2: Code quality review [unspecified-high]
├── F3: Real manual QA — run full pipeline [unspecified-high]
└── F4: Scope fidelity check [deep]
→ Present results → Get explicit user okay

Critical Path: T1 → T4 → T7 → T8 → T9 → T10 → F1-F4 → user okay
Parallel Speedup: ~40% faster than sequential (Wave 2 is 4x parallel)
Max Concurrent: 4 (Wave 2)
```

### Dependency Matrix

| Task  | Depends On | Blocks         | Wave  |
| ----- | ---------- | -------------- | ----- |
| T1    | —          | T2, T3, T4, T5 | 1     |
| T2    | T1         | T8             | 2     |
| T3    | T1         | T6, T8         | 2     |
| T4    | T1         | T7             | 2     |
| T5    | T1         | T7             | 2     |
| T6    | T3         | T7             | 3     |
| T7    | T4, T5, T6 | T8             | 3     |
| T8    | T2, T3, T7 | T9             | 4     |
| T9    | T8         | T10            | 4     |
| T10   | T9         | F1-F4          | 4     |
| F1-F4 | T10        | —              | FINAL |

### Agent Dispatch Summary

- **Wave 1**: **1** — T1 → `quick`
- **Wave 2**: **4** — T2 → `deep`, T3 → `quick`, T4 → `unspecified-high`, T5 → `unspecified-high`
- **Wave 3**: **2** — T6 → `quick`, T7 → `deep`
- **Wave 4**: **3** — T8 → `deep`, T9 → `quick`, T10 → `writing`
- **FINAL**: **4** — F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high`, F4 → `deep`

---

## TODOs

- [x] 1. Project Scaffold + Types + Dependencies

  **What to do**:
  - Create `scripts/export-notes/` directory
  - Create `scripts/export-notes/tsconfig.json` — extend root tsconfig, target ES2022, module NodeNext, include only `scripts/export-notes/**/*.ts`
  - Create `scripts/export-notes/types.ts` with all shared interfaces:
    - `RawNote` — `{ id: string; title: string; body: string; creationDate: string; modificationDate: string; folder: string }`
    - `ProcessedNote` — `{ title: string; slug: string; category: string; tags: string[]; date: string; excerpt: string; readingTime: string; markdown: string; images: ProcessedImage[] }`
    - `ProcessedImage` — `{ filename: string; data: Buffer; format: 'jpeg' | 'png' | 'webp' }`
    - `ExportConfig` — `{ notesDir: string; imageDir: string; excludeTags: string[]; author: string; dryRun: boolean; verbose: boolean }`
    - `ExportStats` — `{ total: number; archived: number; private: number; untagged: number; exported: number; images: number; errors: string[] }`
  - Install dev dependencies: `npm install --save-dev turndown @types/turndown sharp @types/sharp tsx`
  - Add npm script to `package.json`: `"export-notes": "npx tsx scripts/export-notes/index.ts"`
  - Create minimal `scripts/export-notes/index.ts` stub that prints "not yet implemented" (placeholder for T8)

  **Must NOT do**:
  - Do NOT add lodash, moment, or other utility libraries
  - Do NOT create config files or `.env` requirements — all config is hardcoded or CLI args
  - Do NOT modify root `tsconfig.json`

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple file creation and dependency installation
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (foundation — must complete first)
  - **Parallel Group**: Wave 1 (solo)
  - **Blocks**: T2, T3, T4, T5
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `exporter/src/main.py:1-30` — Existing import structure and module organization pattern
  - `tsconfig.json` — Root TypeScript config to reference (not modify)

  **API/Type References**:
  - `src/content/notes/food/viral-cajun-salmon-burrito.mdx:1-17` — Canonical frontmatter schema that types must match
  - `src/templates/note.tsx:193-205` — GraphQL query showing which frontmatter fields Gatsby consumes (title, excerpt, date, category, tags, author)

  **External References**:
  - turndown: https://github.com/mixmark-io/turndown — HTML→Markdown converter
  - sharp: https://sharp.pixelplumbing.com/ — Image processing (HEIC→JPEG)
  - tsx: https://github.com/privatenumber/tsx — TypeScript execution (20ms startup)

  **WHY Each Reference Matters**:
  - The `viral-cajun-salmon-burrito.mdx` frontmatter is the golden template — types MUST match this exactly
  - `note.tsx` GraphQL query shows which fields are actually consumed at build time
  - Root `tsconfig.json` for understanding current TS config (but do NOT modify it)

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Scaffold directory and files exist
    Tool: Bash
    Preconditions: None
    Steps:
      1. Run: ls scripts/export-notes/
      2. Assert output contains: index.ts, types.ts, tsconfig.json
      3. Run: npx tsc --noEmit -p scripts/export-notes/tsconfig.json
      4. Assert exit code 0
    Expected Result: All files exist, scoped typecheck passes
    Failure Indicators: Missing files, typecheck errors
    Evidence: .sisyphus/evidence/task-1-scaffold-exists.txt

  Scenario: Dependencies installed correctly
    Tool: Bash
    Preconditions: npm install completed
    Steps:
      1. Run: node -e "require('turndown'); require('sharp'); console.log('deps ok')"
      2. Assert output: "deps ok"
      3. Run: grep '"export-notes"' package.json
      4. Assert output contains: "npx tsx scripts/export-notes/index.ts"
    Expected Result: All deps resolve, npm script exists
    Failure Indicators: Module not found errors
    Evidence: .sisyphus/evidence/task-1-deps-installed.txt

  Scenario: Stub entry point runs
    Tool: Bash
    Preconditions: Dependencies installed
    Steps:
      1. Run: npx tsx scripts/export-notes/index.ts
      2. Assert output contains "not yet implemented" or similar placeholder
      3. Assert exit code 0
    Expected Result: Script runs without crash
    Failure Indicators: Runtime error, non-zero exit
    Evidence: .sisyphus/evidence/task-1-stub-runs.txt
  ```

  **Commit**: YES
  - Message: `feat(export-notes): scaffold project structure and dependencies`
  - Files: `scripts/export-notes/tsconfig.json`, `scripts/export-notes/types.ts`, `scripts/export-notes/index.ts`, `package.json`, `package-lock.json`
  - Pre-commit: `npx tsc --noEmit -p scripts/export-notes/tsconfig.json`

- [x] 2. JXA Bridge — Apple Notes Access via osascript

  **What to do**:
  - Create `scripts/export-notes/jxa-bridge.ts`
  - Write a JXA (JavaScript for Automation) script as a TypeScript template literal string that:
    - Accesses `Application("Notes")`
    - Iterates all accounts → folders → notes
    - For each note extracts: `name()`, `body()` (HTML), `creationDate()`, `modificationDate()`, `id()`, folder name
    - Skips folders matching archive pattern (case-insensitive): `archive`, `archived`, `old`, `deleted`, `trash`, `backup`
    - Skips password-protected/locked notes (JXA fails silently — catch and log)
    - Returns JSON array of `RawNote` objects
  - Execute JXA via `child_process.execFileSync("osascript", ["-l", "JavaScript", tmpFilePath])` using a temp file approach (complex script, not inline `-e`)
  - Write JXA script to temp file, execute, parse JSON output, clean up temp file
  - Export function: `fetchAllNotes(): RawNote[]`
  - Handle errors: osascript failure (Notes.app not running, permission denied), JSON parse errors
  - Log progress: "Fetching notes from Apple Notes..." and "Found N notes across M folders"

  **Must NOT do**:
  - Do NOT use SQLite or direct database access
  - Do NOT use the `@parser-libs/apple-notes-jxa` npm package — write the JXA script directly for full control
  - Do NOT implement parallel batching in the JXA script — one shot fetch is simpler and sufficient
  - Do NOT process or filter note content here — return raw data for filter.ts to handle

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: JXA/osascript is tricky — needs careful error handling, temp file management, and proper JSON serialization from JXA context
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with T3, T4, T5)
  - **Blocks**: T8
  - **Blocked By**: T1

  **References**:

  **Pattern References**:
  - `exporter/src/applescript_bridge.py:58-82` — Existing `_run_applescript()` method showing osascript subprocess execution pattern
  - `exporter/src/applescript_bridge.py:164-234` — Existing batch note fetching logic (reference for WHAT to fetch, not HOW — we simplify to single fetch)
  - `exporter/src/applescript_bridge.py:236-280` — Archive folder detection patterns (line 242: folder name matching)
  - `exporter/src/applescript_bridge.py:380-420` — Note data extraction (name, body, dates, folder, id)

  **API/Type References**:
  - `scripts/export-notes/types.ts:RawNote` — Return type for fetched notes (from T1)

  **External References**:
  - JXA Notes API: `Application("Notes")` — `.accounts[i].folders[j].notes[k].name()`, `.body()`, `.creationDate()`, `.modificationDate()`, `.id()`
  - osascript execution: `osascript -l JavaScript <file.js>` — executes JXA from file

  **WHY Each Reference Matters**:
  - `applescript_bridge.py` is the authoritative reference for what data to extract and which folders to skip — port the logic, not the batching complexity
  - The archive folder patterns on line 242 must be replicated exactly to maintain behavioral parity
  - `RawNote` type from T1 ensures the bridge output is correctly typed

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: JXA bridge fetches notes from Apple Notes
    Tool: Bash
    Preconditions: Apple Notes.app has at least 1 note; terminal has Full Disk Access (or Automation permission)
    Steps:
      1. Create a temporary test script that imports and calls fetchAllNotes()
      2. Run: npx tsx -e "import { fetchAllNotes } from './scripts/export-notes/jxa-bridge'; const notes = fetchAllNotes(); console.log(JSON.stringify({ count: notes.length, sample: notes[0]?.title }))"
      3. Assert: count > 0
      4. Assert: sample is a non-empty string
      5. Assert: each note has id, title, body, creationDate, modificationDate, folder fields
    Expected Result: Notes fetched with all required fields populated
    Failure Indicators: osascript error, empty array, missing fields
    Evidence: .sisyphus/evidence/task-2-jxa-fetch.txt

  Scenario: Archive folders are excluded
    Tool: Bash
    Preconditions: Know which folders exist in Apple Notes (some may be archive)
    Steps:
      1. Run fetchAllNotes() and collect all unique folder names
      2. Run: npx tsx -e "import { fetchAllNotes } from './scripts/export-notes/jxa-bridge'; const notes = fetchAllNotes(); const folders = [...new Set(notes.map(n => n.folder))]; console.log(JSON.stringify(folders))"
      3. Assert: no folder name matches /archive|archived|old|deleted|trash|backup/i
    Expected Result: Zero archived folder notes in output
    Failure Indicators: Archive folder names present in output
    Evidence: .sisyphus/evidence/task-2-no-archive.txt

  Scenario: Error handling on Notes.app unavailable
    Tool: Bash
    Preconditions: jxa-bridge.ts exports fetchAllNotes
    Steps:
      1. Run: npx tsx -e "
         import { execFileSync } from 'child_process';
         // Test that osascript with invalid JXA produces a caught, descriptive error
         try {
           execFileSync('osascript', ['-l', 'JavaScript', '-e', 'Application(\"NonExistentApp\").notes()']);
         } catch (e: any) {
           const msg = e.stderr?.toString() || e.message;
           console.log('ERROR_CAUGHT: ' + (msg.length > 0 ? 'yes' : 'no'));
         }
         "
      2. Assert output contains: "ERROR_CAUGHT: yes"
      3. Run: npx tsx -e "
         import { fetchAllNotes } from './scripts/export-notes/jxa-bridge';
         // If Notes.app is running, this should succeed — validate it doesn't silently fail
         try { const notes = fetchAllNotes(); console.log('OK: ' + notes.length + ' notes'); }
         catch (e: any) { console.log('ERROR: ' + e.message); }
         "
      4. Assert output starts with "OK:" or "ERROR:" (never silent)
    Expected Result: Errors are caught and reported with descriptive messages, never silent
    Failure Indicators: No output (silent failure), unhandled exception crash
    Evidence: .sisyphus/evidence/task-2-error-handling.txt
  ```

  **Commit**: YES
  - Message: `feat(export-notes): add JXA bridge for Apple Notes access`
  - Files: `scripts/export-notes/jxa-bridge.ts`
  - Pre-commit: `npx tsc --noEmit -p scripts/export-notes/tsconfig.json`

- [x] 3. Tag Extraction + Note Filtering

  **What to do**:
  - Create `scripts/export-notes/filter.ts`
  - Implement `extractTags(htmlBody: string): string[]`:
    - Strip HTML tags to get plain text (simple regex or small DOM parser)
    - Strip code blocks (content between ` ``` ` markers) before tag extraction
    - Strip URLs (http/https) before tag extraction
    - Apply regex: `/(?:^|\s)#([a-z][a-z0-9-]*)/gi` — case-insensitive match, normalize to lowercase
    - Return unique tags array (deduplicated), preserving order of first occurrence
    - Must NOT match: hex colors (`#fff`), numbers-only (`#3`), URL fragments (`#section`)
  - Implement `filterNotes(notes: RawNote[], config: ExportConfig): { exported: RawNote[]; stats: ExportStats }`:
    - For each note, run `extractTags()` on its body
    - Skip if ANY tag matches `config.excludeTags` (default: `['personal', 'private']`)
    - Skip if note has zero extracted tags (untagged)
    - Skip if note's folder matches archive pattern `/archive|archived|old|deleted|trash|backup/i` (redundant safety — JXA bridge also filters, but defense in depth)
    - Return filtered notes array + stats object with counts: `{ total, archived, private, untagged, exported }`
  - Implement `getCategory(tags: string[]): string`:
    - Take first tag, convert to PascalCase: `"food"` → `"Food"`, `"tech"` → `"Tech"`, `"health-fitness"` → `"Health-Fitness"`
    - Return as the category string

  **Must NOT do**:
  - Do NOT use a full HTML parser (cheerio/jsdom) — simple regex stripping is sufficient for tag extraction
  - Do NOT implement any AI/ML-based tag extraction
  - Do NOT modify note content here — filtering only, content transformation is T4/T6

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Pure functions with clear regex logic, no external dependencies
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with T2, T4, T5)
  - **Blocks**: T6, T8
  - **Blocked By**: T1

  **References**:

  **Pattern References**:
  - `exporter/src/applescript_bridge.py:390-395` — Existing `#private` tag detection (`"private" in hashtags` on line 392)
  - `exporter/src/applescript_bridge.py:236-280` — Archive folder name matching patterns
  - `exporter/src/mdx_converter.py:180-210` — Existing tag extraction from HTML content (how tags are currently parsed)
  - `exporter/src/frontmatter_generator.py:75-90` — How categories are currently determined (AI-based — we replace with first-tag logic)

  **API/Type References**:
  - `scripts/export-notes/types.ts:RawNote` — Input type
  - `scripts/export-notes/types.ts:ExportConfig` — Config with `excludeTags` array
  - `scripts/export-notes/types.ts:ExportStats` — Return stats type

  **External References**:
  - None needed — pure TypeScript, no external deps

  **WHY Each Reference Matters**:
  - `applescript_bridge.py:305` shows how `#private` is currently detected — our regex must catch the same cases
  - `mdx_converter.py:180-210` shows current tag parsing — understand what patterns exist in real notes to ensure regex handles them
  - The archive folder list in `applescript_bridge.py:242` is the canonical list to replicate

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Tag extraction from Apple Notes HTML
    Tool: Bash
    Preconditions: filter.ts exists with extractTags function
    Steps:
      1. Run: npx tsx -e "
         import { extractTags } from './scripts/export-notes/filter';
         // Test basic tags
         console.log(JSON.stringify(extractTags('<div>My #food recipe with #cooking tips</div>')));
         // Test deduplication
         console.log(JSON.stringify(extractTags('<div>#food is great #food</div>')));
         // Test false positives rejected
         console.log(JSON.stringify(extractTags('<div>Color #fff and issue #3 and url#fragment</div>')));
         // Test code block stripping
         console.log(JSON.stringify(extractTags('<div>text \`\`\`code #notAtag\`\`\` more #real</div>')));
         "
      2. Assert line 1: ["food", "cooking"]
      3. Assert line 2: ["food"] (deduplicated)
      4. Assert line 3: [] (all false positives rejected)
      5. Assert line 4: ["real"] (code block tag excluded)
    Expected Result: Tags extracted correctly, false positives rejected
    Failure Indicators: Wrong tags, false positives included
    Evidence: .sisyphus/evidence/task-3-tag-extraction.txt

  Scenario: Note filtering excludes private/personal/untagged
    Tool: Bash
    Preconditions: filter.ts exists with filterNotes function
    Steps:
      1. Create test notes: one with #food, one with #personal, one with #private, one with no tags, one in "Archive" folder
      2. Run filterNotes() with default config
      3. Assert: only the #food note is in exported array
      4. Assert stats: { total: 5, archived: 1, private: 2, untagged: 1, exported: 1 }
    Expected Result: Only valid tagged notes pass filter
    Failure Indicators: Excluded notes in output, wrong stats counts
    Evidence: .sisyphus/evidence/task-3-filter-exclusion.txt

  Scenario: Category generation from first tag
    Tool: Bash
    Preconditions: filter.ts exists with getCategory function
    Steps:
      1. Run: npx tsx -e "
         import { getCategory } from './scripts/export-notes/filter';
         console.log(getCategory(['food', 'cooking']));
         console.log(getCategory(['tech']));
         console.log(getCategory(['health-fitness', 'exercise']));
         "
      2. Assert line 1: "Food"
      3. Assert line 2: "Tech"
      4. Assert line 3: "Health-Fitness"
    Expected Result: PascalCase category from first tag
    Failure Indicators: Wrong casing, wrong tag selected
    Evidence: .sisyphus/evidence/task-3-category.txt
  ```

  **Commit**: YES
  - Message: `feat(export-notes): add tag extraction and note filtering`
  - Files: `scripts/export-notes/filter.ts`
  - Pre-commit: `npx tsc --noEmit -p scripts/export-notes/tsconfig.json`

- [x] 4. HTML Preprocessor + Turndown Markdown Converter

  **What to do**:
  - Create `scripts/export-notes/html-processor.ts`
  - Implement `preprocessHtml(html: string): string`:
    - Strip `<font>` tags (keep inner content): `<font color="#000000">text</font>` → `text`
    - Remove all `style` attributes from any tag
    - Unwrap empty/whitespace-only `<span>` tags (Apple Notes nests spans deeply for bold/italic)
    - Normalize `<br>` variants (`<br>`, `<br/>`, `<br />`) to newlines
    - Convert Apple Notes checklists: `<ul class="...">\n<li>☐ item</li>` and `<input type="checkbox">` patterns → standard HTML checkboxes that turndown can handle
    - Convert Unicode checkbox characters: `☐`, `☑`, `✓`, `✗` to `<input type="checkbox">` / `<input type="checkbox" checked>` equivalents
    - Strip the H1 title element (first `<h1>` or equivalent) — `note.tsx:141` already renders `frontmatter.title` as H1, so duplicate must be removed
    - Preserve `<img>` tags intact (image processing handled by T5)
    - Preserve `<table>` structures (turndown handles these)
    - Preserve `<a>` links
  - Create `scripts/export-notes/md-converter.ts`
  - Implement `convertToMarkdown(cleanHtml: string): string`:
    - Initialize `turndown` with options: `headingStyle: 'atx'`, `codeBlockStyle: 'fenced'`, `bulletListMarker: '-'`
    - Add custom turndown rule for checkboxes: `- [ ]` / `- [x]`
    - Do NOT add any `<img>` handling rule — image extraction and markdown replacement is handled entirely by T5 (image-processor.ts) BEFORE this converter runs. By the time `htmlToMarkdown()` is called, all `<img>` tags have already been replaced with markdown `![alt](path)` syntax in the HTML. Any remaining `<img>` tags (decorative, broken) should be stripped.
    - Add custom rule to strip `#tag` text from output (tags are in frontmatter, not body)
    - Clean up excessive blank lines (3+ consecutive → 2)
    - Trim trailing whitespace per line
    - Return clean markdown string
  - Export combined function: `htmlToMarkdown(rawHtml: string): string` that calls `preprocessHtml` then `convertToMarkdown`

  **Must NOT do**:
  - Do NOT use cheerio or jsdom for preprocessing — regex-based transformations are sufficient and avoid heavy dependencies
  - Do NOT handle image extraction here — that's T5. Just preserve `<img>` tags for the image processor
  - Do NOT generate frontmatter here — that's T6

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Complex HTML transformation logic with many edge cases in Apple Notes format
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with T2, T3, T5)
  - **Blocks**: T7
  - **Blocked By**: T1

  **References**:

  **Pattern References**:
  - `exporter/src/mdx_converter.py:50-120` — Existing HTML preprocessing (font stripping, style removal, span unwrapping)
  - `exporter/src/mdx_converter.py:130-180` — Checklist conversion patterns (Unicode chars → markdown checkboxes)
  - `exporter/src/mdx_converter.py:200-250` — HTML→Markdown conversion with markdownify (equivalent to our turndown usage)
  - `exporter/src/mdx_converter.py:260-300` — Post-processing cleanup (excessive blank lines, whitespace normalization)

  **API/Type References**:
  - turndown API: `new TurndownService(options)`, `.addRule(name, { filter, replacement })`, `.turndown(html)`

  **Test References**:
  - `src/content/notes/food/viral-cajun-salmon-burrito.mdx` — Example of expected markdown output format (what our converter should produce)
  - `src/content/notes/technology/apple-notes-productivity-system.mdx` — Example with code blocks and links

  **External References**:
  - turndown custom rules: https://github.com/mixmark-io/turndown#extending-with-rules

  **WHY Each Reference Matters**:
  - `mdx_converter.py:50-120` is the definitive list of Apple Notes HTML quirks that need preprocessing — port ALL of these transformations
  - `mdx_converter.py:130-180` shows the exact Unicode characters used in Apple Notes checklists — must handle all variants
  - Existing MDX files show the expected OUTPUT format — converter must produce equivalent markdown

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Apple Notes HTML converts to clean Markdown
    Tool: Bash
    Preconditions: html-processor.ts and md-converter.ts exist
    Steps:
      1. Run: npx tsx -e "
         import { htmlToMarkdown } from './scripts/export-notes/md-converter';
         const html = '<h1>Title</h1><div><font color=\"#000\">Hello <b>world</b></font></div><div>#food recipe</div>';
         console.log(htmlToMarkdown(html));
         "
      2. Assert: output does NOT contain '<font>', '<h1>Title</h1>', or '#food'
      3. Assert: output contains '**world**' (bold preserved)
      4. Assert: output does NOT start with '# Title' (H1 stripped)
    Expected Result: Clean markdown without HTML artifacts, Apple Notes cruft, or tag text
    Failure Indicators: HTML tags in output, font tags, duplicate title, tag text present
    Evidence: .sisyphus/evidence/task-4-html-to-md.txt

  Scenario: Checklist conversion
    Tool: Bash
    Preconditions: html-processor.ts exists
    Steps:
      1. Run: npx tsx -e "
         import { htmlToMarkdown } from './scripts/export-notes/md-converter';
         const html = '<ul><li>☐ Not done</li><li>☑ Done</li><li>✓ Also done</li></ul>';
         console.log(htmlToMarkdown(html));
         "
      2. Assert output contains: '- [ ] Not done'
      3. Assert output contains: '- [x] Done'
      4. Assert output contains: '- [x] Also done'
    Expected Result: Unicode checkboxes → Markdown task list syntax
    Failure Indicators: Raw Unicode chars in output, no checkbox syntax
    Evidence: .sisyphus/evidence/task-4-checklists.txt

  Scenario: Excessive whitespace cleaned
    Tool: Bash
    Preconditions: md-converter.ts exists
    Steps:
      1. Run with HTML containing 5+ consecutive <br> tags
      2. Assert output has at most 2 consecutive blank lines
      3. Assert no trailing whitespace on any line
    Expected Result: Clean formatting, no excessive blank lines
    Failure Indicators: >2 consecutive blank lines
    Evidence: .sisyphus/evidence/task-4-whitespace.txt
  ```

  **Commit**: YES
  - Message: `feat(export-notes): add HTML preprocessor and Turndown converter`
  - Files: `scripts/export-notes/html-processor.ts`, `scripts/export-notes/md-converter.ts`
  - Pre-commit: `npx tsc --noEmit -p scripts/export-notes/tsconfig.json`

- [x] 5. Image Extractor + HEIC Conversion

  **What to do**:
  - Create `scripts/export-notes/image-processor.ts`
  - Implement `extractImages(htmlBody: string, noteSlug: string): { images: ProcessedImage[]; updatedHtml: string }`:
    - Parse all `<img>` tags from HTML body
    - For each `<img>`:
      - **Base64 data URL** (`src="data:image/...;base64,..."`) — decode base64 to Buffer
      - **Web URL** (`src="https://..."`) — download with `fetch()`, 30s timeout, max 50MB
      - **Apple internal ref** (unrecognized src) — log warning, skip
    - Detect HEIC/HEIF format: check file signature bytes (`ftyp` + `heic`/`heif`/`mif1`) in buffer
    - Convert HEIC→JPEG via `sharp(buffer).jpeg({ quality: 85 }).toBuffer()`
    - Name images sequentially: `{noteSlug}-{NNN}.jpg` where NNN is zero-padded 3-digit index (000, 001, 002...)
    - Non-HEIC images: keep original format if JPEG/PNG, convert to JPEG otherwise
    - Replace `<img>` tags in HTML with markdown image syntax: `![{noteSlug} {NNN}](/images/articles/{noteSlug}-{NNN}.jpg)`
    - Return: array of `ProcessedImage` objects + updated HTML with image references replaced
  - Implement `writeImages(images: ProcessedImage[], imageDir: string): void`:
    - Write each image buffer to `{imageDir}/{filename}`
    - Validate written file: check file size > 0
    - Log: "Wrote N images for note: {slug}"

  **Must NOT do**:
  - Do NOT use Pillow or pillow-heif (Python) — use `sharp` (Node.js)
  - Do NOT process Apple Notes drawings/sketches — they're binary data, not `<img>` tags
  - Do NOT resize or optimize non-HEIC images — keep original quality
  - Do NOT create subdirectories per note — all images in flat `static/images/articles/`

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Binary data handling (base64 decode, HEIC detection, sharp conversion), network requests, file I/O
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with T2, T3, T4)
  - **Blocks**: T7
  - **Blocked By**: T1

  **References**:

  **Pattern References**:
  - `exporter/src/image_processor.py:50-100` — Base64 data URL extraction regex pattern
  - `exporter/src/image_processor.py:120-180` — HEIC format detection via file signature bytes
  - `exporter/src/image_processor.py:200-260` — Image conversion and naming convention (`{slug}-{NNN}.jpg`)
  - `exporter/src/image_processor.py:280-340` — Web URL image downloading with timeout and size limits
  - `exporter/src/filename_utils.py:1-40` — Kebab-case slug generation (must match for image naming)

  **API/Type References**:
  - `scripts/export-notes/types.ts:ProcessedImage` — Output type (from T1)
  - sharp API: `sharp(buffer).jpeg({ quality: 85 }).toBuffer()` for HEIC conversion

  **Test References**:
  - `src/content/notes/food/viral-cajun-salmon-burrito.mdx:21` — Example image reference: `![Viral Cajun Salmon Burrito 000](/images/articles/viral-cajun-salmon-burrito-000.jpg)` — our output must match this pattern
  - `static/images/articles/` — Existing images showing naming convention and format

  **External References**:
  - sharp HEIC support: https://sharp.pixelplumbing.com/api-input — requires libvips with HEIF support (auto-installed on macOS)
  - HEIC file signature: bytes 4-8 contain `ftyp`, bytes 8-12 contain `heic`, `heif`, or `mif1`

  **WHY Each Reference Matters**:
  - `image_processor.py:50-100` has the exact regex for matching base64 data URLs in Apple Notes HTML — port this pattern
  - `image_processor.py:120-180` has HEIC signature detection that's been tested with real Apple Notes images
  - The image naming convention `{slug}-{NNN}.jpg` MUST match existing images in `static/images/articles/` for consistency
  - `viral-cajun-salmon-burrito.mdx:26` shows the exact markdown image syntax Gatsby expects

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Base64 image extraction from HTML
    Tool: Bash
    Preconditions: image-processor.ts exists
    Steps:
      1. Create a small test base64 PNG: npx tsx -e "
         import { extractImages } from './scripts/export-notes/image-processor';
         // Create 1x1 red pixel PNG as base64
         const redPixel = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
         const html = '<div>Text <img src=\"data:image/png;base64,' + redPixel + '\"> more text</div>';
         const result = extractImages(html, 'test-note');
         console.log(JSON.stringify({ imageCount: result.images.length, firstFile: result.images[0]?.filename, hasUpdatedRef: result.updatedHtml.includes('/images/articles/test-note-000') }));
         "
      2. Assert: imageCount is 1
      3. Assert: firstFile is "test-note-000.png" or "test-note-000.jpg"
      4. Assert: hasUpdatedRef is true
    Expected Result: Base64 decoded, file named correctly, HTML updated with markdown image ref
    Failure Indicators: Zero images, wrong filename, HTML unchanged
    Evidence: .sisyphus/evidence/task-5-base64-extraction.txt

  Scenario: Image naming convention matches existing pattern
    Tool: Bash
    Preconditions: image-processor.ts exists
    Steps:
      1. Extract 3 images from a test HTML string
      2. Assert filenames: test-note-000.jpg, test-note-001.jpg, test-note-002.jpg
      3. Assert HTML references: ![test-note 000](/images/articles/test-note-000.jpg), etc.
    Expected Result: Sequential zero-padded naming matching existing convention
    Failure Indicators: Non-sequential, non-padded, wrong path prefix
    Evidence: .sisyphus/evidence/task-5-naming-convention.txt

  Scenario: Graceful handling of invalid/unreachable image URLs
    Tool: Bash
    Preconditions: image-processor.ts exists
    Steps:
      1. Run with HTML containing <img src="https://nonexistent.invalid/image.jpg">
      2. Assert: function does not throw
      3. Assert: warning logged about failed download
      4. Assert: image skipped, other images still processed
    Expected Result: Failed images logged and skipped, no crash
    Failure Indicators: Uncaught exception, silent failure without logging
    Evidence: .sisyphus/evidence/task-5-error-handling.txt
  ```

  **Commit**: YES
  - Message: `feat(export-notes): add image extraction and HEIC conversion`
  - Files: `scripts/export-notes/image-processor.ts`
  - Pre-commit: `npx tsc --noEmit -p scripts/export-notes/tsconfig.json`

- [x] 6. Deterministic Frontmatter Generator

  **What to do**:
  - Create `scripts/export-notes/frontmatter.ts`
  - Implement `generateFrontmatter(note: RawNote, tags: string[], markdown: string, slug: string): string`:
    - **title**: Note title from `note.title`. Wrap in double quotes. Escape internal double quotes.
    - **slug**: Use the pre-computed `slug` parameter (generated by `generateSlug` in the orchestrator BEFORE image extraction, so images and frontmatter share the same slug). Do NOT regenerate the slug here.
    - **excerpt**: Extract first meaningful paragraph from `markdown` body:
      - Skip blank lines at the start
      - Skip lines that are just markdown headers (`# ...`, `## ...`)
      - Take the first non-empty, non-header paragraph
      - Strip markdown syntax (bold, italic, links) to plain text
      - Truncate at 200 chars if longer, add "..."
      - Use YAML literal block scalar (`excerpt: |-`) for multi-line or long excerpts
    - **date**: `note.modificationDate` formatted as `'YYYY-MM-DD'` (single-quoted in YAML)
    - **category**: `getCategory(tags)` from T3 — PascalCase of first tag
    - **tags**: YAML array format — one tag per line with ` -` prefix
    - **readingTime**: `Math.max(1, Math.ceil(wordCount / 200))` + `" min read"` — count words in markdown body
    - **featured**: `false` (always)
    - **author**: `"Sai Nimmagadda"` (always)
  - Field order MUST be exactly: title, slug, excerpt, date, category, tags, readingTime, featured, author
  - Return complete frontmatter block including `---` delimiters
  - Implement `generateSlug(title: string): string` as a separate exported utility (also used by image processor for naming)
  - Handle duplicate slug detection: accept optional `existingSlugs: Set<string>` parameter. If slug exists, append `-2`, `-3`, etc. Log warning on collision.

  **Must NOT do**:
  - Do NOT call any AI/LLM API
  - Do NOT use a YAML library — generate YAML manually (simple enough, avoids dependency)
  - Do NOT include tags that were used for filtering (#personal, #private) in the frontmatter tags array
  - Do NOT deviate from the field order — existing content uses this exact order

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Pure string manipulation functions, well-defined input/output, no external dependencies
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (sequential, runs after T3)
  - **Blocks**: T7
  - **Blocked By**: T3 (needs `getCategory` and `extractTags` from filter.ts)

  **References**:

  **Pattern References**:
  - `exporter/src/mdx_converter.py:200-240` — Existing frontmatter field order and YAML formatting (the EXACT order to follow)
  - `exporter/src/filename_utils.py:5-30` — Existing `to_kebab_case()` implementation — port this slug logic
  - `exporter/src/frontmatter_generator.py:290-360` — Fallback (non-AI) frontmatter generation — basic logic to replicate

  **API/Type References**:
  - `scripts/export-notes/types.ts:RawNote` — Input note data
  - `scripts/export-notes/filter.ts:getCategory`, `extractTags` — Tag/category functions from T3

  **Test References**:
  - `src/content/notes/food/viral-cajun-salmon-burrito.mdx:1-17` — **Golden reference**: exact frontmatter format our generator must produce
  - `src/content/notes/technology/apple-notes-productivity-system.mdx:1-15` — Another reference for technology category notes
  - `src/content/notes/health/daily-warm-up-routine.mdx:1-15` — Health category reference

  **External References**:
  - `gatsby-node.js:80-86` — Gatsby's slug generation logic. Our slug generator must produce compatible output.

  **WHY Each Reference Matters**:
  - `viral-cajun-salmon-burrito.mdx:1-17` is the **golden reference** — output must be indistinguishable in format
  - `mdx_converter.py:200-240` shows the exact field order that existing content uses — must match
  - `gatsby-node.js:80-86` shows how Gatsby derives slugs — our slugs must work with this logic

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Frontmatter matches existing format exactly
    Tool: Bash
    Preconditions: frontmatter.ts exists
    Steps:
      1. Run: npx tsx -e "
         import { generateFrontmatter } from './scripts/export-notes/frontmatter';
         const note = { id: '1', title: 'Viral Cajun Salmon Burrito', body: '', creationDate: '2024-01-15', modificationDate: '2024-08-13', folder: 'Recipes' };
         const tags = ['food', 'cooking', 'salmon'];
         const markdown = 'Delicious recipe for a cajun salmon burrito with air fryer instructions and fresh toppings.';
         const slug = 'viral-cajun-salmon-burrito';
         console.log(generateFrontmatter(note, tags, markdown, slug));
         "
      2. Assert: starts with ---
      3. Assert: field order is title, slug, excerpt, date, category, tags, readingTime, featured, author
      4. Assert: slug is 'viral-cajun-salmon-burrito'
      5. Assert: category is 'Food'
      6. Assert: tags array contains food, cooking, salmon
      7. Assert: featured is false
      8. Assert: author is "Sai Nimmagadda"
      9. Assert: ends with ---
    Expected Result: Valid YAML frontmatter matching golden reference format
    Failure Indicators: Wrong field order, missing fields, wrong casing
    Evidence: .sisyphus/evidence/task-6-frontmatter-format.txt

  Scenario: Slug generation is deterministic and handles edge cases
    Tool: Bash
    Preconditions: frontmatter.ts exists
    Steps:
      1. Run: npx tsx -e "
         import { generateSlug } from './scripts/export-notes/frontmatter';
         console.log(generateSlug('Hello World!'));
         console.log(generateSlug('Café & Restaurant Review'));
         console.log(generateSlug('---Multiple---Hyphens---'));
         console.log(generateSlug('A'.repeat(100)));
         "
      2. Assert line 1: 'hello-world'
      3. Assert line 2: 'caf-restaurant-review' or 'cafe-restaurant-review'
      4. Assert line 3: 'multiple-hyphens' (collapsed, trimmed)
      5. Assert line 4: length <= 80 characters
    Expected Result: Consistent kebab-case slugs with edge cases handled
    Failure Indicators: Special chars in slug, consecutive hyphens, too long
    Evidence: .sisyphus/evidence/task-6-slug-generation.txt

  Scenario: Duplicate slug detection
    Tool: Bash
    Preconditions: frontmatter.ts exists with generateSlug
    Steps:
      1. Run: npx tsx -e "
         import { generateSlug } from './scripts/export-notes/frontmatter';
         const existing = new Set(['hello-world']);
         const slug1 = generateSlug('Hello World', existing);
         console.log('slug1: ' + slug1);
         existing.add(slug1);
         const slug2 = generateSlug('Hello World', existing);
         console.log('slug2: ' + slug2);
         existing.add(slug2);
         const slug3 = generateSlug('Hello World', existing);
         console.log('slug3: ' + slug3);
         "
      2. Assert slug1: 'hello-world-2' (first collision gets -2)
      3. Assert slug2: 'hello-world-3' (second collision gets -3)
      4. Assert slug3: 'hello-world-4' (third collision gets -4)
    Expected Result: Each collision appends incrementing suffix
    Failure Indicators: Duplicate slugs returned, no suffix, wrong suffix number
    Evidence: .sisyphus/evidence/task-6-slug-collision.txt
  ```

  **Commit**: YES
  - Message: `feat(export-notes): add deterministic frontmatter generation`
  - Files: `scripts/export-notes/frontmatter.ts`
  - Pre-commit: `npx tsc --noEmit -p scripts/export-notes/tsconfig.json`

- [x] 7. MDX Writer + Validator + Atomic Directory Swap

  **What to do**:
  - Create `scripts/export-notes/writer.ts`
  - Implement `validateMdx(content: string): { valid: boolean; errors: string[] }`:
    - Check for unescaped `{` and `}` characters outside of code blocks/fences — these break MDX compilation
    - Check for unescaped `<` characters that aren't valid HTML tags — breaks MDX
    - Escape problematic characters: `{` → `\{`, raw `<` → `&lt;` (only outside code blocks)
    - Optionally: compile with `@mdx-js/mdx` for full validation (add as devDependency if needed)
    - Return validation result + list of auto-fixed issues
  - Implement `writeMdxFile(frontmatter: string, markdown: string, outputPath: string): void`:
    - Combine frontmatter + newline + markdown body
    - Run `validateMdx()` — auto-fix issues, log warnings for each fix
    - Write file with UTF-8 encoding
  - Implement `atomicWriteNotes(notes: Array<{ frontmatter: string; markdown: string; category: string; slug: string; images: ProcessedImage[] }>, config: ExportConfig): void`:
    - Create temp directory: `src/content/.tmp-notes-export-{timestamp}/` (SIBLING of `notes/`, NOT inside it)
    - For each note:
      - Create category subdirectory: `{tempDir}/{category}/` (lowercase category for directory name)
      - Write MDX file: `{tempDir}/{category}/{slug}.mdx`
    - Write all images to `config.imageDir` (`static/images/articles/`)
    - Validate ALL files written successfully
    - **Atomic swap** (all paths are siblings under `src/content/`):
      1. Rename existing `src/content/notes/` → `src/content/.old-notes-{timestamp}/`
      2. Rename `src/content/.tmp-notes-export-{timestamp}/` → `src/content/notes/`
      3. Delete `src/content/.old-notes-{timestamp}/`
    - If step 2 fails: rollback by renaming `src/content/.old-notes-{timestamp}/` → `src/content/notes/`
    - Log: "Wrote N notes across M categories"

  **Must NOT do**:
  - Do NOT `rm -rf static/images/articles/` — only clean `src/content/notes/`
  - Do NOT use `@mdx-js/mdx` compile as a hard dependency if it adds significant install overhead — regex-based validation is acceptable as primary, with optional compile check
  - Do NOT write directly to `src/content/notes/` without the atomic swap safety net

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Atomic file operations, rollback safety, MDX validation edge cases — requires careful error handling
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (after T6, sequential)
  - **Blocks**: T8
  - **Blocked By**: T4, T5, T6

  **References**:

  **Pattern References**:
  - `exporter/src/mdx_converter.py:300-340` — Existing MDX validation and auto-fix logic (unescaped braces, JSX issues)
  - `exporter/src/main.py:198-236` — Existing `_process_note` method — single-pass organization into category folders
  - `exporter/src/main.py:92-133` — Output directory creation and file writing logic
  - `scripts/notes/sync-notes.js:50-100` — Current sync logic (what our atomic write replaces)

  **API/Type References**:
  - `scripts/export-notes/types.ts:ProcessedImage`, `ExportConfig` — Input types
  - Node.js `fs.renameSync()` — atomic rename on same filesystem
  - Node.js `fs.mkdtempSync()` — temp directory creation

  **Test References**:
  - `exporter/src/mdx_validator.js:1-100` — **Critical reference**: existing MDX validator using `@mdx-js/mdx` compiler. Shows exactly what MDX issues to check for.

  **External References**:
  - MDX syntax: `{` and `}` are JSX expression delimiters — must be escaped in regular text
  - Node.js `fs.renameSync`: atomic on same filesystem (POSIX guarantee)

  **WHY Each Reference Matters**:
  - `mdx_validator.js` is the existing validation logic — must replicate its checks or the same MDX issues will break Gatsby builds
  - `main.py:198-236` shows the category folder organization pattern — must match
  - `fs.renameSync` atomicity is the key safety mechanism — crash between steps is the risk to mitigate

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: MDX validation catches and fixes unescaped braces
    Tool: Bash
    Preconditions: writer.ts exists
    Steps:
      1. Run: npx tsx -e "
         import { validateMdx } from './scripts/export-notes/writer';
         // Test unescaped braces outside code blocks
         const r1 = validateMdx('Some text with {braces} and more');
         console.log('braces_fixed: ' + r1.valid);
         console.log('fixes_count: ' + r1.errors.length);
         // Test code blocks preserved (braces inside code should NOT be escaped)
         const r2 = validateMdx('Normal text\n\`\`\`\nconst x = {a: 1};\n\`\`\`\nMore text');
         console.log('code_preserved: ' + !r2.errors.some(e => e.includes('code')));
         // Test unescaped angle brackets
         const r3 = validateMdx('Use value <5 for best results');
         console.log('angle_fixed: ' + r3.valid);
         "
      2. Assert braces_fixed: true
      3. Assert fixes_count: > 0 (at least one fix logged)
      4. Assert code_preserved: true (code blocks untouched)
      5. Assert angle_fixed: true
    Expected Result: Problematic characters escaped outside code, code blocks preserved
    Failure Indicators: valid false without fix, code block content modified
    Evidence: .sisyphus/evidence/task-7-mdx-validation.txt

  Scenario: Atomic swap writes to temp then renames
    Tool: Bash
    Preconditions: writer.ts exists, src/content/notes/ exists
    Steps:
      1. Run: npx tsx -e "
         import { atomicWriteNotes } from './scripts/export-notes/writer';
         const testNotes = [
           { frontmatter: '---\ntitle: Test1\nslug: test-1\ncategory: Food\n---', markdown: 'Hello food', category: 'food', slug: 'test-1', images: [] },
           { frontmatter: '---\ntitle: Test2\nslug: test-2\ncategory: Tech\n---', markdown: 'Hello tech', category: 'tech', slug: 'test-2', images: [] }
         ];
         const config = { notesDir: 'src/content/notes', imageDir: 'static/images/articles', excludeTags: [], author: 'Test', dryRun: false, verbose: false };
         atomicWriteNotes(testNotes, config);
         console.log('SWAP_OK');
         "
      2. Assert output contains: "SWAP_OK"
      3. Run: ls src/content/notes/food/test-1.mdx src/content/notes/tech/test-2.mdx
      4. Assert: both files exist (exit code 0)
      5. Run: ls src/content/.tmp-notes-export-* src/content/.old-notes-* 2>&1
      6. Assert: "No such file" (no temp artifacts remain)
    Expected Result: Clean swap, no temp artifacts, correct directory structure
    Failure Indicators: Temp dirs remain, missing files, wrong categories
    Evidence: .sisyphus/evidence/task-7-atomic-swap.txt

  Scenario: Category directory uses lowercase naming
    Tool: Bash
    Preconditions: Atomic swap scenario completed (files exist)
    Steps:
      1. Run: ls -d src/content/notes/*/
      2. Assert: directories are lowercase (food/, tech/, NOT Food/, Tech/)
      3. Run: head -5 src/content/notes/food/test-1.mdx
      4. Assert: frontmatter contains "category: Food" (PascalCase in frontmatter)
      5. Run: basename $(dirname src/content/notes/food/test-1.mdx)
      6. Assert: output is "food" (lowercase directory)
    Expected Result: Directory lowercase, frontmatter PascalCase
    Failure Indicators: PascalCase directory name, lowercase category in frontmatter
    Evidence: .sisyphus/evidence/task-7-category-casing.txt
  ```

  **Commit**: YES
  - Message: `feat(export-notes): add MDX writer with atomic directory swap`
  - Files: `scripts/export-notes/writer.ts`
  - Pre-commit: `npx tsc --noEmit -p scripts/export-notes/tsconfig.json`

- [x] 8. CLI Entry Point + End-to-End Wiring

  **What to do**:
  - Replace the stub `scripts/export-notes/index.ts` (from T1) with the full orchestrator
  - Implement CLI argument parsing (no library needed — simple `process.argv` parsing):
    - `--dry-run` — fetch and filter notes, print stats, but do NOT write any files
    - `--verbose` — print per-note details (title, tags, category, image count)
    - No other flags needed — keep it simple
  - Implement the main pipeline orchestration:

    ```
    1. Log: "Starting Apple Notes export..."
    2. fetchAllNotes() → RawNote[] (from jxa-bridge.ts)
    3. filterNotes(notes, config) → { exported, stats } (from filter.ts)
    4. Log filter stats: "Found N notes: X archived, Y private, Z untagged → Exporting M"
    5. If --dry-run: print stats + sample titles, exit 0
    6. Initialize: existingSlugs = new Set<string>()
    7. For each exported note:
       a. extractTags(note.body) → tags (from filter.ts)
       b. slug = generateSlug(note.title, existingSlugs) → string (from frontmatter.ts) ← MUST happen before image extraction
       c. existingSlugs.add(slug)
       d. extractImages(note.body, slug) → { images, updatedHtml } (from image-processor.ts) ← receives final collision-safe slug for image naming
       e. htmlToMarkdown(updatedHtml) → markdown (from md-converter.ts) ← receives HTML with <img> tags ALREADY replaced by T5 with markdown image syntax
       f. generateFrontmatter(note, tags, markdown, slug) → frontmatter (from frontmatter.ts) ← receives pre-computed slug, does NOT regenerate it
       g. category = getCategory(tags) (from filter.ts)
       h. Collect { frontmatter, markdown, category, slug, images }
    8. atomicWriteNotes(processedNotes, config) (from writer.ts)
    9. Log summary: "Export complete: N notes, M images, K categories"
    10. Log any errors/warnings accumulated during processing
    11. Exit 0 on success, 1 on fatal error
    ```

    **Module contract (CRITICAL — read carefully):**
    - **Slug generation** (`frontmatter.ts:generateSlug`): Called FIRST in the per-note loop. Produces the collision-safe slug used by ALL downstream steps.
    - **Image extraction** (`image-processor.ts:extractImages`): Receives slug + HTML. Replaces `<img>` tags in HTML with markdown `![alt](/images/articles/{slug}-{NNN}.jpg)` syntax. Returns updated HTML + image buffers.
    - **Markdown conversion** (`md-converter.ts:htmlToMarkdown`): Receives HTML where images are ALREADY markdown-replaced. Does NOT handle `<img>` tags — strips any remaining ones.
    - **Frontmatter** (`frontmatter.ts:generateFrontmatter`): Receives pre-computed slug. Does NOT call `generateSlug` again.

  - Config defaults (hardcoded):
    - `notesDir`: `src/content/notes/` (relative to project root)
    - `imageDir`: `static/images/articles/` (relative to project root)
    - `excludeTags`: `['personal', 'private']`
    - `author`: `'Sai Nimmagadda'`
  - Error handling: wrap each note's processing in try/catch — skip failed notes with logged warning, continue with rest. Fatal errors (JXA bridge failure, file system errors) exit with code 1.

  **Must NOT do**:
  - Do NOT use a CLI framework (commander, yargs) — `process.argv` is sufficient for 2 flags
  - Do NOT add config file support (`.exportrc`, `export.config.ts`) — hardcoded defaults are fine
  - Do NOT add `--watch` mode or any daemon functionality
  - Do NOT add `--output` flag — always writes to the default locations
  - Do NOT over-engineer error handling — skip failed notes, log clearly, exit appropriately

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Wiring all modules together, orchestration logic, error handling across the full pipeline
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 4 (first in sequence)
  - **Blocks**: T9
  - **Blocked By**: T2, T3, T7 (needs all modules)

  **References**:

  **Pattern References**:
  - `exporter/src/main.py:92-190` — Existing `SimpleNotesExporter.export()` method — the full orchestration flow to replicate in TS
  - `exporter/export.py:1-30` — Existing CLI entry point pattern
  - `exporter/run_export.sh:1-20` — Shell wrapper showing how the pipeline is currently invoked

  **API/Type References**:
  - All modules from T2-T7: `fetchAllNotes`, `filterNotes`, `extractTags`, `getCategory`, `extractImages`, `htmlToMarkdown`, `generateFrontmatter`, `generateSlug`, `atomicWriteNotes`
  - `scripts/export-notes/types.ts:ExportConfig`, `ExportStats` — Configuration and stats types

  **External References**:
  - None — all imports are internal modules

  **WHY Each Reference Matters**:
  - `main.py:92-190` is the canonical orchestration flow — the order of operations matters (fetch → filter → process images → convert → write)
  - Error handling pattern from `main.py` shows which failures are fatal vs skippable

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Full pipeline smoke test — export + Gatsby build
    Tool: Bash
    Preconditions: All modules (T2-T7) committed, Apple Notes has notes
    Steps:
      1. Run: npx tsx scripts/export-notes/index.ts
      2. Assert: exit code 0
      3. Assert: stdout contains "Export complete: N notes"
      4. Run: ls src/content/notes/
      5. Assert: at least 1 category directory exists with .mdx files
      6. Run: npx tsc --noEmit -p scripts/export-notes/tsconfig.json
      7. Assert: exit code 0 (new pipeline code typechecks)
      8. Run: npm run build
      9. Assert: exit code 0 (Gatsby builds successfully with exported content)
    Expected Result: Pipeline exports notes, pipeline typechecks, Gatsby builds cleanly
    Failure Indicators: Non-zero exit, empty output dir, build failure
    Evidence: .sisyphus/evidence/task-8-smoke-test.txt

  Scenario: Dry-run mode prints stats without writing
    Tool: Bash
    Preconditions: All modules committed
    Steps:
      1. Record current src/content/notes/ state: ls -la src/content/notes/ > /tmp/before.txt
      2. Run: npx tsx scripts/export-notes/index.ts --dry-run
      3. Assert: stdout contains "Found N notes" and filter breakdown
      4. Assert: stdout contains note titles (at least 1)
      5. Run: diff <(ls -la src/content/notes/) /tmp/before.txt
      6. Assert: no differences (no files written)
    Expected Result: Stats printed, zero file system changes
    Failure Indicators: Files modified during dry-run
    Evidence: .sisyphus/evidence/task-8-dry-run.txt

  Scenario: No excluded notes in output
    Tool: Bash
    Preconditions: Pipeline has run successfully
    Steps:
      1. Run: grep -r "^slug:" src/content/notes/ | sort
      2. Run: ls -R src/content/notes/
      3. Assert: no "personal/" directory exists
      4. Assert: no "private/" directory exists
      5. Run: grep -rl "#personal\|#private" src/content/notes/ || echo "CLEAN"
      6. Assert: output is "CLEAN"
    Expected Result: Zero personal/private content in export
    Failure Indicators: personal/ or private/ directory exists, tag text found in files
    Evidence: .sisyphus/evidence/task-8-no-excluded.txt

  Scenario: Idempotency — two runs produce identical output
    Tool: Bash
    Preconditions: Pipeline has run once
    Steps:
      1. Run: npx tsx scripts/export-notes/index.ts
      2. Run: cp -r src/content/notes /tmp/run1
      3. Run: npx tsx scripts/export-notes/index.ts
      4. Run: diff -r src/content/notes /tmp/run1
      5. Assert: no differences
      6. Cleanup: rm -rf /tmp/run1
    Expected Result: Byte-identical output across runs
    Failure Indicators: Any diff output (timestamps, ordering, content)
    Evidence: .sisyphus/evidence/task-8-idempotency.txt
  ```

  **Commit**: YES
  - Message: `feat(export-notes): add CLI entry point with dry-run and logging`
  - Files: `scripts/export-notes/index.ts`
  - Pre-commit: `npx tsc --noEmit -p scripts/export-notes/tsconfig.json`

- [ ] 9. Delete Legacy Python Exporter + Sync Scripts

  **What to do**:
  - Delete the entire `exporter/` directory (Python pipeline, all source files, requirements.txt, .env.example, output/)
  - Delete `ExportNotesHtml.workflow/` (Automator workflow at repo root)
  - Delete `scripts/notes/sync-notes.js` (old sync script)
  - Delete `scripts/notes/cleanup-export.js` (old cleanup script)
  - Delete `scripts/notes/` directory if empty after removing above files
  - Remove old npm scripts from `package.json`:
    - Remove `"notes:sync": "node scripts/notes/sync-notes.js"`
    - Remove `"notes:cleanup": "node scripts/notes/cleanup-export.js"`
  - Verify new pipeline still works after deletion: `npx tsx scripts/export-notes/index.ts --dry-run`

  **Must NOT do**:
  - Do NOT delete `scripts/export-notes/` (the NEW pipeline!)
  - Do NOT delete `src/content/notes/` (exported content)
  - Do NOT delete `static/images/articles/` (images)
  - Do NOT modify any Gatsby source code

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple file deletion, no complex logic
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 4 (after T8)
  - **Blocks**: T10
  - **Blocked By**: T8 (must verify new pipeline works before deleting old)

  **References**:

  **Pattern References**:
  - `exporter/` — Entire directory to delete
  - `ExportNotesHtml.workflow/` — Automator workflow to delete
  - `scripts/notes/sync-notes.js` — Sync script to delete
  - `scripts/notes/cleanup-export.js` — Cleanup script to delete
  - `package.json` — Remove `notes:sync` and `notes:cleanup` scripts

  **WHY Each Reference Matters**:
  - These are the exact paths to delete — no guessing. Verify each exists before deleting.

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: All old pipeline code removed
    Tool: Bash
    Preconditions: T8 verified working
    Steps:
      1. Run: ls exporter/ 2>&1
      2. Assert: "No such file or directory"
      3. Run: ls ExportNotesHtml.workflow/ 2>&1
      4. Assert: "No such file or directory"
      5. Run: ls scripts/notes/ 2>&1
      6. Assert: "No such file or directory"
      7. Run: grep -c "notes:sync\|notes:cleanup" package.json
      8. Assert: 0 (no old npm scripts)
    Expected Result: All old code fully removed
    Failure Indicators: Any old file/directory still exists
    Evidence: .sisyphus/evidence/task-9-old-code-removed.txt

  Scenario: New pipeline still works after cleanup
    Tool: Bash
    Preconditions: Old code deleted
    Steps:
      1. Run: npx tsx scripts/export-notes/index.ts --dry-run
      2. Assert: exit code 0
      3. Assert: output shows note count
      4. Run: npm run export-notes -- --dry-run
      5. Assert: exit code 0 (npm script still works)
    Expected Result: New pipeline unaffected by old code deletion
    Failure Indicators: Import errors, missing modules
    Evidence: .sisyphus/evidence/task-9-new-pipeline-works.txt
  ```

  **Commit**: YES
  - Message: `chore: remove legacy Python exporter and sync scripts`
  - Files: (deletions) `exporter/`, `ExportNotesHtml.workflow/`, `scripts/notes/`, `package.json`
  - Pre-commit: `npx tsx scripts/export-notes/index.ts --dry-run`

- [ ] 10. Update AGENTS.md + README.md Documentation

  **What to do**:
  - Update `AGENTS.md`:
    - Replace the "Apple Notes Exporter" section under "Build & Dev Commands" to reference `npm run export-notes` instead of the Python exporter
    - Add `npm run export-notes` to the command list with description
    - Remove any references to `exporter/`, `run_export.sh`, `notes:sync`, `notes:cleanup`
    - Add `scripts/export-notes/` to the Project Structure section with brief description
    - Note: "No Python dependencies required — pipeline is pure TypeScript"
  - Update `README.md`:
    - Update the "Apple Notes Exporter" section under "Content Management" to describe the new TypeScript pipeline
    - Update "Available Scripts" to include `npm run export-notes` (with `--dry-run` and `--verbose` flags)
    - Remove references to `exporter/README.md`, Python, `requirements.txt`
    - Update the workflow description: "Run `npm run export-notes` → notes exported to `src/content/notes/` → `npm run build`"

  **Must NOT do**:
  - Do NOT rewrite the entire README or AGENTS.md — only update sections related to the exporter
  - Do NOT add excessive documentation — keep it concise and matching existing doc style
  - Do NOT create a separate `scripts/export-notes/README.md` — documentation lives in the main docs

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: Documentation updates require matching existing tone and style
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 4 (after T9)
  - **Blocks**: F1-F4
  - **Blocked By**: T9 (docs must reflect cleaned-up state)

  **References**:

  **Pattern References**:
  - `AGENTS.md:1-50` — Current document structure and tone (match this style)
  - `README.md:1-50` — Current README structure (match section headings and formatting)

  **WHY Each Reference Matters**:
  - Must match existing documentation tone — concise, technical, no fluff
  - Section headings and formatting must be consistent with rest of document

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Documentation references are correct
    Tool: Bash
    Preconditions: T9 completed (old code removed)
    Steps:
      1. Run: grep -c "export-notes" AGENTS.md
      2. Assert: >= 1 (new pipeline referenced)
      3. Run: grep -c "exporter/" AGENTS.md
      4. Assert: 0 (old pipeline not referenced)
      5. Run: grep -c "export-notes" README.md
      6. Assert: >= 1 (new pipeline referenced)
      7. Run: grep -c "Python\|requirements.txt\|run_export.sh" README.md
      8. Assert: 0 (old pipeline not referenced)
    Expected Result: Docs reference new pipeline, no old pipeline references
    Failure Indicators: Old references remain, new pipeline not mentioned
    Evidence: .sisyphus/evidence/task-10-docs-updated.txt

  Scenario: npm run export-notes documented with flags
    Tool: Bash
    Preconditions: Docs updated
    Steps:
      1. Run: grep "dry-run\|--verbose" AGENTS.md README.md
      2. Assert: at least one match in each file (flags documented)
    Expected Result: CLI flags documented in both files
    Failure Indicators: Flags not mentioned
    Evidence: .sisyphus/evidence/task-10-flags-documented.txt
  ```

  **Commit**: YES
  - Message: `docs: update documentation for new export pipeline`
  - Files: `AGENTS.md`, `README.md`
  - Pre-commit: `npx tsc --noEmit -p scripts/export-notes/tsconfig.json`

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.

- [ ] F1. **Plan Compliance Audit** — `oracle`
      Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in `.sisyphus/evidence/`. Compare deliverables against plan.
      Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
      Run `npx tsc --noEmit -p scripts/export-notes/tsconfig.json` + `npx eslint scripts/export-notes/`. Review all files in `scripts/export-notes/` for: `as any`/`@ts-ignore`, empty catches, `console.log` in prod (should use structured logging), commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names (data/result/item/temp). Note: existing typecheck/lint failures in `src/pages/` and `src/templates/` are pre-existing and NOT in scope.
      Output: `Typecheck [PASS/FAIL] | Lint [PASS/FAIL] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high`
      Run full pipeline: `npx tsx scripts/export-notes/index.ts`. Verify: notes exported to correct category folders, frontmatter valid, images present in `static/images/articles/`, no `#personal`/`#private` notes in output, `npm run build` succeeds. Run twice and diff output for idempotency. Save evidence to `.sisyphus/evidence/final-qa/`.
      Output: `Export [PASS/FAIL] | Build [PASS/FAIL] | Idempotency [PASS/FAIL] | Filter [PASS/FAIL] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
      For each task: read "What to do", read actual code. Verify 1:1 — everything in spec was built (no missing), nothing beyond spec (no creep). Check "Must NOT" compliance: no AI calls, no Gatsby UI changes, no test framework. Check old code fully removed: `exporter/`, `scripts/notes/`, `ExportNotesHtml.workflow`. Flag unaccounted changes.
      Output: `Tasks [N/N compliant] | Must NOT [N/N clean] | Cleanup [COMPLETE/INCOMPLETE] | VERDICT`

---

## Commit Strategy

| #   | Message                                                            | Scope | Verification                                                    |
| --- | ------------------------------------------------------------------ | ----- | --------------------------------------------------------------- |
| 1   | `feat(export-notes): scaffold project structure and dependencies`  | T1    | `npx tsc --noEmit -p scripts/export-notes/tsconfig.json` passes |
| 2   | `feat(export-notes): add JXA bridge for Apple Notes access`        | T2    | Dry-run prints note count                                       |
| 3   | `feat(export-notes): add tag extraction and note filtering`        | T3    | Filter stats in dry-run output                                  |
| 4   | `feat(export-notes): add HTML preprocessor and Turndown converter` | T4    | Sample HTML converts cleanly                                    |
| 5   | `feat(export-notes): add image extraction and HEIC conversion`     | T5    | Images written as valid JPEG                                    |
| 6   | `feat(export-notes): add deterministic frontmatter generation`     | T6    | Frontmatter matches expected format                             |
| 7   | `feat(export-notes): add MDX writer with atomic directory swap`    | T7    | MDX files validate, atomic swap works                           |
| 8   | `feat(export-notes): add CLI entry point with dry-run and logging` | T8    | Full pipeline: export + build passes                            |
| 9   | `chore: remove legacy Python exporter and sync scripts`            | T9    | Old directories deleted, new pipeline works                     |
| 10  | `docs: update documentation for new export pipeline`               | T10   | AGENTS.md + README.md reflect new pipeline                      |

---

## Success Criteria

### Verification Commands

```bash
npx tsx scripts/export-notes/index.ts --dry-run           # Expected: prints note count, filter stats, no files written
npx tsx scripts/export-notes/index.ts                      # Expected: exports notes to src/content/notes/
npx tsc --noEmit -p scripts/export-notes/tsconfig.json    # Expected: 0 errors (scoped to pipeline files)
npm run build                                              # Expected: clean Gatsby build with exported notes
ls src/content/notes/                              # Expected: category directories with .mdx files
ls exporter/ 2>&1                                  # Expected: No such file or directory
ls scripts/notes/ 2>&1                             # Expected: No such file or directory
```

### Final Checklist

- [ ] All "Must Have" present
- [ ] All "Must NOT Have" absent
- [ ] Gatsby builds cleanly with exported content
- [ ] Running export twice produces identical output
- [ ] No excluded notes in output
