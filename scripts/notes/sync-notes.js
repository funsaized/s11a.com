#!/usr/bin/env node

/**
 * Sync Notes Script for Gatsby Blog
 * 
 * This script moves exported attachments and notes from the latest 
 * exporter/output/XXX folder to src/content/notes, performing a drop-in
 * replacement of existing files and folders.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const EXPORTER_OUTPUT_DIR = path.join(__dirname, '../../exporter/output');
const CONTENT_NOTES_DIR = path.join(__dirname, '../../src/content/notes');

/**
 * Find the latest export folder by timestamp
 */
function findLatestExportFolder() {
  try {
    if (!fs.existsSync(EXPORTER_OUTPUT_DIR)) {
      throw new Error(`Exporter output directory does not exist: ${EXPORTER_OUTPUT_DIR}`);
    }

    const folders = fs.readdirSync(EXPORTER_OUTPUT_DIR, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => ({
        name: dirent.name,
        path: path.join(EXPORTER_OUTPUT_DIR, dirent.name),
        stats: fs.statSync(path.join(EXPORTER_OUTPUT_DIR, dirent.name))
      }))
      .sort((a, b) => b.stats.mtime - a.stats.mtime); // Sort by modification time, newest first

    if (folders.length === 0) {
      throw new Error('No export folders found in exporter/output directory');
    }

    console.log(`Found ${folders.length} export folder(s). Using latest: ${folders[0].name}`);
    return folders[0];

  } catch (error) {
    console.error('❌ Error finding latest export folder:', error.message);
    process.exit(1);
  }
}

/**
 * Copy directory recursively with overwrite
 */
function copyDirectorySync(src, dest) {
  try {
    // Create destination directory if it doesn't exist
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });
    let filesCopied = 0;
    let directoriesCopied = 0;

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        const result = copyDirectorySync(srcPath, destPath);
        filesCopied += result.files;
        directoriesCopied += result.directories + 1;
      } else {
        fs.copyFileSync(srcPath, destPath);
        filesCopied++;
      }
    }

    return { files: filesCopied, directories: directoriesCopied };

  } catch (error) {
    console.error(`❌ Error copying directory ${src} to ${dest}:`, error.message);
    throw error;
  }
}

/**
 * Sync notes and attachments from export folder
 */
function syncNotesAndAttachments(exportFolder) {
  const notesSourceDir = path.join(exportFolder.path, 'notes');
  const attachmentsSourceDir = path.join(exportFolder.path, 'attachments');

  console.log('\n📁 Syncing exported content...');
  console.log(`Source: ${exportFolder.path}`);
  console.log(`Destination: ${CONTENT_NOTES_DIR}`);

  let totalFiles = 0;
  let totalDirectories = 0;

  try {
    // Ensure destination directory exists
    if (!fs.existsSync(CONTENT_NOTES_DIR)) {
      fs.mkdirSync(CONTENT_NOTES_DIR, { recursive: true });
      console.log(`✅ Created destination directory: ${CONTENT_NOTES_DIR}`);
    }

    // Sync notes if they exist
    if (fs.existsSync(notesSourceDir)) {
      console.log('\n📝 Syncing notes...');
      const notesResult = copyDirectorySync(notesSourceDir, CONTENT_NOTES_DIR);
      totalFiles += notesResult.files;
      totalDirectories += notesResult.directories;
      console.log(`✅ Copied ${notesResult.files} notes files and ${notesResult.directories} directories`);
    } else {
      console.log('⚠️  No notes directory found in export folder');
    }

    // Sync attachments if they exist
    if (fs.existsSync(attachmentsSourceDir)) {
      console.log('\n🔗 Syncing attachments...');
      const attachmentsDestDir = path.join(CONTENT_NOTES_DIR, 'attachments');
      const attachmentsResult = copyDirectorySync(attachmentsSourceDir, attachmentsDestDir);
      totalFiles += attachmentsResult.files;
      totalDirectories += attachmentsResult.directories;
      console.log(`✅ Copied ${attachmentsResult.files} attachment files and ${attachmentsResult.directories} directories`);
    } else {
      console.log('⚠️  No attachments directory found in export folder');
    }

    // Summary
    console.log('\n📊 Sync Summary:');
    console.log(`   Files copied: ${totalFiles}`);
    console.log(`   Directories created/updated: ${totalDirectories}`);
    console.log(`   Source: ${exportFolder.name}`);
    console.log(`   Destination: src/content/notes/`);
    console.log('\n✅ Notes sync completed successfully!');

  } catch (error) {
    console.error('❌ Error during sync:', error.message);
    process.exit(1);
  }
}

/**
 * Validate source directories
 */
function validateEnvironment() {
  const errors = [];

  // Check if we're in the right directory
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    errors.push('package.json not found. Please run this script from the project root.');
  }

  // Check if exporter directory exists
  if (!fs.existsSync(EXPORTER_OUTPUT_DIR)) {
    errors.push(`Exporter output directory not found: ${EXPORTER_OUTPUT_DIR}`);
  }

  if (errors.length > 0) {
    console.error('❌ Environment validation failed:');
    errors.forEach(error => console.error(`   - ${error}`));
    process.exit(1);
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🚀 Starting Notes Sync Process...\n');

  // Validate environment
  validateEnvironment();

  // Find latest export folder
  const latestExport = findLatestExportFolder();

  // Sync notes and attachments
  syncNotesAndAttachments(latestExport);

  console.log('\n🎉 All operations completed successfully!');
  console.log('\nNext steps:');
  console.log('   1. Review the synced content in src/content/notes/');
  console.log('   2. Run `npm run build` to rebuild the site');
  console.log('   3. Optionally run `npm run notes:cleanup` to clear exporter output');
}

// Execute if called directly
if (require.main === module) {
  main();
}

module.exports = { findLatestExportFolder, syncNotesAndAttachments, copyDirectorySync };