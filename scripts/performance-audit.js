#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Performance Audit Script
 * Analyzes the built site for performance optimizations and provides recommendations
 */

const PERFORMANCE_BUDGETS = {
  // Core Web Vitals targets
  LCP: 2500, // Largest Contentful Paint (ms)
  FID: 100,  // First Input Delay (ms)
  CLS: 0.1,  // Cumulative Layout Shift

  // Bundle size budgets
  INITIAL_JS: 500 * 1024,      // 500KB
  TOTAL_JS: 2 * 1024 * 1024,   // 2MB
  CSS: 100 * 1024,             // 100KB
  FONTS: 300 * 1024,           // 300KB
  IMAGES_PER_PAGE: 1024 * 1024, // 1MB per page
};

function checkFileExists(filePath) {
  return fs.existsSync(path.join(__dirname, '..', filePath));
}

function getFileSize(filePath) {
  try {
    const fullPath = path.join(__dirname, '..', filePath);
    const stats = fs.statSync(fullPath);
    return stats.size;
  } catch (error) {
    return 0;
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function checkBundleSizes() {
  console.log('📦 Checking Bundle Sizes...\n');
  
  const publicDir = path.join(__dirname, '..', 'public');
  
  if (!fs.existsSync(publicDir)) {
    console.log('❌ Public directory not found. Run `npm run build` first.');
    return;
  }

  // Check JavaScript bundles
  const jsFiles = fs.readdirSync(publicDir)
    .filter(file => file.endsWith('.js'))
    .map(file => ({
      name: file,
      size: getFileSize(`public/${file}`),
      path: `public/${file}`
    }))
    .sort((a, b) => b.size - a.size);

  let totalJS = 0;
  console.log('JavaScript Files:');
  jsFiles.forEach(file => {
    totalJS += file.size;
    const status = file.size > PERFORMANCE_BUDGETS.INITIAL_JS ? '⚠️' : '✅';
    console.log(`  ${status} ${file.name}: ${formatBytes(file.size)}`);
  });

  console.log(`\nTotal JavaScript: ${formatBytes(totalJS)}`);
  console.log(`Budget: ${formatBytes(PERFORMANCE_BUDGETS.TOTAL_JS)}`);
  console.log(totalJS <= PERFORMANCE_BUDGETS.TOTAL_JS ? '✅ Within budget' : '⚠️ Over budget');

  // Check CSS files
  const cssFiles = fs.readdirSync(publicDir)
    .filter(file => file.endsWith('.css'))
    .map(file => ({
      name: file,
      size: getFileSize(`public/${file}`)
    }))
    .sort((a, b) => b.size - a.size);

  let totalCSS = 0;
  console.log('\nCSS Files:');
  cssFiles.forEach(file => {
    totalCSS += file.size;
    console.log(`  ${file.name}: ${formatBytes(file.size)}`);
  });

  console.log(`\nTotal CSS: ${formatBytes(totalCSS)}`);
  console.log(`Budget: ${formatBytes(PERFORMANCE_BUDGETS.CSS)}`);
  console.log(totalCSS <= PERFORMANCE_BUDGETS.CSS ? '✅ Within budget' : '⚠️ Over budget');
}

function checkImageOptimization() {
  console.log('\n🖼️ Checking Image Optimization...\n');

  const staticDir = path.join(__dirname, '..', 'static');
  const contentDir = path.join(__dirname, '..', 'content');
  
  let totalImages = 0;
  let optimizedImages = 0;

  function scanDirectory(dir, dirName) {
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir, { withFileTypes: true });
    files.forEach(file => {
      if (file.isDirectory()) {
        scanDirectory(path.join(dir, file.name), `${dirName}/${file.name}`);
      } else if (/\.(jpg|jpeg|png|gif|webp|avif)$/i.test(file.name)) {
        totalImages++;
        const size = getFileSize(path.join(dir, file.name).replace(path.join(__dirname, '..'), ''));
        
        if (file.name.includes('.webp') || file.name.includes('.avif')) {
          optimizedImages++;
          console.log(`✅ ${dirName}/${file.name}: ${formatBytes(size)} (modern format)`);
        } else if (size > 500 * 1024) {
          console.log(`⚠️ ${dirName}/${file.name}: ${formatBytes(size)} (consider optimization)`);
        } else {
          console.log(`✅ ${dirName}/${file.name}: ${formatBytes(size)}`);
        }
      }
    });
  }

  scanDirectory(staticDir, 'static');
  scanDirectory(contentDir, 'content');

  console.log(`\nImage Summary:`);
  console.log(`Total images: ${totalImages}`);
  console.log(`Modern formats (WebP/AVIF): ${optimizedImages} (${Math.round((optimizedImages/totalImages) * 100)}%)`);
  
  if (optimizedImages / totalImages < 0.5) {
    console.log('⚠️ Consider converting more images to modern formats (WebP/AVIF)');
  } else {
    console.log('✅ Good use of modern image formats');
  }
}

function checkPerformanceFeatures() {
  console.log('\n⚡ Checking Performance Features...\n');

  const features = [
    {
      name: 'Web Vitals monitoring',
      file: 'src/components/PerformanceMonitor/PerformanceMonitor.tsx',
      implemented: checkFileExists('src/components/PerformanceMonitor/PerformanceMonitor.tsx')
    },
    {
      name: 'Service Worker (gatsby-plugin-offline)',
      file: 'gatsby-config.ts',
      implemented: checkFileExists('gatsby-config.ts') && 
                   fs.readFileSync(path.join(__dirname, '..', 'gatsby-config.ts'), 'utf8')
                     .includes('gatsby-plugin-offline')
    },
    {
      name: 'Image optimization (gatsby-plugin-image)',
      file: 'gatsby-config.ts',
      implemented: checkFileExists('gatsby-config.ts') && 
                   fs.readFileSync(path.join(__dirname, '..', 'gatsby-config.ts'), 'utf8')
                     .includes('gatsby-plugin-image')
    },
    {
      name: 'Bundle analyzer',
      file: 'gatsby-config.ts',
      implemented: checkFileExists('gatsby-config.ts') && 
                   fs.readFileSync(path.join(__dirname, '..', 'gatsby-config.ts'), 'utf8')
                     .includes('gatsby-plugin-webpack-bundle-analyser-v2')
    },
    {
      name: 'Critical CSS inlining',
      file: 'src/layout/index.tsx',
      implemented: checkFileExists('src/layout/index.tsx') && 
                   fs.readFileSync(path.join(__dirname, '..', 'src/layout/index.tsx'), 'utf8')
                     .includes('criticalCSS')
    },
    {
      name: 'Font preloading',
      file: 'src/layout/index.tsx',
      implemented: checkFileExists('src/layout/index.tsx') && 
                   fs.readFileSync(path.join(__dirname, '..', 'src/layout/index.tsx'), 'utf8')
                     .includes('rel="preload"')
    }
  ];

  features.forEach(feature => {
    const status = feature.implemented ? '✅' : '❌';
    console.log(`  ${status} ${feature.name}`);
  });

  const implementedCount = features.filter(f => f.implemented).length;
  console.log(`\nImplemented: ${implementedCount}/${features.length} features`);
  
  if (implementedCount === features.length) {
    console.log('🎉 All performance features implemented!');
  } else {
    console.log('⚠️ Some performance features are missing');
  }
}

function generateRecommendations() {
  console.log('\n💡 Performance Recommendations:\n');

  const recommendations = [
    '1. Use `npm run build:analyze` to analyze bundle sizes',
    '2. Monitor Core Web Vitals in production using the PerformanceMonitor component',
    '3. Regularly audit images and convert to WebP/AVIF formats',
    '4. Test performance on slow networks and devices',
    '5. Use Lighthouse CI for automated performance testing',
    '6. Consider implementing resource hints for third-party domains',
    '7. Monitor bundle size growth over time',
    '8. Use proper image sizing with gatsby-plugin-image',
    '9. Implement proper caching headers in your hosting provider',
    '10. Consider code splitting for large components'
  ];

  recommendations.forEach(rec => console.log(rec));

  console.log('\n📊 Performance Budget Summary:');
  console.log(`• LCP target: <${PERFORMANCE_BUDGETS.LCP}ms`);
  console.log(`• FID target: <${PERFORMANCE_BUDGETS.FID}ms`);
  console.log(`• CLS target: <${PERFORMANCE_BUDGETS.CLS}`);
  console.log(`• Initial JS budget: ${formatBytes(PERFORMANCE_BUDGETS.INITIAL_JS)}`);
  console.log(`• Total JS budget: ${formatBytes(PERFORMANCE_BUDGETS.TOTAL_JS)}`);
  console.log(`• CSS budget: ${formatBytes(PERFORMANCE_BUDGETS.CSS)}`);
}

function main() {
  console.log('🚀 Performance Audit Report\n');
  console.log('='.repeat(50));
  
  checkPerformanceFeatures();
  checkBundleSizes();
  checkImageOptimization();
  generateRecommendations();
  
  console.log('\n' + '='.repeat(50));
  console.log('✨ Audit complete! Review the recommendations above.\n');
}

if (require.main === module) {
  main();
}

module.exports = {
  PERFORMANCE_BUDGETS,
  checkBundleSizes,
  checkImageOptimization,
  checkPerformanceFeatures,
  generateRecommendations
};