import type { RawNote, ExportConfig, ExportStats } from "./types";

/**
 * Extract hashtags from HTML body.
 * - Strips HTML tags, decodes entities, removes code blocks and URLs
 * - Matches tags: space/start + # + lowercase letter + lowercase letters/digits/hyphens
 * - Returns unique tags in order of first appearance
 */
export function extractTags(htmlBody: string): string[] {
  // 1. Strip HTML tags to plain text
  let text = htmlBody.replace(/<[^>]+>/g, " ");

  // 2. Decode HTML entities
  text = text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");

  // 3. Strip code blocks (content between ``` markers) — avoids matching #include, etc.
  text = text.replace(/```[\s\S]*?```/g, " ");

  // 4. Strip URLs (http/https) — avoids matching URL fragments like #section
  text = text.replace(/https?:\/\/[^\s]+/g, " ");

  // 5. Apply tag regex: starts with space/start, # then lowercase letter, then lowercase letters/digits/hyphens
  const seen = new Set<string>();
  const tags: string[] = [];
  const regex = /(?:^|\s)#([a-z][a-z0-9-]*)/gi;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const tag = match[1].toLowerCase();
    if (!seen.has(tag)) {
      seen.add(tag);
      tags.push(tag);
    }
  }

  return tags;
}

/**
 * Filter notes based on archive status, excluded tags, and tagging.
 * Returns exported notes and statistics.
 */
const EXCLUDED_FOLDER_PATTERN =
  /^notes$|archive|archived|archives|old|deleted|trash|backup|work|private/i;

export function filterNotes(
  notes: RawNote[],
  config: ExportConfig,
): { exported: RawNote[]; stats: ExportStats } {
  const stats: ExportStats = {
    total: notes.length,
    archived: 0,
    private: 0,
    untagged: 0,
    exported: 0,
    images: 0,
    errors: [],
  };
  const exported: RawNote[] = [];

  for (const note of notes) {
    // Archive folder check (defense in depth — JXA bridge also filters)
    if (EXCLUDED_FOLDER_PATTERN.test(note.folder)) {
      stats.archived++;
      continue;
    }

    // Extract tags
    const tags = extractTags(note.body);

    // Check excluded tags
    if (tags.some((tag) => config.excludeTags.includes(tag))) {
      stats.private++;
      continue;
    }

    // All non-archive, non-private notes are exported (no longer skip untagged)
    stats.exported++;
    exported.push(note);
  }

  return { exported, stats };
}

/**
 * Convert first tag to category name.
 * Converts kebab-case to Title-Case: "health-fitness" → "Health-Fitness"
 */
export function getCategory(tags: string[]): string {
  if (tags.length === 0) return "Uncategorized";

  const first = tags[0];
  // Convert kebab-case to Title-Case
  return first
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("-");
}

/**
 * Map Apple Notes folder name to clean category.
 * Strips emojis, cleans up special characters, converts to PascalCase.
 * Examples:
 *   "Notes" → "General"
 *   "🎯 Content Creation" → "Content-Creation"
 *   "📋 Planning & Strategy" → "Planning-Strategy"
 *   "🧠 Knowledge Base" → "Knowledge-Base"
 */
export function folderToCategory(folderName: string): string {
  // Strip emoji characters (Unicode ranges for common emoji)
  let clean = folderName
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, "") // Misc symbols & pictographs, supplemental
    .replace(/[\u{2600}-\u{27BF}]/gu, "") // Misc symbols
    .replace(/[\u{FE00}-\u{FE0F}]/gu, "") // Variation selectors
    .replace(/[\u{200D}]/gu, "") // Zero-width joiner
    .replace(/[\u{20E3}]/gu, "") // Combining enclosing keycap
    .replace(/[\u{E0020}-\u{E007F}]/gu, "") // Tags
    .trim();

  if (!clean) return "General";

  // Special case: default "Notes" folder
  if (clean.toLowerCase() === "notes") return "General";

  // Take first meaningful word(s) and convert to PascalCase with hyphens
  return clean
    .split(/[\s&]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("-");
}
