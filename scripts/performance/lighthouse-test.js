#!/usr/bin/env node

const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');

const urls = [
  'http://localhost:8000',
  'http://localhost:8000/articles',
  'http://localhost:8000/about',
  'http://localhost:8000/articles/speedy-secured-site-hosting-made-easy-on-aws'
];

const config = {
  extends: 'lighthouse:default',
  settings: {
    formFactor: 'desktop',
    throttling: {
      rttMs: 40,
      throughputKbps: 10 * 1024,
      cpuSlowdownMultiplier: 1,
    },
  },
};

async function runLighthouse() {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  const results = [];

  console.log('🚀 Starting Lighthouse performance tests...\n');

  for (const url of urls) {
    console.log(`Testing: ${url}`);
    
    try {
      const runnerResult = await lighthouse(url, {
        port: chrome.port,
        disableDeviceEmulation: true,
        chromeLauncherPort: chrome.port,
      }, config);

      const { lhr } = runnerResult;
      
      const pageResult = {
        url,
        scores: {
          performance: Math.round(lhr.categories.performance.score * 100),
          accessibility: Math.round(lhr.categories.accessibility.score * 100),
          bestPractices: Math.round(lhr.categories['best-practices'].score * 100),
          seo: Math.round(lhr.categories.seo.score * 100),
        },
        metrics: {
          fcp: lhr.audits['first-contentful-paint'].displayValue,
          lcp: lhr.audits['largest-contentful-paint'].displayValue,
          cls: lhr.audits['cumulative-layout-shift'].displayValue,
          fid: lhr.audits['max-potential-fid']?.displayValue || 'N/A',
          ttfb: lhr.audits['server-response-time']?.displayValue || 'N/A',
        }
      };

      results.push(pageResult);
      
      console.log(`✅ Performance: ${pageResult.scores.performance}`);
      console.log(`✅ Accessibility: ${pageResult.scores.accessibility}`);
      console.log(`✅ Best Practices: ${pageResult.scores.bestPractices}`);
      console.log(`✅ SEO: ${pageResult.scores.seo}\n`);
      
    } catch (error) {
      console.error(`❌ Error testing ${url}:`, error.message);
    }
  }

  await chrome.kill();

  // Generate report
  const reportPath = path.join(__dirname, 'lighthouse-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  
  console.log('📊 Performance Summary:');
  console.log('='.repeat(50));
  
  const avgScores = results.reduce((acc, result) => {
    acc.performance += result.scores.performance;
    acc.accessibility += result.scores.accessibility;
    acc.bestPractices += result.scores.bestPractices;
    acc.seo += result.scores.seo;
    return acc;
  }, { performance: 0, accessibility: 0, bestPractices: 0, seo: 0 });

  const numResults = results.length;
  console.log(`Average Performance: ${Math.round(avgScores.performance / numResults)}/100`);
  console.log(`Average Accessibility: ${Math.round(avgScores.accessibility / numResults)}/100`);
  console.log(`Average Best Practices: ${Math.round(avgScores.bestPractices / numResults)}/100`);
  console.log(`Average SEO: ${Math.round(avgScores.seo / numResults)}/100`);
  
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  
  // Check if scores meet minimum thresholds
  const minThresholds = { performance: 90, accessibility: 95, bestPractices: 90, seo: 95 };
  const avgFinalScores = {
    performance: Math.round(avgScores.performance / numResults),
    accessibility: Math.round(avgScores.accessibility / numResults),
    bestPractices: Math.round(avgScores.bestPractices / numResults),
    seo: Math.round(avgScores.seo / numResults)
  };
  
  let allPassed = true;
  console.log('\n🎯 Threshold Check:');
  for (const [category, score] of Object.entries(avgFinalScores)) {
    const threshold = minThresholds[category];
    const passed = score >= threshold;
    allPassed = allPassed && passed;
    const status = passed ? '✅' : '❌';
    console.log(`${status} ${category}: ${score}/100 (threshold: ${threshold})`);
  }
  
  if (allPassed) {
    console.log('\n🎉 All performance thresholds met!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some thresholds not met. Consider optimizations.');
    process.exit(1);
  }
}

runLighthouse().catch(console.error);