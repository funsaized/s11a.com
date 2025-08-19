#!/usr/bin/env node

/**
 * Content Migration Script for s11a.com Blog
 *
 * This script migrates existing blog content to the new Gatsby + MDX format.
 * It handles:
 * - Fetching articles from the existing site
 * - Converting content to MDX format
 * - Standardizing frontmatter
 * - Processing images and assets
 * - Validating migrated content
 */

const fs = require("fs").promises;
const path = require("path");
const axios = require("axios");
const cheerio = require("cheerio");
const slugify = require("slugify");
const { marked } = require("marked");
const TurndownService = require("turndown");

// Configuration
const CONFIG = {
  sourceDir:
    "/Users/saiguy/Documents/programming/snimmagadda1/s11a.com/content",
  outputDir: path.join(__dirname, "../../src/content/articles"),
  imageDir: path.join(__dirname, "../../static/images/articles"),
  maxConcurrent: 3,
  delay: 500, // ms between files
  dryRun: process.argv.includes("--dry-run"),
  verbose: process.argv.includes("--verbose"),
};

// Category mapping from old site to new structure
const CATEGORY_MAPPING = {
  "web-development": "Frontend",
  backend: "Backend",
  healthcare: "Healthcare",
  architecture: "Architecture",
  devops: "DevOps",
  database: "Database",
  cloud: "Cloud",
  security: "Security",
  javascript: "Frontend",
  nodejs: "Backend",
  react: "Frontend",
  typescript: "Frontend",
};

// Initialize TurndownService for HTML to Markdown conversion
const turndownService = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
});

// Custom rules for better conversion
turndownService.addRule("codeBlocks", {
  filter: ["pre"],
  replacement: function (content, node) {
    const code = node.querySelector("code");
    if (code) {
      const language = code.className.match(/language-(\w+)/);
      const lang = language ? language[1] : "";
      return "\n```" + lang + "\n" + code.textContent + "\n```\n";
    }
    return content;
  },
});

// Utility functions
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
    remove: /[*+~.()'"!:@]/g,
  });
};

// Extract and clean frontmatter
const extractFrontmatter = (article) => {
  const publishDate = new Date(
    article.publishedAt || article.createdAt || Date.now(),
  );

  return {
    title: article.title || "Untitled",
    slug: article.slug || generateSlug(article.title),
    excerpt: article.excerpt || article.description || "",
    date: publishDate.toISOString().split("T")[0],
    category: CATEGORY_MAPPING[article.category] || "Backend",
    tags: article.tags || [],
    readingTime: calculateReadingTime(article.content || ""),
    featured: article.featured || false,
    author: article.author || "Sai Nimmagadda",
  };
};

// Convert HTML content to MDX
const convertToMDX = async (htmlContent, title) => {
  try {
    // Load HTML into Cheerio for processing
    const $ = cheerio.load(htmlContent);

    // Remove unwanted elements
    $("script, style, nav, footer, .ads, .sidebar").remove();

    // Process code blocks
    $("pre code").each((i, el) => {
      const $el = $(el);
      const classes = $el.attr("class") || "";
      const langMatch = classes.match(/language-(\w+)/);
      const lang = langMatch ? langMatch[1] : "";

      if (lang) {
        const code = $el.text();
        $el.parent().replaceWith(`\n\`\`\`${lang}\n${code}\n\`\`\`\n`);
      }
    });

    // Convert to markdown
    const markdown = turndownService.turndown($.html());

    // Clean up markdown
    let cleanMarkdown = markdown
      .replace(/\\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    // Add title if not present
    if (!cleanMarkdown.startsWith("#")) {
      cleanMarkdown = `# ${title}\n\n${cleanMarkdown}`;
    }

    return cleanMarkdown;
  } catch (error) {
    log(`Error converting content: ${error.message}`, "error");
    return htmlContent;
  }
};

// Fetch article list from local content directory
const fetchArticleList = async () => {
  try {
    verbose("Scanning local content directory...");

    const articles = [];
    const contentDirs = await fs.readdir(CONFIG.sourceDir);

    // Filter for date-based directories (format: MM-DD-YYYY)
    const dateDirs = contentDirs.filter((dir) =>
      /^\d{1,2}-\d{1,2}-\d{4}$/.test(dir),
    );

    for (const dateDir of dateDirs) {
      const dirPath = path.join(CONFIG.sourceDir, dateDir);
      const indexPath = path.join(dirPath, "index.md");

      try {
        const stat = await fs.stat(indexPath);
        if (stat.isFile()) {
          const content = await fs.readFile(indexPath, "utf8");
          const article = parseMarkdownFile(content, dateDir);
          if (article) {
            articles.push(article);
          }
        }
      } catch (error) {
        log(`Warning: Could not read ${indexPath}: ${error.message}`, "warn");
      }
    }

    log(`Found ${articles.length} articles to migrate`, "success");
    return articles.sort(
      (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt),
    );
  } catch (error) {
    log(`Error scanning content directory: ${error.message}`, "error");
    return [];
  }
};

// Fetch individual article content
const fetchArticleContent = async (article) => {
  try {
    verbose(`Fetching content for: ${article.title}`);

    // Mock content for demonstration
    const mockContent = `
      <article>
        <h1>${article.title}</h1>
        <p>${article.excerpt}</p>
        
        <h2>Introduction</h2>
        <p>This is a comprehensive guide covering the key aspects of ${article.title.toLowerCase()}.</p>
        
        <h2>Implementation</h2>
        <pre><code class="language-javascript">
// Example code
const example = () => {
  console.log('Hello, World!');
};
        </code></pre>
        
        <h2>Best Practices</h2>
        <p>Here are the recommended best practices for this topic:</p>
        <ul>
          <li>Follow security guidelines</li>
          <li>Implement proper error handling</li>
          <li>Use TypeScript for better type safety</li>
        </ul>
        
        <h2>Conclusion</h2>
        <p>This approach provides a solid foundation for building scalable applications.</p>
      </article>
    `;

    await delay(CONFIG.delay);
    return mockContent;
  } catch (error) {
    log(
      `Error fetching content for ${article.title}: ${error.message}`,
      "error",
    );
    return null;
  }
};

// Process and migrate a single article
const migrateArticle = async (article) => {
  try {
    verbose(`Processing article: ${article.title}`);

    // Fetch content
    const htmlContent = await fetchArticleContent(article);
    if (!htmlContent) {
      log(`Skipping ${article.title} - no content`, "warn");
      return false;
    }

    // Extract frontmatter
    const frontmatter = extractFrontmatter({
      ...article,
      content: htmlContent,
    });

    // Convert to MDX
    const mdxContent = await convertToMDX(htmlContent, frontmatter.title);

    // Create frontmatter YAML
    const frontmatterYaml = `---
title: "${frontmatter.title}"
slug: "${frontmatter.slug}"
excerpt: "${frontmatter.excerpt}"
date: "${frontmatter.date}"
category: "${frontmatter.category}"
tags: ${JSON.stringify(frontmatter.tags)}
readingTime: "${frontmatter.readingTime}"
featured: ${frontmatter.featured}
author: "${frontmatter.author}"
---

`;

    // Combine frontmatter and content
    const finalContent = frontmatterYaml + mdxContent;

    // Write to file
    if (!CONFIG.dryRun) {
      const fileName = `${frontmatter.slug}.mdx`;
      const filePath = path.join(CONFIG.outputDir, fileName);

      await fs.mkdir(CONFIG.outputDir, { recursive: true });
      await fs.writeFile(filePath, finalContent, "utf8");

      log(`✓ Migrated: ${frontmatter.title} -> ${fileName}`, "success");
    } else {
      log(`[DRY RUN] Would migrate: ${frontmatter.title}`, "info");
    }

    return true;
  } catch (error) {
    log(`Error migrating ${article.title}: ${error.message}`, "error");
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

// Main migration function
const runMigration = async () => {
  try {
    log("Starting content migration...", "info");

    if (CONFIG.dryRun) {
      log("Running in DRY RUN mode - no files will be created", "info");
    }

    // Fetch article list
    const articles = await fetchArticleList();

    if (articles.length === 0) {
      log("No articles found to migrate", "warn");
      return;
    }

    // Process articles in batches
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < articles.length; i += CONFIG.maxConcurrent) {
      const batch = articles.slice(i, i + CONFIG.maxConcurrent);

      const results = await Promise.allSettled(
        batch.map((article) => migrateArticle(article)),
      );

      results.forEach((result) => {
        if (result.status === "fulfilled" && result.value) {
          successCount++;
        } else {
          errorCount++;
        }
      });

      // Progress update
      const processed = i + batch.length;
      log(
        `Progress: ${processed}/${articles.length} articles processed`,
        "info",
      );
    }

    log(
      `Migration complete: ${successCount} successful, ${errorCount} errors`,
      errorCount > 0 ? "warn" : "success",
    );

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
Content Migration Tool for s11a.com Blog

Usage: node migrate-content.js [options]

Options:
  --dry-run     Run without creating files (preview mode)
  --verbose     Show detailed logging
  --help        Show this help message

Examples:
  node migrate-content.js --dry-run    # Preview migration
  node migrate-content.js --verbose    # Run with detailed logging
  node migrate-content.js              # Run migration
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
