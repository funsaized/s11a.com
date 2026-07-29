import { existsSync, readdirSync, readFileSync } from "fs";
import path from "path";
import matter from "gray-matter";

const contentRoot = path.resolve("src/content");
const staticRoot = path.resolve("static");
const requiredArticleFields = [
  "title",
  "slug",
  "excerpt",
  "date",
  "category",
  "tags",
  "readingTime",
  "featured",
  "author",
] as const;
const allowedCategories = new Set([
  "Backend",
  "Frontend",
  "Healthcare",
  "Architecture",
  "DevOps",
  "Database",
  "Cloud",
  "Security",
  "Productivity",
  "Writing",
]);

function findMdxFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return findMdxFiles(fullPath);
    return entry.name.endsWith(".mdx") ? [fullPath] : [];
  });
}

export function validateContent(): string[] {
  const errors: string[] = [];
  const slugs = new Map<string, string>();

  for (const filePath of findMdxFiles(contentRoot)) {
    const relativePath = path.relative(process.cwd(), filePath);
    const { data, content } = matter(readFileSync(filePath, "utf8"));
    const isArticle = filePath.includes(`${path.sep}articles${path.sep}`);

    if (isArticle) {
      for (const field of requiredArticleFields) {
        if (data[field] === undefined || data[field] === "") {
          errors.push(`${relativePath}: missing frontmatter field "${field}"`);
        }
      }
      if (data.category && !allowedCategories.has(String(data.category))) {
        errors.push(`${relativePath}: unsupported category "${data.category}"`);
      }
    }

    if (typeof data.slug !== "string" || !data.slug) {
      errors.push(`${relativePath}: missing slug`);
    } else if (slugs.has(data.slug)) {
      errors.push(
        `${relativePath}: duplicate slug "${data.slug}" (also in ${slugs.get(data.slug)})`,
      );
    } else {
      slugs.set(data.slug, relativePath);
    }

    if (data.date && Number.isNaN(Date.parse(String(data.date)))) {
      errors.push(`${relativePath}: invalid date "${data.date}"`);
    }

    for (const match of content.matchAll(/!\[[^\]]*]\((\/[^)\s]+)\)/g)) {
      const assetPath = path.join(staticRoot, match[1].replace(/^\//, ""));
      if (!existsSync(assetPath)) {
        errors.push(`${relativePath}: missing image ${match[1]}`);
      }
    }

    if (
      filePath.includes(`${path.sep}notes${path.sep}`) &&
      /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|(?:api[_-]?key|secret)\s*[:=]\s*["'][^"']{12,}/i.test(
        content,
      )
    ) {
      errors.push(`${relativePath}: possible secret in exported note`);
    }
  }

  return errors;
}

const errors = validateContent();
if (errors.length > 0) {
  console.error(`Content validation failed with ${errors.length} error(s):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log("Content validation passed.");
}
