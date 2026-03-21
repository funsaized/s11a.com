import { execFileSync } from "child_process";
import { unlinkSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

import type { RawNote } from "./types";

export function fetchAllNotes(): RawNote[] {
  const jxaScript = `
const notesApp = Application("Notes");

function isArchiveFolder(folderName) {
  if (!folderName) {
    return false;
  }

  const normalized = String(folderName).toLowerCase();
  const archivePatterns = ["archive", "archived", "archives", "old", "deleted", "trash", "backup"];
  for (let i = 0; i < archivePatterns.length; i += 1) {
    if (normalized.indexOf(archivePatterns[i]) !== -1) {
      return true;
    }
  }

  const hasArchiveWord = normalized.indexOf("archive") !== -1;
  const hasOldWord = normalized.indexOf("old") !== -1;
  const hasSkullEmoji = String(folderName).indexOf("\\u{1F480}") !== -1;
  const hasGrandmaEmoji = String(folderName).indexOf("\\u{1F475}") !== -1;
  const hasTrashEmoji = String(folderName).indexOf("\\u{1F5D1}") !== -1;

  if ((hasArchiveWord && (hasSkullEmoji || hasGrandmaEmoji)) || (hasOldWord && (hasSkullEmoji || hasTrashEmoji))) {
    return true;
  }

  return false;
}

const results = [];
let skippedProtectedNotes = 0;
const accounts = notesApp.accounts();

for (let accountIndex = 0; accountIndex < accounts.length; accountIndex += 1) {
  const account = accounts[accountIndex];
  const folders = account.folders();

  for (let folderIndex = 0; folderIndex < folders.length; folderIndex += 1) {
    const folder = folders[folderIndex];
    let folderName = "";

    try {
      folderName = String(folder.name());
    } catch (_folderError) {
      continue;
    }

    if (isArchiveFolder(folderName)) {
      continue;
    }

    const notes = folder.notes();

    for (let noteIndex = 0; noteIndex < notes.length; noteIndex += 1) {
      const note = notes[noteIndex];

      try {
        const id = String(note.id());
        const title = String(note.name() || "");
        const body = String(note.body() || "");
        const creationDateValue = note.creationDate();
        const modificationDateValue = note.modificationDate();

        if (!title || !body) {
          continue;
        }

        results.push({
          id: id,
          title: title,
          body: body,
          creationDate: creationDateValue ? new Date(creationDateValue).toISOString() : "",
          modificationDate: modificationDateValue ? new Date(modificationDateValue).toISOString() : "",
          folder: folderName,
        });
      } catch (error) {
        skippedProtectedNotes += 1;
      }
    }
  }
}

if (skippedProtectedNotes > 0) {
  console.error("Skipped protected or inaccessible notes: " + skippedProtectedNotes);
}

JSON.stringify(results);
`;

  const temporaryScriptPath = join(
    tmpdir(),
    `notes-export-${process.pid}-${Date.now()}.js`,
  );

  console.log("Fetching notes from Apple Notes...");

  try {
    writeFileSync(temporaryScriptPath, jxaScript, "utf8");

    const output = execFileSync(
      "osascript",
      ["-l", "JavaScript", temporaryScriptPath],
      {
        encoding: "utf8",
        timeout: 120000,
        maxBuffer: 512 * 1024 * 1024,
      },
    );

    const notes = JSON.parse(output) as RawNote[];
    console.log(`Found ${notes.length} notes`);

    // Deduplicate by note ID — JXA returns same note from multiple accounts/folders.
    // Prefer smart folders (Inbox, Knowledge Base, etc.) over the default "Notes" folder,
    // since smart folders represent the user's actual categorization.
    const noteById = new Map<string, RawNote>();
    for (const note of notes) {
      const existing = noteById.get(note.id);
      if (!existing) {
        noteById.set(note.id, note);
      } else if (existing.folder === "Notes" && note.folder !== "Notes") {
        // Replace default folder entry with the more specific smart folder
        noteById.set(note.id, note);
      }
    }
    const unique = [...noteById.values()];
    const duplicateCount = notes.length - unique.length;
    if (duplicateCount > 0) {
      console.log(
        `Found ${unique.length} unique notes (${duplicateCount} duplicates removed)`,
      );
    }
    return unique;
  } catch (error) {
    const execError = error as {
      stderr?: string | Buffer;
      message?: string;
    };

    const stderr = execError.stderr ? execError.stderr.toString() : undefined;
    const message = stderr || execError.message || String(error);

    throw new Error(`Failed to fetch notes from Apple Notes: ${message}`);
  } finally {
    try {
      unlinkSync(temporaryScriptPath);
    } catch (_cleanupError) {}
  }
}
