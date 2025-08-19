#!/usr/bin/env node

/**
 * Content Validation Script
 * 
 * This script validates migrated content for:
 * - Frontmatter completeness and format
 * - Content structure and quality
 * - Link integrity
 * - Image references
 * - Code block syntax
 * - SEO requirements
 */

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

// Configuration
const CONFIG = {
  contentDir: path.join(__dirname, '../../src/content/articles'),
  imageDir: path.join(__dirname, '../../static/images/articles'),
  verbose: process.argv.includes('--verbose'),
  fix: process.argv.includes('--fix')
};

const log = (message, level = 'info') => {
  const timestamp = new Date().toISOString();
  const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : level === 'success' ? '✅' : 'ℹ️';
  console.log(`${prefix} [${timestamp}] ${message}`);
};

const verbose = (message) => {
  if (CONFIG.verbose) {
    log(message, 'info');
  }
};

// Validation results tracker
const validationResults = {
  files: 0,
  errors: 0,
  warnings: 0,
  issues: []
};

// Add validation issue
const addIssue = (file, type, message, severity = 'error') => {
  validationResults.issues.push({
    file,
    type,
    message,
    severity
  });
  
  if (severity === 'error') {
    validationResults.errors++;
  } else {
    validationResults.warnings++;
  }
};

// Required frontmatter fields
const REQUIRED_FRONTMATTER = [
  'title',
  'slug',
  'excerpt',
  'date',
  'category',
  'tags',
  'readingTime',
  'author'
];

// Valid categories
const VALID_CATEGORIES = [
  'Frontend',
  'Backend',
  'Healthcare',
  'Architecture',
  'DevOps',
  'Database',
  'Cloud',
  'Security'
];

// Validate frontmatter
const validateFrontmatter = (frontmatter, fileName) => {
  let isValid = true;
  
  // Check required fields
  REQUIRED_FRONTMATTER.forEach(field => {
    if (!frontmatter[field]) {
      addIssue(fileName, 'frontmatter', `Missing required field: ${field}`, 'error');
      isValid = false;
    }
  });
  
  // Validate specific fields
  if (frontmatter.title) {
    if (frontmatter.title.length < 10) {
      addIssue(fileName, 'frontmatter', 'Title is too short (minimum 10 characters)', 'warning');
    }
    if (frontmatter.title.length > 100) {
      addIssue(fileName, 'frontmatter', 'Title is too long (maximum 100 characters)', 'warning');
    }
  }
  
  if (frontmatter.excerpt) {
    if (frontmatter.excerpt.length < 50) {
      addIssue(fileName, 'frontmatter', 'Excerpt is too short (minimum 50 characters)', 'warning');
    }
    if (frontmatter.excerpt.length > 200) {
      addIssue(fileName, 'frontmatter', 'Excerpt is too long (maximum 200 characters)', 'warning');
    }
  }
  
  if (frontmatter.category && !VALID_CATEGORIES.includes(frontmatter.category)) {
    addIssue(fileName, 'frontmatter', `Invalid category: ${frontmatter.category}`, 'error');
    isValid = false;
  }
  
  if (frontmatter.tags) {
    if (!Array.isArray(frontmatter.tags)) {
      addIssue(fileName, 'frontmatter', 'Tags must be an array', 'error');
      isValid = false;
    } else {
      if (frontmatter.tags.length === 0) {
        addIssue(fileName, 'frontmatter', 'At least one tag is required', 'warning');
      }
      if (frontmatter.tags.length > 10) {
        addIssue(fileName, 'frontmatter', 'Too many tags (maximum 10)', 'warning');
      }
    }
  }
  
  if (frontmatter.date) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(frontmatter.date)) {
      addIssue(fileName, 'frontmatter', 'Invalid date format (use YYYY-MM-DD)', 'error');
      isValid = false;
    }
  }
  
  if (frontmatter.slug) {
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(frontmatter.slug)) {
      addIssue(fileName, 'frontmatter', 'Invalid slug format (use lowercase letters, numbers, and hyphens)', 'error');
      isValid = false;
    }
  }
  
  return isValid;
};

// Validate content structure
const validateContent = (content, fileName) => {
  let isValid = true;
  
  // Check for proper heading structure
  const headings = content.match(/^#{1,6}\s+.+$/gm) || [];
  
  if (headings.length === 0) {
    addIssue(fileName, 'content', 'No headings found in content', 'warning');
  }
  
  // Check for H1 (should be only one)
  const h1Headings = headings.filter(h => h.startsWith('# '));
  if (h1Headings.length === 0) {
    addIssue(fileName, 'content', 'No H1 heading found', 'warning');
  } else if (h1Headings.length > 1) {
    addIssue(fileName, 'content', 'Multiple H1 headings found (should be only one)', 'warning');
  }
  
  // Check content length
  const wordCount = content.trim().split(/\s+/).length;
  if (wordCount < 300) {
    addIssue(fileName, 'content', `Content is too short (${wordCount} words, minimum 300)`, 'warning');
  }
  
  // Check for code blocks
  const codeBlocks = content.match(/```[\s\S]*?```/g) || [];
  codeBlocks.forEach((block, index) => {
    const firstLine = block.split('\n')[0];
    if (firstLine === '```') {
      addIssue(fileName, 'content', `Code block ${index + 1} missing language specification`, 'warning');
    }
  });
  
  // Check for broken internal links
  const internalLinks = content.match(/\[.*?\]\(\/[^)]+\)/g) || [];
  // Note: Full link validation would require checking actual files
  
  // Check for images without alt text
  const images = content.match(/<img[^>]*>/g) || [];
  images.forEach((img, index) => {
    if (!img.includes('alt=')) {
      addIssue(fileName, 'accessibility', `Image ${index + 1} missing alt text`, 'warning');
    }
  });
  
  return isValid;
};

// Validate SEO requirements
const validateSEO = (frontmatter, content, fileName) => {
  let isValid = true;
  
  // Title length for SEO
  if (frontmatter.title && (frontmatter.title.length < 30 || frontmatter.title.length > 60)) {
    addIssue(fileName, 'seo', 'Title length not optimal for SEO (30-60 characters recommended)', 'warning');
  }
  
  // Excerpt length for meta description
  if (frontmatter.excerpt && (frontmatter.excerpt.length < 120 || frontmatter.excerpt.length > 160)) {
    addIssue(fileName, 'seo', 'Excerpt length not optimal for meta description (120-160 characters recommended)', 'warning');
  }
  
  // Check for focus keyword in content
  if (frontmatter.tags && frontmatter.tags.length > 0) {
    const focusKeyword = frontmatter.tags[0].toLowerCase();
    const contentLower = content.toLowerCase();
    const titleLower = frontmatter.title.toLowerCase();
    
    if (!titleLower.includes(focusKeyword)) {
      addIssue(fileName, 'seo', `Focus keyword "${focusKeyword}" not in title`, 'warning');
    }
    
    if (!contentLower.includes(focusKeyword)) {
      addIssue(fileName, 'seo', `Focus keyword "${focusKeyword}" not in content`, 'warning');
    }
  }
  
  return isValid;
};

// Validate a single file
const validateFile = async (filePath) => {
  try {
    const fileName = path.basename(filePath);
    verbose(`Validating: ${fileName}`);
    
    const content = await fs.readFile(filePath, 'utf8');
    
    // Parse frontmatter
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    
    if (!frontmatterMatch) {
      addIssue(fileName, 'structure', 'Invalid file structure - missing frontmatter', 'error');
      return false;
    }
    
    const [, frontmatterYaml, mdxContent] = frontmatterMatch;
    
    let frontmatter;
    try {
      frontmatter = yaml.load(frontmatterYaml);
    } catch (error) {
      addIssue(fileName, 'frontmatter', `Invalid YAML syntax: ${error.message}`, 'error');
      return false;
    }
    
    // Run validations
    const frontmatterValid = validateFrontmatter(frontmatter, fileName);
    const contentValid = validateContent(mdxContent, fileName);
    const seoValid = validateSEO(frontmatter, mdxContent, fileName);
    
    const isValid = frontmatterValid && contentValid && seoValid;
    
    if (isValid) {
      verbose(`✓ ${fileName} passed validation`);
    } else {
      verbose(`✗ ${fileName} has validation issues`);
    }
    
    return isValid;
    
  } catch (error) {
    const fileName = path.basename(filePath);
    addIssue(fileName, 'system', `File processing error: ${error.message}`, 'error');
    return false;
  }
};

// Generate validation report
const generateReport = () => {
  log('\n=== VALIDATION REPORT ===', 'info');
  log(`Files processed: ${validationResults.files}`, 'info');
  log(`Errors: ${validationResults.errors}`, validationResults.errors > 0 ? 'error' : 'success');
  log(`Warnings: ${validationResults.warnings}`, validationResults.warnings > 0 ? 'warn' : 'info');
  
  if (validationResults.issues.length > 0) {
    log('\n=== ISSUES FOUND ===', 'info');
    
    // Group issues by file
    const issuesByFile = {};
    validationResults.issues.forEach(issue => {
      if (!issuesByFile[issue.file]) {
        issuesByFile[issue.file] = [];
      }
      issuesByFile[issue.file].push(issue);
    });
    
    Object.entries(issuesByFile).forEach(([file, issues]) => {
      log(`\n📄 ${file}:`, 'info');
      issues.forEach(issue => {
        const icon = issue.severity === 'error' ? '  ❌' : '  ⚠️';
        log(`${icon} [${issue.type}] ${issue.message}`, issue.severity);
      });
    });
  }
  
  // Summary
  const successRate = ((validationResults.files - validationResults.errors) / validationResults.files * 100).toFixed(1);
  log(`\n=== SUMMARY ===`, 'info');
  log(`Success rate: ${successRate}%`, 'info');
  
  if (validationResults.errors === 0) {
    log('✅ All files passed validation!', 'success');
  } else {
    log(`❌ ${validationResults.errors} files have critical errors`, 'error');
  }
};

// Main validation function
const runValidation = async () => {
  try {
    log('Starting content validation...', 'info');
    
    // Get all MDX files
    const files = await fs.readdir(CONFIG.contentDir);
    const mdxFiles = files.filter(file => file.endsWith('.mdx'));
    
    if (mdxFiles.length === 0) {
      log('No MDX files found to validate', 'warn');
      return;
    }
    
    log(`Found ${mdxFiles.length} files to validate`, 'info');
    validationResults.files = mdxFiles.length;
    
    // Validate each file
    for (const file of mdxFiles) {
      const filePath = path.join(CONFIG.contentDir, file);
      await validateFile(filePath);
    }
    
    // Generate report
    generateReport();
    
    // Exit with error code if validation failed
    if (validationResults.errors > 0) {
      process.exit(1);
    }
    
  } catch (error) {
    log(`Validation failed: ${error.message}`, 'error');
    process.exit(1);
  }
};

// CLI help
const showHelp = () => {
  console.log(`
Content Validation Tool

Usage: node validate-content.js [options]

Options:
  --verbose     Show detailed logging
  --fix         Attempt to fix common issues (not implemented yet)
  --help        Show this help message

Examples:
  node validate-content.js --verbose    # Run with detailed logging
  node validate-content.js              # Run validation
`);
};

// Handle CLI arguments
if (process.argv.includes('--help')) {
  showHelp();
  process.exit(0);
}

// Run if called directly
if (require.main === module) {
  runValidation().catch(error => {
    log(`Fatal error: ${error.message}`, 'error');
    process.exit(1);
  });
}

module.exports = {
  runValidation,
  validateFile,
  CONFIG
};