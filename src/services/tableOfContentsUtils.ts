import { TableOfContentsHeading } from "../models";

/**
 * Extract headings from HTML content and create a hierarchical structure
 */
export function extractHeadings(
  html: string,
  maxDepth: number = 4,
): TableOfContentsHeading[] {
  if (typeof window === "undefined") {
    return []; // Return empty array during SSR
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // Find all headings (h1-h6)
  const headingElements = Array.from(
    doc.querySelectorAll("h1, h2, h3, h4, h5, h6"),
  ) as HTMLHeadingElement[];

  // Filter by max depth and ensure IDs exist
  const validHeadings = headingElements
    .filter((heading) => {
      const level = parseInt(heading.tagName.charAt(1), 10);
      return level <= maxDepth;
    })
    .map((heading, index) => {
      // Ensure heading has an ID
      if (!heading.id) {
        // eslint-disable-next-line no-param-reassign
        heading.id = `heading-${index}-${heading.textContent
          ?.toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\w-]/g, "")}`;
      }
      return {
        element: heading,
        id: heading.id,
        title: heading.textContent?.trim() || "",
        level: parseInt(heading.tagName.charAt(1), 10),
      };
    });

  // Build hierarchical structure
  const result: TableOfContentsHeading[] = [];
  const stack: TableOfContentsHeading[] = [];

  validHeadings.forEach((heading) => {
    const tocHeading: TableOfContentsHeading = {
      id: heading.id,
      title: heading.title,
      level: heading.level,
      children: [],
    };

    // Find the correct parent in the stack
    while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
      stack.pop();
    }

    if (stack.length === 0) {
      // This is a root-level heading
      result.push(tocHeading);
    } else {
      // This is a child heading
      const parent = stack[stack.length - 1];
      parent.children = parent.children || [];
      parent.children.push(tocHeading);
    }

    stack.push(tocHeading);
  });

  return result;
}

/**
 * Generate IDs for headings in HTML content if they don't exist
 */
export function ensureHeadingIds(html: string): string {
  if (typeof window === "undefined") {
    return html; // Return unchanged during SSR
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const headingElements = Array.from(
    doc.querySelectorAll("h1, h2, h3, h4, h5, h6"),
  ) as HTMLHeadingElement[];

  headingElements.forEach((heading, index) => {
    if (!heading.id) {
      const id = `heading-${index}-${heading.textContent
        ?.toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]/g, "")}`;
      // eslint-disable-next-line no-param-reassign
      heading.id = id;
    }
  });

  return doc.body.innerHTML;
}

/**
 * Calculate reading time based on content
 */
export function calculateReadingTime(
  html: string,
  wordsPerMinute: number = 200,
): number {
  if (typeof window === "undefined") {
    return 0; // Return 0 during SSR
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const text = doc.body.textContent || "";
  const wordCount = text.trim().split(/\s+/).length;

  return Math.ceil(wordCount / wordsPerMinute);
}
