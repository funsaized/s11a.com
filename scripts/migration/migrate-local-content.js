#!/usr/bin/env node

/**
 * Local Content Migration Script for s11a.com Blog
 *
 * This script migrates existing local markdown content to the new Gatsby + MDX format.
 * It handles:
 * - Reading markdown files from local directory structure
 * - Standardizing frontmatter format
 * - Converting markdown to MDX
 * - Processing and copying images
 * - Validating migrated content
 */

const fs = require("fs").promises;
const path = require("path");
const matter = require("gray-matter");
const slugify = require("slugify");

// Configuration
const CONFIG = {
  sourceDir:
    "/Users/saiguy/Documents/programming/snimmagadda1/s11a.com/content",
  outputDir: path.join(__dirname, "../../src/content/articles"),
  imageSourceDir:
    "/Users/saiguy/Documents/programming/snimmagadda1/s11a.com/content",
  imageOutputDir: path.join(__dirname, "../../static/images/articles"),
  dryRun: process.argv.includes("--dry-run"),
  verbose: process.argv.includes("--verbose"),
  force: process.argv.includes("--force"),
};

// Category mapping from old site to new structure
const CATEGORY_MAPPING = {
  test3: "Backend",
  Code: "Backend",
  Backend: "Backend",
  Cloud: "Cloud",
  Personal: "Personal",
  Frontend: "Frontend",
  "web-development": "Frontend",
  javascript: "Frontend",
  react: "Frontend",
  vue: "Frontend",
  angular: "Frontend",
  healthcare: "Healthcare",
  security: "Security",
  devops: "DevOps",
  database: "Database",
};

// Tag standardization
const TAG_STANDARDIZATION = {
  javascript: "JavaScript",
  "node.js": "Node.js",
  nodejs: "Node.js",
  react: "React",
  reactjs: "React",
  vue: "Vue.js",
  vuejs: "Vue.js",
  angular: "Angular",
  typescript: "TypeScript",
  ts: "TypeScript",
};

// Utility functions
const log = (message, level = "info") => {
  const timestamp = new Date().toISOString();
  const prefix =
    level === "error"
      ? "❌"
      : level === "warn"
        ? "⚠️"
        : level === "success"
          ? "✅"
          : "ℹ️";
  console.log(`${prefix} [${timestamp}] ${message}`);
};

const verbose = (message) => {
  if (CONFIG.verbose) {
    log(message, "info");
  }
};

// Generate reading time estimate
const calculateReadingTime = (content) => {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
};

// Generate slug from title
const generateSlug = (title) => {
  return slugify(title, {
    lower: true,
    strict: true,
    remove: /[*+~.()'\"!:@]/g,
  });
};

// Parse date from directory name (MM-DD-YYYY)
const parseDateFromDirectory = (dirName) => {
  const dateMatch = dirName.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (dateMatch) {
    const [, month, day, year] = dateMatch;
    const date = new Date(year, month - 1, day);
    return date.toISOString().split("T")[0];
  }
  return new Date().toISOString().split("T")[0];
};

// Standardize category
const standardizeCategory = (category, categories = []) => {
  // Use the main category first
  if (category && CATEGORY_MAPPING[category]) {
    return CATEGORY_MAPPING[category];
  }

  // Fall back to categories array
  for (const cat of categories) {
    if (CATEGORY_MAPPING[cat]) {
      return CATEGORY_MAPPING[cat];
    }
  }

  return "Backend"; // Default fallback
};

// Standardize tags
const standardizeTags = (tags = []) => {
  return tags
    .map((tag) => {
      const normalized = tag.toLowerCase();
      return TAG_STANDARDIZATION[normalized] || tag;
    })
    .filter(Boolean);
};

// Extract and clean frontmatter
const extractFrontmatter = (data, content, dirName) => {
  const publishDate = parseDateFromDirectory(dirName);
  const category = standardizeCategory(data.category, data.categories || []);
  const tags = standardizeTags(data.tags || []);

  return {
    title: data.title || "Untitled",
    slug: data.slug || generateSlug(data.title || "untitled"),
    excerpt: data.excerpt || data.description || "",
    date: publishDate,
    category: category,
    tags: tags,
    readingTime: calculateReadingTime(content),
    featured: data.featured || false,
    author: data.author || "Sai Nimmagadda",
    thumbnail: data.thumbnail || null,
    cover: data.cover || null,
  };
};

// Process image references in content
const processImageReferences = (content, sourceDir) => {
  // Replace relative image paths with absolute paths for static directory
  let processedContent = content;

  // Replace ../images/ with /images/articles/
  processedContent = processedContent.replace(
    /\.\.\/images\//g,
    "/images/articles/",
  );

  // Replace ../thumbnails/ with /images/articles/thumbnails/
  processedContent = processedContent.replace(
    /\.\.\/thumbnails\//g,
    "/images/articles/thumbnails/",
  );

  return processedContent;
};

// Scan content directory for markdown files
const scanContentDirectory = async () => {
  try {
    verbose("Scanning content directory...");

    const articles = [];
    const entries = await fs.readdir(CONFIG.sourceDir, { withFileTypes: true });

    // Filter for date-based directories (format: MM-DD-YYYY)
    const dateDirs = entries.filter(
      (entry) =>
        entry.isDirectory() && /^\d{1,2}-\d{1,2}-\d{4}$/.test(entry.name),
    );

    for (const dirEntry of dateDirs) {
      const dirPath = path.join(CONFIG.sourceDir, dirEntry.name);
      const indexPath = path.join(dirPath, "index.md");

      try {
        const stat = await fs.stat(indexPath);
        if (stat.isFile()) {
          const fileContent = await fs.readFile(indexPath, "utf8");
          const { data, content } = matter(fileContent);

          const frontmatter = extractFrontmatter(data, content, dirEntry.name);

          articles.push({
            sourceDir: dirPath,
            sourcePath: indexPath,
            frontmatter,
            content: content.trim(),
            dirName: dirEntry.name,
          });

          verbose(`Found article: ${frontmatter.title}`);
        }
      } catch (error) {
        log(`Warning: Could not read ${indexPath}: ${error.message}`, "warn");
      }
    }

    // Sort by date (newest first)
    articles.sort(
      (a, b) => new Date(b.frontmatter.date) - new Date(a.frontmatter.date),
    );

    log(`Found ${articles.length} articles to migrate`, "success");
    return articles;
  } catch (error) {
    log(`Error scanning content directory: ${error.message}`, "error");
    return [];
  }
};

// Copy images from source to destination
const copyImages = async (sourceDir) => {
  try {
    const imagesDir = path.join(sourceDir, "images");
    const thumbnailsDir = path.join(sourceDir, "thumbnails");

    // Check if images directory exists
    try {
      await fs.access(imagesDir);
      const imageFiles = await fs.readdir(imagesDir);

      for (const file of imageFiles) {
        const sourcePath = path.join(imagesDir, file);
        const destPath = path.join(CONFIG.imageOutputDir, file);

        if (!CONFIG.dryRun) {
          await fs.mkdir(path.dirname(destPath), { recursive: true });
          await fs.copyFile(sourcePath, destPath);
          verbose(`Copied image: ${file}`);
        } else {
          verbose(`[DRY RUN] Would copy image: ${file}`);
        }
      }
    } catch (error) {
      verbose(`No images directory found in ${sourceDir}`);
    }

    // Check if thumbnails directory exists
    try {
      await fs.access(thumbnailsDir);
      const thumbnailFiles = await fs.readdir(thumbnailsDir);

      const thumbnailDestDir = path.join(CONFIG.imageOutputDir, "thumbnails");

      for (const file of thumbnailFiles) {
        const sourcePath = path.join(thumbnailsDir, file);
        const destPath = path.join(thumbnailDestDir, file);

        if (!CONFIG.dryRun) {
          await fs.mkdir(path.dirname(destPath), { recursive: true });
          await fs.copyFile(sourcePath, destPath);
          verbose(`Copied thumbnail: ${file}`);
        } else {
          verbose(`[DRY RUN] Would copy thumbnail: ${file}`);
        }
      }
    } catch (error) {
      verbose(`No thumbnails directory found in ${sourceDir}`);
    }
  } catch (error) {
    log(`Error copying images: ${error.message}`, "error");
  }
};

// Copy all images from the main content directory
const copyAllImages = async () => {
  try {
    // Copy content images and thumbnails
    const contentImagesDir = path.join(CONFIG.sourceDir, "images");
    const contentThumbnailsDir = path.join(CONFIG.sourceDir, "thumbnails");

    // Copy content images
    try {
      await fs.access(contentImagesDir);
      const files = await fs.readdir(contentImagesDir);

      log(`Copying ${files.length} images from content directory...`, "info");

      for (const file of files) {
        const sourcePath = path.join(contentImagesDir, file);
        const destPath = path.join(CONFIG.imageOutputDir, file);

        if (!CONFIG.dryRun) {
          await fs.mkdir(path.dirname(destPath), { recursive: true });
          await fs.copyFile(sourcePath, destPath);
          verbose(`Copied content image: ${file}`);
        } else {
          verbose(`[DRY RUN] Would copy content image: ${file}`);
        }
      }
    } catch (error) {
      log(`No content images directory found`, "warn");
    }

    // Copy content thumbnails
    try {
      await fs.access(contentThumbnailsDir);
      const files = await fs.readdir(contentThumbnailsDir);
      const thumbnailDestDir = path.join(CONFIG.imageOutputDir, "thumbnails");

      log(
        `Copying ${files.length} thumbnails from content directory...`,
        "info",
      );

      for (const file of files) {
        const sourcePath = path.join(contentThumbnailsDir, file);
        const destPath = path.join(thumbnailDestDir, file);

        if (!CONFIG.dryRun) {
          await fs.mkdir(path.dirname(destPath), { recursive: true });
          await fs.copyFile(sourcePath, destPath);
          verbose(`Copied content thumbnail: ${file}`);
        } else {
          verbose(`[DRY RUN] Would copy content thumbnail: ${file}`);
        }
      }
    } catch (error) {
      log(`No content thumbnails directory found`, "warn");
    }

    // Also copy any additional images from src/images
    try {
      const srcImagesDir = path.join(CONFIG.sourceDir, "..", "src", "images");
      await fs.access(srcImagesDir);
      const files = await fs.readdir(srcImagesDir);

      for (const file of files) {
        const sourcePath = path.join(srcImagesDir, file);
        const destPath = path.join(CONFIG.imageOutputDir, file);

        if (!CONFIG.dryRun) {
          await fs.mkdir(path.dirname(destPath), { recursive: true });
          await fs.copyFile(sourcePath, destPath);
          verbose(`Copied src image: ${file}`);
        } else {
          verbose(`[DRY RUN] Would copy src image: ${file}`);
        }
      }
    } catch (error) {
      verbose(`No src images directory found`);
    }
  } catch (error) {
    log(`Error copying global images: ${error.message}`, "error");
  }
};

// Migrate a single article
const migrateArticle = async (article) => {
  try {
    verbose(`Processing article: ${article.frontmatter.title}`);

    // Process content and image references
    const processedContent = processImageReferences(
      article.content,
      article.sourceDir,
    );

    // Copy any article-specific images
    await copyImages(article.sourceDir);

    // Create frontmatter YAML
    const frontmatterYaml = `---
title: "${article.frontmatter.title.replace(/"/g, '\\"')}"
slug: "${article.frontmatter.slug}"
excerpt: "${article.frontmatter.excerpt.replace(/"/g, '\\"')}"
date: "${article.frontmatter.date}"
category: "${article.frontmatter.category}"
tags: ${JSON.stringify(article.frontmatter.tags)}
readingTime: "${article.frontmatter.readingTime}"
featured: ${article.frontmatter.featured}
author: "${article.frontmatter.author}"
---

`;

    // Combine frontmatter and content
    const finalContent = frontmatterYaml + processedContent;

    // Write to file
    if (!CONFIG.dryRun) {
      const fileName = `${article.frontmatter.slug}.mdx`;
      const filePath = path.join(CONFIG.outputDir, fileName);

      // Check if file exists and not forcing
      if (!CONFIG.force) {
        try {
          await fs.access(filePath);
          log(
            `Skipping existing file: ${fileName} (use --force to overwrite)`,
            "warn",
          );
          return false;
        } catch (error) {
          // File doesn't exist, continue
        }
      }

      await fs.mkdir(CONFIG.outputDir, { recursive: true });
      await fs.writeFile(filePath, finalContent, "utf8");

      log(`✓ Migrated: ${article.frontmatter.title} -> ${fileName}`, "success");
    } else {
      log(`[DRY RUN] Would migrate: ${article.frontmatter.title}`, "info");
    }

    return true;
  } catch (error) {
    log(
      `Error migrating ${article.frontmatter.title}: ${error.message}`,
      "error",
    );
    return false;
  }
};

// Validate migrated content
const validateContent = async () => {
  try {
    log("Validating migrated content...", "info");

    const files = await fs.readdir(CONFIG.outputDir);
    const mdxFiles = files.filter((file) => file.endsWith(".mdx"));

    let validCount = 0;
    let errorCount = 0;

    for (const file of mdxFiles) {
      const filePath = path.join(CONFIG.outputDir, file);
      const content = await fs.readFile(filePath, "utf8");

      // Basic validation
      const hasFrontmatter = content.startsWith("---");
      const hasTitle = content.includes("title:");
      const hasContent = content.split("---").length > 2;

      if (hasFrontmatter && hasTitle && hasContent) {
        validCount++;
        verbose(`✓ Valid: ${file}`);
      } else {
        errorCount++;
        log(`✗ Invalid: ${file}`, "warn");
      }
    }

    log(
      `Validation complete: ${validCount} valid, ${errorCount} errors`,
      errorCount > 0 ? "warn" : "success",
    );

    return { validCount, errorCount };
  } catch (error) {
    log(`Error during validation: ${error.message}`, "error");
    return { validCount: 0, errorCount: 1 };
  }
};

// Generate migration report
const generateReport = async (articles, results) => {
  const successful = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalArticles: articles.length,
      successful,
      failed,
      categories: [...new Set(articles.map((a) => a.frontmatter.category))],
      tags: [...new Set(articles.flatMap((a) => a.frontmatter.tags))],
    },
    articles: articles.map((a) => ({
      title: a.frontmatter.title,
      slug: a.frontmatter.slug,
      date: a.frontmatter.date,
      category: a.frontmatter.category,
      tags: a.frontmatter.tags,
      sourceDir: a.dirName,
    })),
  };

  const reportPath = path.join(__dirname, "reports", "migration-report.json");

  if (!CONFIG.dryRun) {
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");
    log(`Migration report saved: ${reportPath}`, "success");
  }

  return report;
};

// Main migration function
const runMigration = async () => {
  try {
    log("Starting local content migration...", "info");

    if (CONFIG.dryRun) {
      log("Running in DRY RUN mode - no files will be created", "info");
    }

    // Scan for articles
    const articles = await scanContentDirectory();

    if (articles.length === 0) {
      log("No articles found to migrate", "warn");
      return;
    }

    // Copy all images first
    await copyAllImages();

    // Process articles
    let successCount = 0;
    let errorCount = 0;
    const results = [];

    for (const article of articles) {
      const success = await migrateArticle(article);
      results.push({ article: article.frontmatter.title, success });

      if (success) {
        successCount++;
      } else {
        errorCount++;
      }
    }

    log(
      `Migration complete: ${successCount} successful, ${errorCount} errors`,
      errorCount > 0 ? "warn" : "success",
    );

    // Generate report
    await generateReport(articles, results);

    // Validate if not dry run
    if (!CONFIG.dryRun && successCount > 0) {
      await validateContent();
    }
  } catch (error) {
    log(`Migration failed: ${error.message}`, "error");
    process.exit(1);
  }
};

// CLI help
const showHelp = () => {
  console.log(`
Local Content Migration Tool for s11a.com Blog

Usage: node migrate-local-content.js [options]

Options:
  --dry-run     Run without creating files (preview mode)
  --verbose     Show detailed logging
  --force       Overwrite existing files
  --help        Show this help message

Examples:
  node migrate-local-content.js --dry-run    # Preview migration
  node migrate-local-content.js --verbose    # Run with detailed logging
  node migrate-local-content.js --force      # Overwrite existing files
  node migrate-local-content.js              # Run migration
`);
};

// Handle CLI arguments
if (process.argv.includes("--help")) {
  showHelp();
  process.exit(0);
}

// Run migration
if (require.main === module) {
  runMigration().catch((error) => {
    log(`Fatal error: ${error.message}`, "error");
    process.exit(1);
  });
}

module.exports = {
  runMigration,
  migrateArticle,
  validateContent,
  CONFIG,
};
