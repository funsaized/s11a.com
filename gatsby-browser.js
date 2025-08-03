// Lazy load images that are not in viewport
export const onClientEntry = () => {
  // IntersectionObserver polyfill for older browsers
  if (typeof window !== "undefined" && !window.IntersectionObserver) {
    import("intersection-observer");
  }
};

// Log web vitals
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
