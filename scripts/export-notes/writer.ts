import { existsSync, mkdirSync, renameSync, rmSync, writeFileSync } from "fs";
import path from "path";
import type { ExportConfig, ProcessedImage } from "./types";

export interface NoteToWrite {
  frontmatter: string;
  markdown: string;
  category: string;
  slug: string;
  images: ProcessedImage[];
}

export function validateMdx(content: string): {
  valid: boolean;
  errors: string[];
  fixed: string;
} {
  const errors: string[] = [];
  let fixed = content;

  const firstMarker = fixed.indexOf("---");
  const fmEnd =
    firstMarker === 0 ? fixed.indexOf("\n---\n", firstMarker + 3) : -1;
  if (fmEnd === -1) {
    return { valid: true, errors, fixed };
  }

  const frontmatter = fixed.slice(0, fmEnd + 5);
  const body = fixed.slice(fmEnd + 5);
  const lines = body.split("\n");
  const processedLines: string[] = [];
  let inCode = false;

  for (const line of lines) {
    if (line.trimStart().startsWith("```")) {
      inCode = !inCode;
      processedLines.push(line);
      continue;
    }

    if (inCode) {
      processedLines.push(line);
      continue;
    }

    let processed = line;

    if (
      processed.includes("{") &&
      !processed.includes("{/*") &&
      !processed.includes("\\{")
    ) {
      processed = processed.replace(/\{/g, "\\{").replace(/\}/g, "\\}");
      errors.push(`Auto-fixed braces in line: ${line.slice(0, 50)}`);
    }

    processed = processed.replace(
      /< ?(\d)/g,
      (_match, n: string) => `&lt;${n}`,
    );
    processedLines.push(processed);
  }

  fixed = frontmatter + processedLines.join("\n");
  return { valid: true, errors, fixed };
}

export function atomicWriteNotes(
  notes: NoteToWrite[],
  config: ExportConfig,
): void {
  const timestamp = Date.now();
  const notesDir = config.notesDir;
  const parentDir = path.dirname(notesDir);
  const tmpDir = path.join(parentDir, `.tmp-notes-export-${timestamp}`);
  const oldDir = path.join(parentDir, `.old-notes-${timestamp}`);

  mkdirSync(tmpDir, { recursive: true });

  for (const note of notes) {
    const categoryDir = path.join(tmpDir, note.category.toLowerCase());
    mkdirSync(categoryDir, { recursive: true });

    const { fixed, errors } = validateMdx(
      `${note.frontmatter}\n${note.markdown}`,
    );
    if (errors.length > 0) {
      console.warn(`MDX auto-fixed for ${note.slug}: ${errors.join("; ")}`);
    }

    writeFileSync(path.join(categoryDir, `${note.slug}.mdx`), fixed, "utf8");
  }

  try {
    if (existsSync(notesDir)) {
      renameSync(notesDir, oldDir);
    }

    try {
      renameSync(tmpDir, notesDir);
    } catch (swapErr) {
      if (existsSync(oldDir)) {
        renameSync(oldDir, notesDir);
      }
      throw new Error(`Atomic swap failed, rolled back: ${swapErr}`);
    }

    rmSync(oldDir, { recursive: true, force: true });
  } catch (err) {
    if (existsSync(tmpDir)) {
      rmSync(tmpDir, { recursive: true, force: true });
    }
    throw err;
  }

  const categories = new Set(notes.map((note) => note.category.toLowerCase()))
    .size;
  console.log(`Wrote ${notes.length} notes across ${categories} categories`);
}
