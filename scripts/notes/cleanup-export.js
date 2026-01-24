#!/usr/bin/env node

/**
 * Cleanup Export Script for Gatsby Blog
 *
 * This script clears the exporter/output/ directory, removing all
 * exported content after it has been synced to the main content directory.
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const EXPORTER_OUTPUT_DIR = path.join(__dirname, "../../output");

/**
 * Get directory size and file count recursively
 */
function getDirectoryStats(dirPath) {
  let totalSize = 0;
  let fileCount = 0;
  let dirCount = 0;

  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        dirCount++;
        const subStats = getDirectoryStats(fullPath);
        totalSize += subStats.size;
        fileCount += subStats.files;
        dirCount += subStats.directories;
      } else {
        fileCount++;
        const stats = fs.statSync(fullPath);
        totalSize += stats.size;
      }
    }

    return { size: totalSize, files: fileCount, directories: dirCount };
  } catch (error) {
    return { size: 0, files: 0, directories: 0 };
  }
}

/**
 * Format bytes to human readable format
 */
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/**
 * Remove directory recursively
 */
function removeDirectorySync(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return { success: true, message: "Directory does not exist" };
  }

  try {
    fs.rmSync(dirPath, { recursive: true, force: true });
    return { success: true, message: "Directory removed successfully" };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

/**
 * List and analyze export folders
 */
function analyzeExportFolders() {
  try {
    if (!fs.existsSync(EXPORTER_OUTPUT_DIR)) {
      return {
        folders: [],
        totalSize: 0,
        totalFiles: 0,
        totalDirectories: 0,
        exists: false,
      };
    }

    const entries = fs
      .readdirSync(EXPORTER_OUTPUT_DIR, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => {
        const folderPath = path.join(EXPORTER_OUTPUT_DIR, dirent.name);
        const stats = getDirectoryStats(folderPath);
        const folderStats = fs.statSync(folderPath);

        return {
          name: dirent.name,
          path: folderPath,
          size: stats.size,
          files: stats.files,
          directories: stats.directories,
          created: folderStats.birthtime,
          modified: folderStats.mtime,
        };
      })
      .sort((a, b) => b.modified - a.modified); // Sort by modification time, newest first

    const totals = entries.reduce(
      (acc, folder) => ({
        totalSize: acc.totalSize + folder.size,
        totalFiles: acc.totalFiles + folder.files,
        totalDirectories: acc.totalDirectories + folder.directories,
      }),
      { totalSize: 0, totalFiles: 0, totalDirectories: 0 },
    );

    return {
      folders: entries,
      ...totals,
      exists: true,
    };
  } catch (error) {
    console.error("❌ Error analyzing export folders:", error.message);
    return {
      folders: [],
      totalSize: 0,
      totalFiles: 0,
      totalDirectories: 0,
      exists: false,
      error: error.message,
    };
  }
}

/**
 * Interactive confirmation
 */
function confirmCleanup(analysis) {
  if (analysis.folders.length === 0) {
    console.log(
      "✅ Export output directory is already empty or does not exist.",
    );
    return false;
  }

  console.log("\n📊 Export Directory Analysis:");
  console.log(`   Location: ${EXPORTER_OUTPUT_DIR}`);
  console.log(`   Total folders: ${analysis.folders.length}`);
  console.log(`   Total files: ${analysis.totalFiles}`);
  console.log(`   Total directories: ${analysis.totalDirectories}`);
  console.log(`   Total size: ${formatBytes(analysis.totalSize)}`);

  console.log("\n📁 Export folders found:");
  analysis.folders.forEach((folder, index) => {
    const age = new Date() - folder.modified;
    const ageStr =
      age < 86400000
        ? `${Math.round(age / 3600000)}h ago`
        : `${Math.round(age / 86400000)}d ago`;

    console.log(`   ${index + 1}. ${folder.name}`);
    console.log(
      `      Size: ${formatBytes(folder.size)} | Files: ${folder.files} | Modified: ${ageStr}`,
    );
  });

  console.log(
    "\n⚠️  WARNING: This action will permanently delete all export folders and their contents!",
  );
  console.log(
    "   Make sure you have already synced any needed content using `npm run notes:sync`",
  );

  // In a real interactive environment, you'd use readline
  // For now, we'll require an explicit --force flag
  const forceFlag =
    process.argv.includes("--force") || process.argv.includes("-f");

  if (!forceFlag) {
    console.log("\n❌ Cleanup cancelled. To proceed, run with --force flag:");
    console.log("   npm run notes:cleanup -- --force");
    return false;
  }

  return true;
}

/**
 * Perform cleanup
 */
function performCleanup(analysis) {
  console.log("\n🧹 Starting cleanup process...");

  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  for (const folder of analysis.folders) {
    console.log(`\n🗑️  Removing: ${folder.name}`);
    const result = removeDirectorySync(folder.path);

    if (result.success) {
      successCount++;
      console.log(
        `   ✅ Removed (${formatBytes(folder.size)}, ${folder.files} files)`,
      );
    } else {
      errorCount++;
      errors.push({ folder: folder.name, error: result.message });
      console.log(`   ❌ Failed: ${result.message}`);
    }
  }

  // Clean up empty parent directory if all folders were removed successfully
  if (successCount === analysis.folders.length && errorCount === 0) {
    try {
      // Check if directory is now empty
      const remainingEntries = fs.readdirSync(EXPORTER_OUTPUT_DIR);
      if (remainingEntries.length === 0) {
        console.log(`\n📁 Export directory is now empty`);
      }
    } catch (error) {
      console.log(
        `\n⚠️  Note: Could not check final directory state: ${error.message}`,
      );
    }
  }

  // Summary
  console.log("\n📊 Cleanup Summary:");
  console.log(`   Successfully removed: ${successCount} folders`);
  console.log(`   Errors: ${errorCount} folders`);
  console.log(`   Total space freed: ${formatBytes(analysis.totalSize)}`);

  if (errors.length > 0) {
    console.log("\n❌ Errors encountered:");
    errors.forEach(({ folder, error }) => {
      console.log(`   - ${folder}: ${error}`);
    });
  }

  if (successCount > 0) {
    console.log("\n✅ Cleanup completed successfully!");
  }
}

/**
 * Validate environment
 */
function validateEnvironment() {
  const errors = [];

  // Check if we're in the right directory
  const packageJsonPath = path.join(process.cwd(), "package.json");
  if (!fs.existsSync(packageJsonPath)) {
    errors.push(
      "package.json not found. Please run this script from the project root.",
    );
  }

  if (errors.length > 0) {
    console.error("❌ Environment validation failed:");
    errors.forEach((error) => console.error(`   - ${error}`));
    process.exit(1);
  }
}

/**
 * Show help
 */
function showHelp() {
  console.log("🧹 Export Cleanup Script\n");
  console.log("Usage:");
  console.log(
    "  npm run notes:cleanup           - Show analysis and require confirmation",
  );
  console.log(
    "  npm run notes:cleanup -- --force - Force cleanup without confirmation",
  );
  console.log("  npm run notes:cleanup -- --help  - Show this help message");
  console.log("\nDescription:");
  console.log(
    "  This script removes all exported content from exporter/output/ directory.",
  );
  console.log(
    "  Make sure to sync your content first using `npm run notes:sync`",
  );
}

/**
 * Main execution
 */
function main() {
  // Check for help flag
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    showHelp();
    return;
  }

  console.log("🧹 Starting Export Cleanup Process...\n");

  // Validate environment
  validateEnvironment();

  // Analyze current state
  console.log("🔍 Analyzing export directory...");
  const analysis = analyzeExportFolders();

  if (analysis.error) {
    console.error(`❌ Failed to analyze export directory: ${analysis.error}`);
    process.exit(1);
  }

  if (!analysis.exists) {
    console.log(
      "✅ Export output directory does not exist. Nothing to clean up.",
    );
    return;
  }

  // Confirm cleanup
  if (!confirmCleanup(analysis)) {
    return;
  }

  // Perform cleanup
  performCleanup(analysis);

  console.log("\n🎉 Cleanup process completed!");
}

// Execute if called directly
if (require.main === module) {
  main();
}

module.exports = {
  analyzeExportFolders,
  performCleanup,
  getDirectoryStats,
  formatBytes,
};
