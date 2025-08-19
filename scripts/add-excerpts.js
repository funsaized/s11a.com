#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const matter = require('gray-matter');

const articlesDir = path.join(__dirname, '../src/content/articles');

// Extract first paragraph or sentences as excerpt
const extractExcerpt = (content, maxLength = 160) => {
  // Remove frontmatter if present
  const cleanContent = content.replace(/^---[\s\S]*?---\n/, '');
  
  // Remove markdown headers
  const withoutHeaders = cleanContent.replace(/^#+\s+.+$/gm, '');
  
  // Get first paragraph or sentences
  const paragraphs = withoutHeaders.trim().split(/\n\n+/);
  let excerpt = '';
  
  for (const para of paragraphs) {
    // Skip empty paragraphs or code blocks
    if (!para.trim() || para.startsWith('```')) continue;
    
    // Clean up the paragraph
    const cleaned = para
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links
      .replace(/[*_`]/g, '') // Remove formatting
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    if (cleaned.length > 20) {
      excerpt = cleaned;
      break;
    }
  }
  
  // Truncate if too long
  if (excerpt.length > maxLength) {
    excerpt = excerpt.substring(0, maxLength).trim();
    const lastSpace = excerpt.lastIndexOf(' ');
    if (lastSpace > 100) {
      excerpt = excerpt.substring(0, lastSpace) + '...';
    }
  }
  
  return excerpt;
};

const updateArticleExcerpts = async () => {
  try {
    const files = await fs.readdir(articlesDir);
    const mdxFiles = files.filter(file => file.endsWith('.mdx'));
    
    console.log(`Found ${mdxFiles.length} articles to process...`);
    
    for (const file of mdxFiles) {
      const filePath = path.join(articlesDir, file);
      const fileContent = await fs.readFile(filePath, 'utf8');
      const { data, content } = matter(fileContent);
      
      // Skip if excerpt already exists and is not empty
      if (data.excerpt && data.excerpt.trim() !== '') {
        console.log(`✓ ${file} - already has excerpt`);
        continue;
      }
      
      // Extract excerpt from content
      const excerpt = extractExcerpt(content);
      
      if (!excerpt) {
        console.log(`⚠ ${file} - could not extract excerpt`);
        continue;
      }
      
      // Update frontmatter
      data.excerpt = excerpt;
      
      // Reconstruct the file
      const newContent = matter.stringify(content, data);
      
      // Write back to file
      await fs.writeFile(filePath, newContent, 'utf8');
      console.log(`✅ ${file} - added excerpt: "${excerpt.substring(0, 50)}..."`);
    }
    
    console.log('\nDone! Excerpts have been added to articles.');
  } catch (error) {
    console.error('Error processing articles:', error);
    process.exit(1);
  }
};

updateArticleExcerpts();