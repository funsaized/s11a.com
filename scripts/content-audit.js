#!/usr/bin/env node

/**
 * Content Audit Script for Gatsby Blog
 * Analyzes markdown content for SEO completeness
 */

const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const CONTENT_DIR = path.join(__dirname, "../content");
const REQUIRED_FIELDS = ["title", "slug", "date", "category", "tags", "type"];
const RECOMMENDED_FIELDS = ["description", "thumbnail", "time"];

class ContentAuditor {
  constructor() {
    this.issues = [];
    this.stats = {
      total: 0,
      missingDescription: 0,
      missingThumbnail: 0,
      invalidCategory: 0,
      missingTags: 0,
      categoryInconsistencies: new Set(),
    };
  }

  auditFile(filePath) {
    const content = fs.readFileSync(filePath, "utf8");
    const { data: frontmatter } = matter(content);
    const relativePath = path.relative(CONTENT_DIR, filePath);

    const fileIssues = [];
    this.stats.total++;

    // Check required fields
    REQUIRED_FIELDS.forEach((field) => {
      if (!frontmatter[field]) {
        fileIssues.push(`Missing required field: ${field}`);
      }
    });

    // Check recommended fields
    if (!frontmatter.description) {
      fileIssues.push("Missing meta description - important for SEO");
      this.stats.missingDescription++;
    }

    if (!frontmatter.thumbnail) {
      fileIssues.push("Missing thumbnail image - important for social sharing");
      this.stats.missingThumbnail++;
    }

    // Check category consistency
    if (frontmatter.category === "test3") {
      fileIssues.push('Using placeholder category "test3" - should be updated');
      this.stats.invalidCategory++;
      this.stats.categoryInconsistencies.add(relativePath);
    }

    // Check tags
    if (
      !frontmatter.tags ||
      !Array.isArray(frontmatter.tags) ||
      frontmatter.tags.length === 0
    ) {
      fileIssues.push(
        "Missing or empty tags array - important for content discovery",
      );
      this.stats.missingTags++;
    }

    // Check title length for SEO
    if (frontmatter.title && frontmatter.title.length > 60) {
      fileIssues.push(
        `Title too long (${frontmatter.title.length} chars) - should be under 60 for SEO`,
      );
    }

    // Check description length
    if (frontmatter.description && frontmatter.description.length > 160) {
      fileIssues.push(
        `Description too long (${frontmatter.description.length} chars) - should be under 160 for SEO`,
      );
    }

    if (fileIssues.length > 0) {
      this.issues.push({
        file: relativePath,
        issues: fileIssues,
        frontmatter,
      });
    }

    return fileIssues.length === 0;
  }

  scanDirectory(dir = CONTENT_DIR) {
    const items = fs.readdirSync(dir);

    items.forEach((item) => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        this.scanDirectory(fullPath);
      } else if (item === "index.md") {
        this.auditFile(fullPath);
      }
    });
  }

  generateReport() {
    console.log("\n🔍 CONTENT AUDIT REPORT");
    console.log("========================\n");

    console.log(`📊 Statistics:`);
    console.log(`   Total posts: ${this.stats.total}`);
    console.log(`   Posts with issues: ${this.issues.length}`);
    console.log(
      `   Health score: ${Math.round((1 - this.issues.length / this.stats.total) * 100)}%\n`,
    );

    console.log(`🚨 Critical Issues:`);
    console.log(`   Missing descriptions: ${this.stats.missingDescription}`);
    console.log(`   Missing thumbnails: ${this.stats.missingThumbnail}`);
    console.log(`   Invalid categories: ${this.stats.invalidCategory}`);
    console.log(`   Missing tags: ${this.stats.missingTags}\n`);

    if (this.stats.categoryInconsistencies.size > 0) {
      console.log(`📝 Files with "test3" category (need updating):`);
      this.stats.categoryInconsistencies.forEach((file) => {
        console.log(`   - ${file}`);
      });
      console.log();
    }

    if (this.issues.length > 0) {
      console.log(`📋 Detailed Issues:\n`);
      this.issues.forEach(({ file, issues, frontmatter }) => {
        console.log(`📄 ${file}`);
        console.log(`   Title: "${frontmatter.title}"`);
        issues.forEach((issue) => {
          console.log(`   ❌ ${issue}`);
        });
        console.log();
      });
    }

    this.generateRecommendations();
  }

  generateRecommendations() {
    console.log(`💡 RECOMMENDATIONS:\n`);

    if (this.stats.missingDescription > 0) {
      console.log(
        `1. Add meta descriptions to ${this.stats.missingDescription} posts`,
      );
      console.log(`   - Keep under 160 characters`);
      console.log(`   - Include target keywords naturally`);
      console.log(`   - Make them compelling for click-through\n`);
    }

    if (this.stats.invalidCategory > 0) {
      console.log(`2. Update category "test3" to meaningful categories:`);
      console.log(
        `   - Suggested categories: "Development", "Cloud", "Tutorial", "Tools"`,
      );
      console.log(`   - Use consistent naming convention\n`);
    }

    if (this.stats.missingThumbnail > 0) {
      console.log(
        `3. Add thumbnail images to ${this.stats.missingThumbnail} posts`,
      );
      console.log(`   - Recommended size: 1200x630px`);
      console.log(`   - Optimize for web (WebP format preferred)`);
      console.log(`   - Use descriptive alt text\n`);
    }

    console.log(`4. SEO Best Practices:`);
    console.log(`   - Use consistent category names`);
    console.log(`   - Add 3-5 relevant tags per post`);
    console.log(`   - Keep titles under 60 characters`);
    console.log(`   - Include reading time estimates\n`);
  }
}

// Run audit
if (require.main === module) {
  const auditor = new ContentAuditor();

  try {
    auditor.scanDirectory();
    auditor.generateReport();

    // Exit with error code if issues found for CI/CD
    process.exit(auditor.issues.length > 0 ? 1 : 0);
  } catch (error) {
    console.error("❌ Audit failed:", error.message);
    process.exit(1);
  }
}

module.exports = ContentAuditor;
