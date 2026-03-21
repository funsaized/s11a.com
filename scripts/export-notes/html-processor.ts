/**
 * Apple Notes HTML preprocessor.
 *
 * Transforms raw Apple Notes HTML into clean markup that Turndown can
 * reliably convert to markdown. Runs BEFORE Turndown — order matters.
 */

/**
 * Preprocess Apple Notes HTML for Turndown conversion.
 *
 * Steps (in order):
 * 1. Strip first H1 (note title — rendered via frontmatter)
 * 2. Strip <font> tags (keep inner content)
 * 3. Remove style attributes
 * 4. Unwrap empty/whitespace-only <span> tags
 * 5. Normalize <br> variants
 * 6. Convert Unicode checkbox characters to <input type="checkbox">
 */
export function preprocessHtml(html: string): string {
  // 1. Strip first H1 — Apple Notes prefixes the body with the note title
  html = html.replace(/<h1[^>]*>.*?<\/h1>/is, "");

  // 2. Strip <font> tags but keep inner content
  html = html.replace(/<font[^>]*>/gi, "").replace(/<\/font>/gi, "");

  // 3. Remove all style attributes
  html = html.replace(/\s*style="[^"]*"/gi, "");

  // 4. Unwrap empty/whitespace-only <span> tags (repeat for nested spans)
  let prev = "";
  while (prev !== html) {
    prev = html;
    html = html.replace(/<span[^>]*>(\s*)<\/span>/gi, "$1");
  }

  // 5. Normalize <br> variants to <br>
  html = html.replace(/<br\s*\/?>/gi, "<br>");

  // 6. Convert Unicode checkbox characters to standard checkbox inputs
  // ☐ = U+2610 (unchecked box)
  html = html.replace(/☐/g, '<input type="checkbox"> ');
  // ☑ = U+2611 (checked box), ✓ = U+2713 (check mark), ✔ = U+2714
  html = html.replace(/[☑✓✔]/g, '<input type="checkbox" checked> ');
  // ✗ = U+2717, ✘ = U+2718 (ballot X) — treat as unchecked
  html = html.replace(/[✗✘]/g, '<input type="checkbox"> ');

  return html;
}
