#!/usr/bin/env node

/**
 * Image Migration and Optimization Script
 * 
 * This script handles:
 * - Extracting images from existing articles
 * - Downloading and optimizing images
 * - Converting to modern formats (WebP, AVIF)
 * - Updating image references in MDX files
 * - Creating responsive image variants
 */

const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const sharp = require('sharp');
const cheerio = require('cheerio');

// Configuration
const CONFIG = {
  sourceUrl: 'https://s11a.com',
  outputDir: path.join(__dirname, '../../static/images/articles'),
  contentDir: path.join(__dirname, '../../src/content/articles'),
  maxConcurrent: 3,
  delay: 500,
  dryRun: process.argv.includes('--dry-run'),
  verbose: process.argv.includes('--verbose'),
  
  // Image optimization settings
  imageSettings: {
    quality: 85,
    progressive: true,
    formats: ['webp', 'jpg'],
    sizes: [400, 800, 1200, 1600]
  }
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

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Extract images from HTML content
const extractImagesFromHTML = (htmlContent) => {
  const $ = cheerio.load(htmlContent);
  const images = [];
  
  $('img').each((i, el) => {
    const $img = $(el);
    const src = $img.attr('src');
    const alt = $img.attr('alt') || '';
    const title = $img.attr('title') || '';
    
    if (src) {
      images.push({
        src: src.startsWith('http') ? src : `${CONFIG.sourceUrl}${src}`,
        alt,
        title,
        element: $img
      });
    }
  });
  
  return images;
};

// Download and process image
const downloadAndProcessImage = async (imageUrl, outputPath, fileName) => {
  try {
    verbose(`Downloading image: ${imageUrl}`);
    
    const response = await axios({
      method: 'GET',
      url: imageUrl,
      responseType: 'arraybuffer',
      timeout: 30000
    });
    
    const imageBuffer = Buffer.from(response.data);
    
    // Create output directory
    await fs.mkdir(outputPath, { recursive: true });
    
    const processedImages = [];
    
    // Generate different sizes and formats
    for (const size of CONFIG.imageSettings.sizes) {
      for (const format of CONFIG.imageSettings.formats) {
        const outputFileName = `${fileName}-${size}w.${format}`;
        const outputFilePath = path.join(outputPath, outputFileName);
        
        await sharp(imageBuffer)
          .resize(size, null, {
            withoutEnlargement: true,
            fit: 'inside'
          })
          .toFormat(format, {
            quality: CONFIG.imageSettings.quality,
            progressive: CONFIG.imageSettings.progressive
          })
          .toFile(outputFilePath);
        
        processedImages.push({
          size,
          format,
          fileName: outputFileName,
          path: outputFilePath
        });
      }
    }
    
    verbose(`✓ Processed ${processedImages.length} image variants for ${fileName}`);
    return processedImages;
    
  } catch (error) {
    log(`Error processing image ${imageUrl}: ${error.message}`, 'error');
    return [];
  }
};

// Generate responsive image markup
const generateResponsiveImageMarkup = (imageName, alt, title) => {
  const basePath = `/images/articles/${imageName}`;
  
  // Generate srcset for WebP
  const webpSrcset = CONFIG.imageSettings.sizes
    .map(size => `${basePath}-${size}w.webp ${size}w`)
    .join(', ');
  
  // Generate srcset for fallback
  const jpgSrcset = CONFIG.imageSettings.sizes
    .map(size => `${basePath}-${size}w.jpg ${size}w`)
    .join(', ');
  
  return `
<picture>
  <source 
    srcSet="${webpSrcset}"
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
    type="image/webp"
  />
  <img 
    src="${basePath}-800w.jpg"
    srcSet="${jpgSrcset}"
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
    alt="${alt}"
    ${title ? `title="${title}"` : ''}
    loading="lazy"
  />
</picture>`.trim();
};

// Process images in a single MDX file
const processImagesInFile = async (filePath) => {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const fileName = path.basename(filePath, '.mdx');
    
    verbose(`Processing images in: ${fileName}.mdx`);
    
    // Extract frontmatter and content
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!frontmatterMatch) {
      log(`No frontmatter found in ${fileName}.mdx`, 'warn');
      return;
    }
    
    const [, frontmatter, mdxContent] = frontmatterMatch;
    
    // Find HTML img tags in the content
    const images = extractImagesFromHTML(mdxContent);
    
    if (images.length === 0) {
      verbose(`No images found in ${fileName}.mdx`);
      return;
    }
    
    log(`Found ${images.length} images in ${fileName}.mdx`);
    
    let updatedContent = mdxContent;
    let imageIndex = 0;
    
    // Process each image
    for (const image of images) {
      imageIndex++;
      const imageName = `${fileName}-${imageIndex}`;
      const outputPath = path.join(CONFIG.outputDir, fileName);
      
      if (!CONFIG.dryRun) {
        // Download and process image
        const processedImages = await downloadAndProcessImage(
          image.src,
          outputPath,
          imageName
        );
        
        if (processedImages.length > 0) {
          // Replace image in content
          const responsiveMarkup = generateResponsiveImageMarkup(
            `${fileName}/${imageName}`,
            image.alt,
            image.title
          );
          
          // Find and replace the original img tag
          const imgTagPattern = new RegExp(
            `<img[^>]*src=[\"']${image.src.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\"'][^>]*>`,
            'g'
          );
          
          updatedContent = updatedContent.replace(imgTagPattern, responsiveMarkup);
        }
      } else {
        log(`[DRY RUN] Would process image: ${image.src}`, 'info');
      }
      
      await delay(CONFIG.delay);
    }
    
    // Write updated content back to file
    if (!CONFIG.dryRun && updatedContent !== mdxContent) {
      const finalContent = `---\n${frontmatter}\n---\n${updatedContent}`;
      await fs.writeFile(filePath, finalContent, 'utf8');
      log(`✓ Updated image references in ${fileName}.mdx`, 'success');
    }
    
  } catch (error) {
    log(`Error processing images in ${filePath}: ${error.message}`, 'error');
  }
};

// Main function to process all MDX files
const processAllImages = async () => {
  try {
    log('Starting image migration and optimization...', 'info');
    
    if (CONFIG.dryRun) {
      log('Running in DRY RUN mode - no files will be modified', 'info');
    }
    
    // Get all MDX files
    const files = await fs.readdir(CONFIG.contentDir);
    const mdxFiles = files.filter(file => file.endsWith('.mdx'));
    
    if (mdxFiles.length === 0) {
      log('No MDX files found to process', 'warn');
      return;
    }
    
    log(`Found ${mdxFiles.length} MDX files to process`);
    
    // Process files in batches
    let processedCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < mdxFiles.length; i += CONFIG.maxConcurrent) {
      const batch = mdxFiles.slice(i, i + CONFIG.maxConcurrent);
      
      const results = await Promise.allSettled(
        batch.map(file => processImagesInFile(path.join(CONFIG.contentDir, file)))
      );
      
      results.forEach(result => {
        if (result.status === 'fulfilled') {
          processedCount++;
        } else {
          errorCount++;
          log(`Batch processing error: ${result.reason}`, 'error');
        }
      });
      
      const completed = i + batch.length;
      log(`Progress: ${completed}/${mdxFiles.length} files processed`, 'info');
    }
    
    log(`Image processing complete: ${processedCount} successful, ${errorCount} errors`, 
        errorCount > 0 ? 'warn' : 'success');
    
  } catch (error) {
    log(`Image processing failed: ${error.message}`, 'error');
    process.exit(1);
  }
};

// CLI help
const showHelp = () => {
  console.log(`
Image Migration and Optimization Tool

Usage: node extract-images.js [options]

Options:
  --dry-run     Run without downloading/modifying files
  --verbose     Show detailed logging
  --help        Show this help message

Examples:
  node extract-images.js --dry-run     # Preview image processing
  node extract-images.js --verbose     # Run with detailed logging
  node extract-images.js               # Run image migration
`);
};

// Handle CLI arguments
if (process.argv.includes('--help')) {
  showHelp();
  process.exit(0);
}

// Run if called directly
if (require.main === module) {
  processAllImages().catch(error => {
    log(`Fatal error: ${error.message}`, 'error');
    process.exit(1);
  });
}

module.exports = {
  processAllImages,
  processImagesInFile,
  extractImagesFromHTML,
  CONFIG
};