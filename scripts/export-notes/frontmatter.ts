import { getCategory } from "./filter";
import type { RawNote } from "./types";

/**
 * Generate a kebab-case slug from a title.
 * - Normalize unicode (NFKD), strip diacritics
 * - Lowercase, keep only [a-z0-9-], collapse hyphens
 * - Max 80 chars
 * - Collision detection: append -2, -3, etc.
 */
export function generateSlug(
  title: string,
  existingSlugs?: Set<string>,
): string {
  // Normalize unicode and strip diacritics
  let slug = title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // keep only alphanumeric, spaces, hyphens
    .trim()
    .replace(/[\s_]+/g, "-") // spaces/underscores → hyphens
    .replace(/-+/g, "-") // collapse multiple hyphens
    .replace(/^-+|-+$/g, ""); // trim leading/trailing hyphens

  // Max 80 chars
  if (slug.length > 80) {
    slug = slug.slice(0, 80).replace(/-+$/, "");
  }

  if (!slug) slug = "untitled";

  // Collision detection
  if (!existingSlugs || !existingSlugs.has(slug)) return slug;

  let counter = 2;
  let candidate = `${slug}-${counter}`;
  while (existingSlugs.has(candidate)) {
    counter++;
    candidate = `${slug}-${counter}`;
  }
  return candidate;
}

/**
 * Extract the first meaningful paragraph from markdown.
 * - Skip headers, code blocks, images, blank lines
 * - Clean markdown syntax (bold, italic, links, inline code, hashtags)
 * - Min 20 chars, max 200 chars
 * - Fallback to empty string if no excerpt found
 */
function extractExcerpt(markdown: string): string {
  const lines = markdown.split("\n");
  let inCode = false;

  for (const line of lines) {
    // Track code blocks
    if (line.startsWith("```")) {
      inCode = !inCode;
      continue;
    }
    if (inCode) continue;

    // Skip blank lines
    if (!line.trim()) continue;

    // Skip headers
    if (line.startsWith("#")) continue;

    // Skip markdown image lines
    if (line.startsWith("![")) continue;

    // Clean markdown syntax from this line
    let text = line
      .replace(/\*\*(.+?)\*\*/g, "$1") // bold
      .replace(/\*(.+?)\*/g, "$1") // italic
      .replace(/_(.+?)_/g, "$1") // italic underscore
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links → text
      .replace(/`[^`]+`/g, "") // inline code
      .replace(/(?:^|\s)#([a-z][a-z0-9-]*)/gi, "") // hashtags
      .trim();

    if (text.length < 20) continue; // too short to be meaningful

    // Truncate at 200 chars
    if (text.length > 200) {
      text = text.slice(0, 197) + "...";
    }
    return text;
  }

  return ""; // fallback — no excerpt found
}

/**
 * Format excerpt for YAML frontmatter.
 * - Always use literal block scalar (|-) — immune to YAML escape interpretation
 */
function formatExcerpt(excerpt: string): string {
  if (!excerpt) return 'excerpt: ""';
  // Always use literal block scalar — immune to YAML escape interpretation
  return `excerpt: |-\n  ${excerpt}`;
}

/**
 * Generate YAML frontmatter for an MDX note.
 * Field order: title, slug, excerpt, date, category, tags, readingTime, featured, author
 */
export function generateFrontmatter(
  note: RawNote,
  tags: string[],
  markdown: string,
  slug: string,
): string {
  const title = note.title.replace(/'/g, "''");
  const category = getCategory(tags);
  const date = note.modificationDate.slice(0, 10); // YYYY-MM-DD
  let excerpt = extractExcerpt(markdown);

  // Fallback to title if no excerpt found
  if (!excerpt) {
    excerpt = note.title.slice(0, 100);
  }

  const wordCount = markdown.split(/\s+/).filter(Boolean).length;
  const readingTime = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;

  const lines = [
    "---",
    `title: '${title}'`,
    `slug: ${slug}`,
    formatExcerpt(excerpt),
    `date: '${date}'`,
    `category: ${category}`,
    "tags:",
    ...tags.map((t) => `  - ${t}`),
    `readingTime: ${readingTime}`,
    "featured: false",
    `author: Sai Nimmagadda`,
    "---",
  ];

  return lines.join("\n") + "\n";
}
