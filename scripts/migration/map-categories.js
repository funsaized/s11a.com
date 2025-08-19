#!/usr/bin/env node

/**
 * Category and Tag Mapping Script
 * 
 * This script analyzes existing content and creates:
 * - Category standardization mapping
 * - Tag consolidation and cleanup
 * - Content taxonomy optimization
 * - Analytics on content distribution
 */

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

// Configuration
const CONFIG = {
  contentDir: path.join(__dirname, '../../src/content/articles'),
  outputDir: path.join(__dirname, './reports'),
  verbose: process.argv.includes('--verbose'),
  update: process.argv.includes('--update')
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

// Category mapping and standardization
const CATEGORY_STANDARDIZATION = {
  // Frontend variations
  'frontend': 'Frontend',
  'front-end': 'Frontend',
  'ui': 'Frontend',
  'ux': 'Frontend',
  'web-development': 'Frontend',
  'javascript': 'Frontend',
  'react': 'Frontend',
  'vue': 'Frontend',
  'angular': 'Frontend',
  
  // Backend variations
  'backend': 'Backend',
  'back-end': 'Backend',
  'server': 'Backend',
  'api': 'Backend',
  'nodejs': 'Backend',
  'python': 'Backend',
  'java': 'Backend',
  
  // Healthcare variations
  'healthcare': 'Healthcare',
  'health': 'Healthcare',
  'medical': 'Healthcare',
  'fhir': 'Healthcare',
  'hipaa': 'Healthcare',
  
  // Architecture variations
  'architecture': 'Architecture',
  'design': 'Architecture',
  'patterns': 'Architecture',
  'microservices': 'Architecture',
  'system-design': 'Architecture',
  
  // DevOps variations
  'devops': 'DevOps',
  'deployment': 'DevOps',
  'ci-cd': 'DevOps',
  'docker': 'DevOps',
  'kubernetes': 'DevOps',
  'infrastructure': 'DevOps',
  
  // Database variations
  'database': 'Database',
  'db': 'Database',
  'sql': 'Database',
  'nosql': 'Database',
  'mongodb': 'Database',
  'postgresql': 'Database',
  
  // Cloud variations
  'cloud': 'Cloud',
  'aws': 'Cloud',
  'azure': 'Cloud',
  'gcp': 'Cloud',
  'serverless': 'Cloud',
  
  // Security variations
  'security': 'Security',
  'cybersecurity': 'Security',
  'auth': 'Security',
  'encryption': 'Security'
};

// Tag standardization and synonyms
const TAG_STANDARDIZATION = {
  // Programming languages
  'js': 'JavaScript',
  'javascript': 'JavaScript',
  'ts': 'TypeScript',
  'typescript': 'TypeScript',
  'py': 'Python',
  'python': 'Python',
  
  // Frameworks
  'react': 'React',
  'reactjs': 'React',
  'vue': 'Vue.js',
  'vuejs': 'Vue.js',
  'angular': 'Angular',
  'angularjs': 'Angular',
  'express': 'Express.js',
  'expressjs': 'Express.js',
  
  // Technologies
  'node': 'Node.js',
  'nodejs': 'Node.js',
  'docker': 'Docker',
  'k8s': 'Kubernetes',
  'kubernetes': 'Kubernetes',
  
  // Healthcare
  'fhir': 'FHIR',
  'hipaa': 'HIPAA',
  'hl7': 'HL7',
  
  // Databases
  'mongo': 'MongoDB',
  'mongodb': 'MongoDB',
  'postgres': 'PostgreSQL',
  'postgresql': 'PostgreSQL',
  'mysql': 'MySQL',
  
  // Cloud providers
  'aws': 'AWS',
  'amazon-web-services': 'AWS',
  'azure': 'Azure',
  'microsoft-azure': 'Azure',
  'gcp': 'Google Cloud',
  'google-cloud': 'Google Cloud'
};

// Analytics data
const analytics = {
  totalArticles: 0,
  categories: {},
  tags: {},
  duplicateTags: [],
  orphanedCategories: [],
  recommendations: []
};

// Analyze content taxonomy
const analyzeContent = async () => {
  try {
    const files = await fs.readdir(CONFIG.contentDir);
    const mdxFiles = files.filter(file => file.endsWith('.mdx'));
    
    analytics.totalArticles = mdxFiles.length;
    
    for (const file of mdxFiles) {
      const filePath = path.join(CONFIG.contentDir, file);
      const content = await fs.readFile(filePath, 'utf8');
      
      // Parse frontmatter
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n/);
      if (!frontmatterMatch) continue;
      
      const frontmatter = yaml.load(frontmatterMatch[1]);
      
      // Analyze categories
      if (frontmatter.category) {
        const category = frontmatter.category;
        analytics.categories[category] = (analytics.categories[category] || 0) + 1;
      }
      
      // Analyze tags
      if (frontmatter.tags && Array.isArray(frontmatter.tags)) {
        frontmatter.tags.forEach(tag => {
          const normalizedTag = tag.toLowerCase();
          analytics.tags[normalizedTag] = (analytics.tags[normalizedTag] || 0) + 1;
        });
      }
      
      verbose(`Analyzed: ${file}`);
    }
    
    log(`Analyzed ${analytics.totalArticles} articles`, 'success');
    
  } catch (error) {
    log(`Error analyzing content: ${error.message}`, 'error');
    throw error;
  }
};

// Generate recommendations
const generateRecommendations = () => {
  // Find duplicate/similar tags
  const tagKeys = Object.keys(analytics.tags);
  const duplicates = new Set();
  
  tagKeys.forEach(tag1 => {
    tagKeys.forEach(tag2 => {
      if (tag1 !== tag2 && !duplicates.has(tag1) && !duplicates.has(tag2)) {
        // Check for similar tags
        if (tag1.includes(tag2) || tag2.includes(tag1) || 
            TAG_STANDARDIZATION[tag1] === TAG_STANDARDIZATION[tag2]) {
          duplicates.add(tag1);
          duplicates.add(tag2);
          analytics.duplicateTags.push({ tag1, tag2, count1: analytics.tags[tag1], count2: analytics.tags[tag2] });
        }
      }
    });
  });
  
  // Find low-usage tags (potential for consolidation)
  const lowUsageTags = Object.entries(analytics.tags)
    .filter(([tag, count]) => count === 1)
    .map(([tag]) => tag);
  
  if (lowUsageTags.length > 0) {
    analytics.recommendations.push({
      type: 'tag_consolidation',
      message: `${lowUsageTags.length} tags are used only once - consider consolidation`,
      tags: lowUsageTags
    });
  }
  
  // Find categories with few articles
  const lowUsageCategories = Object.entries(analytics.categories)
    .filter(([category, count]) => count < 3)
    .map(([category]) => category);
  
  if (lowUsageCategories.length > 0) {
    analytics.recommendations.push({
      type: 'category_consolidation',
      message: `${lowUsageCategories.length} categories have fewer than 3 articles`,
      categories: lowUsageCategories
    });
  }
  
  // Recommend standardization
  const unstandardizedCategories = Object.keys(analytics.categories)
    .filter(cat => !Object.values(CATEGORY_STANDARDIZATION).includes(cat));
  
  if (unstandardizedCategories.length > 0) {
    analytics.recommendations.push({
      type: 'category_standardization',
      message: `${unstandardizedCategories.length} categories need standardization`,
      categories: unstandardizedCategories
    });
  }
};

// Generate detailed report
const generateReport = async () => {
  try {
    await fs.mkdir(CONFIG.outputDir, { recursive: true });
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalArticles: analytics.totalArticles,
        totalCategories: Object.keys(analytics.categories).length,
        totalTags: Object.keys(analytics.tags).length,
        recommendations: analytics.recommendations.length
      },
      categories: analytics.categories,
      tags: analytics.tags,
      duplicateTags: analytics.duplicateTags,
      recommendations: analytics.recommendations,
      mappings: {
        categoryStandardization: CATEGORY_STANDARDIZATION,
        tagStandardization: TAG_STANDARDIZATION
      }
    };
    
    // Write JSON report
    const jsonPath = path.join(CONFIG.outputDir, 'taxonomy-analysis.json');
    await fs.writeFile(jsonPath, JSON.stringify(report, null, 2));
    
    // Write human-readable report
    const txtReport = generateTextReport(report);
    const txtPath = path.join(CONFIG.outputDir, 'taxonomy-analysis.txt');
    await fs.writeFile(txtPath, txtReport);
    
    log(`Reports generated:`, 'success');
    log(`  JSON: ${jsonPath}`, 'info');
    log(`  Text: ${txtPath}`, 'info');
    
  } catch (error) {
    log(`Error generating report: ${error.message}`, 'error');
    throw error;
  }
};

// Generate human-readable text report
const generateTextReport = (report) => {
  let output = `# Content Taxonomy Analysis Report\n\n`;
  output += `Generated: ${report.timestamp}\n\n`;
  
  output += `## Summary\n`;
  output += `- Total Articles: ${report.summary.totalArticles}\n`;
  output += `- Total Categories: ${report.summary.totalCategories}\n`;
  output += `- Total Tags: ${report.summary.totalTags}\n`;
  output += `- Recommendations: ${report.summary.recommendations}\n\n`;
  
  output += `## Category Distribution\n`;
  Object.entries(report.categories)
    .sort(([,a], [,b]) => b - a)
    .forEach(([category, count]) => {
      const percentage = (count / report.summary.totalArticles * 100).toFixed(1);
      output += `- ${category}: ${count} articles (${percentage}%)\n`;
    });
  output += `\n`;
  
  output += `## Top Tags\n`;
  Object.entries(report.tags)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 20)
    .forEach(([tag, count]) => {
      output += `- ${tag}: ${count} uses\n`;
    });
  output += `\n`;
  
  if (report.recommendations.length > 0) {
    output += `## Recommendations\n`;
    report.recommendations.forEach((rec, index) => {
      output += `${index + 1}. **${rec.type.replace('_', ' ').toUpperCase()}**: ${rec.message}\n`;
      if (rec.categories) {
        output += `   Categories: ${rec.categories.join(', ')}\n`;
      }
      if (rec.tags) {
        output += `   Tags: ${rec.tags.slice(0, 10).join(', ')}${rec.tags.length > 10 ? '...' : ''}\n`;
      }
      output += `\n`;
    });
  }
  
  if (report.duplicateTags.length > 0) {
    output += `## Potential Tag Duplicates\n`;
    report.duplicateTags.forEach(dup => {
      output += `- "${dup.tag1}" (${dup.count1}) ↔ "${dup.tag2}" (${dup.count2})\n`;
    });
    output += `\n`;
  }
  
  return output;
};

// Update content with standardized taxonomy
const updateContent = async () => {
  if (!CONFIG.update) {
    log('Use --update flag to apply taxonomy standardization', 'info');
    return;
  }
  
  try {
    const files = await fs.readdir(CONFIG.contentDir);
    const mdxFiles = files.filter(file => file.endsWith('.mdx'));
    
    let updatedCount = 0;
    
    for (const file of mdxFiles) {
      const filePath = path.join(CONFIG.contentDir, file);
      const content = await fs.readFile(filePath, 'utf8');
      
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
      if (!frontmatterMatch) continue;
      
      const [, frontmatterYaml, mdxContent] = frontmatterMatch;
      const frontmatter = yaml.load(frontmatterYaml);
      
      let updated = false;
      
      // Standardize category
      if (frontmatter.category) {
        const oldCategory = frontmatter.category;
        const standardizedCategory = CATEGORY_STANDARDIZATION[oldCategory.toLowerCase()] || oldCategory;
        
        if (standardizedCategory !== oldCategory) {
          frontmatter.category = standardizedCategory;
          updated = true;
          verbose(`Updated category: ${oldCategory} → ${standardizedCategory}`);
        }
      }
      
      // Standardize tags
      if (frontmatter.tags && Array.isArray(frontmatter.tags)) {
        const oldTags = [...frontmatter.tags];
        frontmatter.tags = frontmatter.tags.map(tag => 
          TAG_STANDARDIZATION[tag.toLowerCase()] || tag
        );
        
        // Remove duplicates and sort
        frontmatter.tags = [...new Set(frontmatter.tags)].sort();
        
        if (JSON.stringify(oldTags) !== JSON.stringify(frontmatter.tags)) {
          updated = true;
          verbose(`Updated tags in ${file}`);
        }
      }
      
      if (updated) {
        // Write updated content
        const newFrontmatter = yaml.dump(frontmatter, { 
          defaultFlowStyle: false,
          quotingType: '"'
        });
        const newContent = `---\n${newFrontmatter}---\n${mdxContent}`;
        
        await fs.writeFile(filePath, newContent, 'utf8');
        updatedCount++;
      }
    }
    
    log(`Updated ${updatedCount} files with standardized taxonomy`, 'success');
    
  } catch (error) {
    log(`Error updating content: ${error.message}`, 'error');
    throw error;
  }
};

// Main function
const runAnalysis = async () => {
  try {
    log('Starting taxonomy analysis...', 'info');
    
    await analyzeContent();
    generateRecommendations();
    await generateReport();
    await updateContent();
    
    log('Taxonomy analysis complete!', 'success');
    
  } catch (error) {
    log(`Analysis failed: ${error.message}`, 'error');
    process.exit(1);
  }
};

// CLI help
const showHelp = () => {
  console.log(`
Category and Tag Mapping Tool

Usage: node map-categories.js [options]

Options:
  --verbose     Show detailed logging
  --update      Apply standardization to content files
  --help        Show this help message

Examples:
  node map-categories.js --verbose     # Run analysis with detailed logging
  node map-categories.js --update      # Apply standardization updates
  node map-categories.js               # Run analysis only
`);
};

// Handle CLI arguments
if (process.argv.includes('--help')) {
  showHelp();
  process.exit(0);
}

// Run if called directly
if (require.main === module) {
  runAnalysis().catch(error => {
    log(`Fatal error: ${error.message}`, 'error');
    process.exit(1);
  });
}

module.exports = {
  runAnalysis,
  analyzeContent,
  CONFIG
};