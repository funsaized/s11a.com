import {
  filterNotes,
  extractTags,
  getCategory,
  folderToCategory,
} from "./filter";
import { generateFrontmatter, generateSlug } from "./frontmatter";
import {
  extractImages,
  writeImages,
  restoreImagePlaceholders,
} from "./image-processor";
import { fetchAllNotes } from "./jxa-bridge";
import { htmlToMarkdown } from "./md-converter";
import { atomicWriteNotes } from "./writer";
import type { NoteToWrite } from "./writer";
import type { ExportConfig, ProcessedImage } from "./types";

const config: ExportConfig = {
  notesDir: "src/content/notes",
  imageDir: "static/images/articles",
  excludeTags: ["private", "work"],
  author: "Sai Nimmagadda",
  dryRun: process.argv.includes("--dry-run"),
  verbose: process.argv.includes("--verbose"),
};

async function main(): Promise<void> {
  console.log("Starting Apple Notes export...");

  let allNotes;
  try {
    allNotes = fetchAllNotes();
  } catch (err) {
    console.error(
      `Fatal: Failed to fetch notes from Apple Notes: ${err instanceof Error ? err.message : String(err)}`,
    );
    process.exit(1);
  }

  const { exported, stats } = filterNotes(allNotes, config);
  console.log(
    `Found ${stats.total} notes: ${stats.archived} archived, ${stats.private} private/personal, ${stats.untagged} untagged -> Exporting ${stats.exported}`,
  );

  if (config.dryRun) {
    console.log("\nDry run -- no files written.");
    console.log("\nSample notes to export:");
    exported.slice(0, 5).forEach((note) => {
      const tags = extractTags(note.body);
      console.log(`  - ${note.title} [${tags.slice(0, 3).join(", ")}]`);
    });
    return;
  }

  const notesToWrite: NoteToWrite[] = [];
  const existingSlugs = new Set<string>();
  const allImages: { images: ProcessedImage[]; imageDir: string } = {
    images: [],
    imageDir: config.imageDir,
  };
  const errors: string[] = [];

  for (const note of exported) {
    try {
      const tags = extractTags(note.body);
      const slug = generateSlug(note.title, existingSlugs);
      existingSlugs.add(slug);

      const { images, updatedHtml } = await extractImages(note.body, slug);
      const markdown = htmlToMarkdown(updatedHtml);
      const markdownWithImages = restoreImagePlaceholders(markdown);
      const category = folderToCategory(note.folder);
      const frontmatter = generateFrontmatter(
        note,
        tags,
        markdownWithImages,
        slug,
        category,
      );

      if (config.verbose) {
        console.log(
          `  ✓ ${note.title} -> ${category}/${slug}.mdx (${images.length} images)`,
        );
      }

      notesToWrite.push({
        frontmatter,
        markdown: markdownWithImages,
        category,
        slug,
        images,
      });
      allImages.images.push(...images);
    } catch (err) {
      const msg = `Failed to process note "${note.title}": ${err instanceof Error ? err.message : String(err)}`;
      console.warn(`  ✗ ${msg}`);
      errors.push(msg);
    }
  }

  if (allImages.images.length > 0) {
    writeImages(allImages.images, allImages.imageDir);
  }

  try {
    atomicWriteNotes(notesToWrite, config);
  } catch (err) {
    console.error(
      `Fatal: Failed to write notes: ${err instanceof Error ? err.message : String(err)}`,
    );
    process.exit(1);
  }

  const categories = new Set(notesToWrite.map((n) => n.category)).size;
  console.log(
    `\nExport complete: ${notesToWrite.length} notes, ${allImages.images.length} images, ${categories} categories`,
  );

  if (errors.length > 0) {
    console.warn(`\nWarnings (${errors.length} notes skipped):`);
    errors.forEach((e) => console.warn(`  - ${e}`));
  }
}

main().catch((err) => {
  console.error(
    "Fatal error:",
    err instanceof Error ? err.message : String(err),
  );
  process.exit(1);
});
