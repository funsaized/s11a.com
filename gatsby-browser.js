import { onCLS, onINP, onLCP, onFCP, onTTFB } from 'web-vitals';
import React from 'react';
import { ThemeProvider } from './src/context/ThemeContext';

// Lazy load images that are not in viewport & Initialize Web Vitals
export const onClientEntry = () => {
  // IntersectionObserver polyfill for older browsers
  if (typeof window !== "undefined" && !window.IntersectionObserver) {
    import("intersection-observer");
  }
  
  // Web Vitals monitoring
  if (typeof window !== "undefined") {
    const sendToAnalytics = (metric) => {
      // Log to console in development
      if (process.env.NODE_ENV === "development") {
        console.log(`[Web Vitals] ${metric.name}:`, metric.value.toFixed(2), metric.rating || 'N/A');
      }
      
      // You can send to your analytics service here
      // Example: window.gtag('event', metric.name, { value: metric.value, rating: metric.rating });
    };
    
    onCLS(sendToAnalytics);
    onINP(sendToAnalytics); // INP replaced FID in web-vitals v5
    onLCP(sendToAnalytics);
    onFCP(sendToAnalytics);
    onTTFB(sendToAnalytics);
  }
};

// Log web vitals on route changes
export const onRouteUpdate = ({ location, prevLocation }) => {
  if (process.env.NODE_ENV === "production" && typeof window !== "undefined") {
    // Track page views if needed
    console.log("Route changed from", prevLocation, "to", location);
  }
};

// Optimize prefetching
export const disableCorePrefetching = () => true;

// Custom prefetch logic - only prefetch when user is likely to click
export const onPrefetchPathname = ({ pathname }) => {
  // Only prefetch blog posts when hovering
  if (pathname.includes("/blog/") || pathname.includes("/tags/")) {
    return true;
  }
  // Don't prefetch other pages automatically
  return false;
};

// Service worker updates
export const onServiceWorkerUpdateReady = () => {
  const answer = window.confirm(
    "This application has been updated. Reload to display the latest version?",
  );
  if (answer === true) {
    window.location.reload();
  }
};

// Wrap root element with theme provider
export const wrapRootElement = ({ element }) => {
  return (
    <ThemeProvider defaultTheme="system">
      {element}
    </ThemeProvider>
  );
};
