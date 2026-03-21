/**
 * Turndown-based markdown converter for Apple Notes HTML.
 *
 * Pipeline: rawHtml → preprocessHtml → TurndownService → postProcess → markdown
 */

import TurndownService from "turndown";
import { preprocessHtml } from "./html-processor";

// ---------------------------------------------------------------------------
// Turndown singleton (module-level for perf)
// ---------------------------------------------------------------------------

const td = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  bulletListMarker: "-",
  emDelimiter: "_",
});

// ---------------------------------------------------------------------------
// Custom rules
// ---------------------------------------------------------------------------

/**
 * Checkbox list items — converts <li> containing <input type="checkbox">
 * into GitHub-flavoured `- [ ]` / `- [x]` syntax.
 */
td.addRule("checkbox", {
  filter(node) {
    if (node.nodeName !== "LI") return false;
    const html = node.innerHTML || "";
    return html.includes('type="checkbox"') || html.includes("type='checkbox'");
  },
  replacement(content, node) {
    const html = node.innerHTML || "";
    const checked = /checked/i.test(html);
    // Strip any existing checkbox text artifact that Turndown may produce
    const cleanContent = content.replace(/^\s*\[[ x]\]\s*/, "").trim();
    return `- [${checked ? "x" : " "}] ${cleanContent}\n`;
  },
});

/**
 * Strip <img> tags — images are already replaced with markdown syntax by
 * the image-processor BEFORE this converter runs.
 */
td.addRule("stripImages", {
  filter: "img",
  replacement() {
    return "";
  },
});

/**
 * Hashtag-aware paragraph rule — strips `#tag` text from body content.
 * Tags are extracted into frontmatter by a separate step, so they should
 * not appear in the rendered markdown.
 */
td.addRule("stripHashtags", {
  filter: ["p", "div"],
  replacement(content) {
    // Strip inline #word patterns (e.g. "#food", "#recipe-ideas")
    const stripped = content
      .replace(/(?:^|\s)#([a-z][a-z0-9-]*)/gi, " ")
      .trim();
    return stripped ? `\n\n${stripped}\n\n` : "";
  },
});

// ---------------------------------------------------------------------------
// Post-processing
// ---------------------------------------------------------------------------

function postProcess(markdown: string): string {
  // Trim trailing whitespace from each line FIRST — Turndown emits `  \n`
  // for <br> tags, and those trailing spaces break blank-line collapsing.
  let result = markdown
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n");

  // Collapse 3+ consecutive blank lines to 2
  result = result.replace(/\n{3,}/g, "\n\n");

  // Trim overall
  return result.trim();
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Convert already-preprocessed HTML to markdown.
 * Use this when you've already called `preprocessHtml()` yourself.
 */
export function convertToMarkdown(cleanHtml: string): string {
  const raw = td.turndown(cleanHtml);
  return postProcess(raw);
}

/**
 * Full pipeline: preprocess raw Apple Notes HTML then convert to markdown.
 * This is the primary entry point for the export pipeline.
 */
export function htmlToMarkdown(rawHtml: string): string {
  const clean = preprocessHtml(rawHtml);
  return convertToMarkdown(clean);
}
