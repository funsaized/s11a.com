#!/usr/bin/env node

const lighthouse = require("lighthouse");
const chromeLauncher = require("chrome-launcher");
const fs = require("fs");
const path = require("path");

const urls = [
  "http://localhost:8000",
  "http://localhost:8000/articles",
  "http://localhost:8000/about",
  "http://localhost:8000/articles/speedy-secured-site-hosting-made-easy-on-aws",
];

const config = {
  extends: "lighthouse:default",
  settings: {
    formFactor: "mobile",
    screenEmulation: {
      mobile: true,
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      disabled: false,
    },
  },
};

async function runLighthouse() {
  const chrome = await chromeLauncher.launch({ chromeFlags: ["--headless"] });
  const results = [];

  console.log("🚀 Starting Lighthouse performance tests...\n");

  for (const url of urls) {
    console.log(`Testing: ${url}`);

    try {
      const runnerResult = await lighthouse(
        url,
        {
          port: chrome.port,
          disableDeviceEmulation: true,
          chromeLauncherPort: chrome.port,
        },
        config,
      );

      const { lhr } = runnerResult;

      const pageResult = {
        url,
        scores: {
          performance: Math.round(lhr.categories.performance.score * 100),
          accessibility: Math.round(lhr.categories.accessibility.score * 100),
          bestPractices: Math.round(
            lhr.categories["best-practices"].score * 100,
          ),
          seo: Math.round(lhr.categories.seo.score * 100),
        },
        metrics: {
          fcp: lhr.audits["first-contentful-paint"].displayValue,
          lcp: lhr.audits["largest-contentful-paint"].displayValue,
          cls: lhr.audits["cumulative-layout-shift"].displayValue,
          inp: lhr.audits["interaction-to-next-paint"]?.displayValue || "N/A",
          tbt: lhr.audits["total-blocking-time"]?.displayValue || "N/A",
          ttfb: lhr.audits["server-response-time"]?.displayValue || "N/A",
        },
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

  if (results.length === 0) {
    throw new Error("Lighthouse did not produce any results.");
  }

  // Generate report
  const reportPath = path.join(__dirname, "lighthouse-report.json");
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

  console.log("📊 Performance Summary:");
  console.log("=".repeat(50));

  const lowestScores = results.reduce(
    (acc, result) => {
      acc.performance = Math.min(acc.performance, result.scores.performance);
      acc.accessibility = Math.min(
        acc.accessibility,
        result.scores.accessibility,
      );
      acc.bestPractices = Math.min(
        acc.bestPractices,
        result.scores.bestPractices,
      );
      acc.seo = Math.min(acc.seo, result.scores.seo);
      return acc;
    },
    { performance: 100, accessibility: 100, bestPractices: 100, seo: 100 },
  );

  console.log(`Lowest Performance: ${lowestScores.performance}/100`);
  console.log(`Lowest Accessibility: ${lowestScores.accessibility}/100`);
  console.log(`Lowest Best Practices: ${lowestScores.bestPractices}/100`);
  console.log(`Lowest SEO: ${lowestScores.seo}/100`);

  console.log(`\n📄 Detailed report saved to: ${reportPath}`);

  // Check if scores meet minimum thresholds
  const minThresholds = {
    performance: 90,
    accessibility: 95,
    bestPractices: 90,
    seo: 95,
  };
  let allPassed = true;
  console.log("\n🎯 Threshold Check:");
  for (const [category, score] of Object.entries(lowestScores)) {
    const threshold = minThresholds[category];
    const passed = score >= threshold;
    allPassed = allPassed && passed;
    const status = passed ? "✅" : "❌";
    console.log(
      `${status} ${category}: ${score}/100 (threshold: ${threshold})`,
    );
  }

  if (allPassed) {
    console.log("\n🎉 All performance thresholds met!");
    process.exit(0);
  } else {
    console.log("\n⚠️  Some thresholds not met. Consider optimizations.");
    process.exit(1);
  }
}

runLighthouse().catch(console.error);
