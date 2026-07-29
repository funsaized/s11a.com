import assert from "node:assert/strict";
import test from "node:test";
import {
  extractTags,
  filterNotes,
  folderToCategory,
} from "../scripts/export-notes/filter";
import { generateSlug } from "../scripts/export-notes/frontmatter";
import { isSafeRemoteImageUrl } from "../scripts/export-notes/image-processor";
import type { ExportConfig, RawNote } from "../scripts/export-notes/types";

const config: ExportConfig = {
  notesDir: "src/content/notes",
  imageDir: "static/images/articles",
  excludeTags: ["private", "work"],
  author: "Sai Nimmagadda",
  dryRun: true,
  verbose: false,
};

const note = (body: string, folder = "Inbox"): RawNote => ({
  id: "1",
  title: "Example",
  body,
  folder,
  creationDate: "2026-01-01T00:00:00.000Z",
  modificationDate: "2026-01-01T00:00:00.000Z",
});

test("extractTags ignores URL fragments and normalizes tags", () => {
  assert.deepEqual(
    extractTags("<p>#Private #ideas https://example.com/#ignored</p>"),
    ["private", "ideas"],
  );
});

test("filterNotes excludes private tags and protected folders", () => {
  const result = filterNotes(
    [note("<p>#private</p>"), note("<p>public</p>", "Work"), note("<p>ok</p>")],
    config,
  );
  assert.equal(result.exported.length, 1);
  assert.equal(result.stats.private, 1);
  assert.equal(result.stats.archived, 1);
});

test("generateSlug normalizes text and resolves collisions", () => {
  assert.equal(generateSlug("Café & APIs"), "cafe-apis");
  assert.equal(
    generateSlug("Café & APIs", new Set(["cafe-apis"])),
    "cafe-apis-2",
  );
});

test("folder names become stable categories", () => {
  assert.equal(folderToCategory("📋 Planning & Strategy"), "Planning-Strategy");
});

test("remote image downloads reject insecure and private hosts", () => {
  assert.equal(isSafeRemoteImageUrl("https://images.example.com/a.png"), true);
  assert.equal(isSafeRemoteImageUrl("http://images.example.com/a.png"), false);
  assert.equal(isSafeRemoteImageUrl("https://127.0.0.1/a.png"), false);
  assert.equal(isSafeRemoteImageUrl("https://192.168.1.2/a.png"), false);
});
