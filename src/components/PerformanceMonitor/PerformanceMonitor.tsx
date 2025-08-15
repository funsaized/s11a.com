import React, { useEffect } from 'react';
import { onCLS, onFCP, onLCP, onTTFB, onINP } from 'web-vitals';

interface PerformanceMetric {
  name: string;
  value: number;
  delta: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  navigationType: string;
}

interface PerformanceMonitorProps {
  enableAnalytics?: boolean;
  reportToConsole?: boolean;
  reportToAnalytics?: (metric: PerformanceMetric) => void;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  enableAnalytics = false,
  reportToConsole = process.env.NODE_ENV === 'development',
  reportToAnalytics,
}) => {
  useEffect(() => {
    // Performance metrics tracking function
    const handleMetric = (metric: any) => {
      const performanceMetric: PerformanceMetric = {
        name: metric.name,
        value: metric.value,
        delta: metric.delta,
        rating: metric.rating,
        navigationType: metric.navigationType || 'unknown',
      };

      // Console logging in development
      if (reportToConsole) {
        const color = metric.rating === 'good' ? 'green' : metric.rating === 'needs-improvement' ? 'orange' : 'red';
        console.log(
          `%c${metric.name}: ${Math.round(metric.value)}ms (${metric.rating})`,
          `color: ${color}; font-weight: bold;`
        );
      }

      // Custom analytics reporting
      if (enableAnalytics && reportToAnalytics) {
        reportToAnalytics(performanceMetric);
      }

      // Send to Google Analytics 4 if available
      if (typeof window !== 'undefined' && (window as any).gtag && enableAnalytics) {
        (window as any).gtag('event', metric.name, {
          event_category: 'Web Vitals',
          value: Math.round(metric.value),
          custom_parameter_1: metric.rating,
        });
      }
    };

    // Register all Web Vitals metrics (web-vitals v5)
    onCLS(handleMetric);
    onFCP(handleMetric);
    onLCP(handleMetric);
    onTTFB(handleMetric);
    
    // INP (Interaction to Next Paint) - replacement for FID in v5
    onINP(handleMetric);

    // Layout shift prevention observer
    if ('PerformanceObserver' in window) {
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
            const layoutShiftEntry = entry as any;
            if (layoutShiftEntry.value > 0.1 && reportToConsole) {
              console.warn(
                `⚠️ Layout Shift detected: ${layoutShiftEntry.value.toFixed(4)}`,
                layoutShiftEntry.sources?.map((source: any) => source.node) || []
              );
            }
          }
        }
      });

      clsObserver.observe({ type: 'layout-shift', buffered: true });

      // Long task observer for performance issues
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50 && reportToConsole) {
            console.warn(
              `🐌 Long task detected: ${Math.round(entry.duration)}ms`,
              entry.name
            );
          }
        }
      });

      try {
        longTaskObserver.observe({ type: 'longtask', buffered: true });
      } catch (e) {
        // Long task API not supported
      }

      // Resource timing observer for loading performance
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const resource = entry as PerformanceResourceTiming;
          if (resource.duration > 1000 && reportToConsole) {
            console.warn(
              `📦 Slow resource: ${resource.name} took ${Math.round(resource.duration)}ms`
            );
          }
        }
      });

      resourceObserver.observe({ type: 'resource', buffered: true });

      // Cleanup observers
      return () => {
        clsObserver.disconnect();
        longTaskObserver.disconnect();
        resourceObserver.disconnect();
      };
    }
  }, [enableAnalytics, reportToConsole, reportToAnalytics]);

  // CLS Prevention: Add stabilization for dynamic content
  useEffect(() => {
    // Add resize observer for dynamic content
    if ('ResizeObserver' in window) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const element = entry.target as HTMLElement;
          
          // Add transition to prevent jarring layout shifts
          if (!element.style.transition.includes('height')) {
            element.style.transition = `${element.style.transition} height 0.2s ease-out`.trim();
          }
        }
      });

      // Observe common dynamic elements
      const dynamicElements = document.querySelectorAll('[data-dynamic], .dynamic-content');
      dynamicElements.forEach((element) => {
        resizeObserver.observe(element);
      });

      return () => resizeObserver.disconnect();
    }
  }, []);

  // No UI rendered - this is a monitoring component
  return null;
};

export default PerformanceMonitor;

// Utility function for manual performance reporting
export const reportWebVitals = (reportToAnalytics?: (metric: PerformanceMetric) => void) => {
  const handleMetric = (metric: any) => {
    if (reportToAnalytics) {
      reportToAnalytics({
        name: metric.name,
        value: metric.value,
        delta: metric.delta,
        rating: metric.rating,
        navigationType: metric.navigationType || 'unknown',
      });
    }
  };

  onCLS(handleMetric);
  onFCP(handleMetric);
  onLCP(handleMetric);
  onTTFB(handleMetric);
  onINP(handleMetric);
};

// Performance budget checker
export const checkPerformanceBudgets = (): Promise<{
  lcp: { value: number; budget: number; passed: boolean };
  inp: { value: number; budget: number; passed: boolean };
  cls: { value: number; budget: number; passed: boolean };
}> => {
  return new Promise((resolve) => {
    const budgets = {
      lcp: 2500, // 2.5s
      inp: 200,  // 200ms (INP replaces FID)
      cls: 0.1,  // 0.1
    };

    const results = {
      lcp: { value: 0, budget: budgets.lcp, passed: false },
      inp: { value: 0, budget: budgets.inp, passed: false },
      cls: { value: 0, budget: budgets.cls, passed: false },
    };

    let metricsCollected = 0;
    const totalMetrics = 3;

    const checkComplete = () => {
      metricsCollected++;
      if (metricsCollected === totalMetrics) {
        resolve(results);
      }
    };

    onLCP((metric) => {
      results.lcp.value = metric.value;
      results.lcp.passed = metric.value <= budgets.lcp;
      checkComplete();
    });

    onINP((metric) => {
      results.inp.value = metric.value;
      results.inp.passed = metric.value <= budgets.inp;
      checkComplete();
    });

    onCLS((metric) => {
      results.cls.value = metric.value;
      results.cls.passed = metric.value <= budgets.cls;
      checkComplete();
    });
  });
};