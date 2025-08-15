import React, { useEffect } from "react";
import Helmet from "react-helmet";
import config from "../../data/SiteConfig";
import "./index.css";
import "../styles/globals.css";

// Modern self-hosted fonts via Fontsource
import "@fontsource-variable/inter";
import "@fontsource-variable/jetbrains-mono";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import AppSidebar from "../components/AppSidebar/AppSidebar";
import { SidebarProvider, SidebarInset } from "../components/ui/sidebar";
import PerformanceMonitor from "../components/PerformanceMonitor/PerformanceMonitor";
import PerformanceDashboard from "../components/PerformanceDashboard/PerformanceDashboard";

// Enhanced UX components
import { Toaster } from "../components/ui/toast";
import PageTransition from "../components/ui/page-transition";
import ScrollProgress from "../components/ui/scroll-progress";
import { ThemeProvider } from "../context/ThemeContext";

interface MainLayoutProps {
  children: React.ReactNode;
}

function MainLayout({ children }: MainLayoutProps): React.ReactElement {
  // Initialize no-transition class to prevent FOUC
  useEffect(() => {
    // Add no-transitions class immediately
    document.body.classList.add('no-transitions');
    
    // Remove no-transitions class after initial paint
    const timer = setTimeout(() => {
      document.body.classList.remove('no-transitions');
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Critical CSS for above-the-fold content
  const criticalCSS = `
    /* Critical layout styles */
    .min-h-screen{min-height:100vh}
    .bg-background{background-color:hsl(var(--background))}
    .pt-20{padding-top:5rem}
    .pb-16{padding-bottom:4rem}
    /* Font loading optimization */
    @font-face{font-family:'Inter Variable';font-style:normal;font-weight:100 900;font-display:swap;src:url('/fonts/inter-variable.woff2') format('woff2')}
    @font-face{font-family:'JetBrains Mono Variable';font-style:normal;font-weight:100 800;font-display:swap;src:url('/fonts/jetbrains-mono-variable.woff2') format('woff2')}
  `;

  return (
    <ThemeProvider>
      <Helmet>
            <meta name="description" content={config.siteDescription} />
            <html lang="en" />
            
            {/* Critical CSS inlined */}
            <style>{criticalCSS}</style>
            
            {/* Font preloading for performance */}
            <link
              rel="preload"
              as="font"
              type="font/woff2"
              href="/fonts/inter-variable.woff2"
              crossOrigin="anonymous"
            />
            <link
              rel="preload"
              as="font"
              type="font/woff2"
              href="/fonts/jetbrains-mono-variable.woff2"
              crossOrigin="anonymous"
            />
            
            {/* Enhanced resource hints */}
            <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
            <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
            <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
            <link rel="preconnect" href="https://cdn.jsdelivr.net" />
            
            {/* Performance optimization headers */}
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
            />
            <meta httpEquiv="x-ua-compatible" content="ie=edge" />
            <meta name="format-detection" content="telephone=no" />
            
            {/* Reduced motion support */}
            <meta name="theme-color" content="hsl(var(--background))" />
      </Helmet>
      
      <SidebarProvider defaultOpen={true}>
        {/* Global scroll progress indicator */}
        <ScrollProgress 
          height={3}
          position="top"
          smoothAnimation={true}
        />
        
        {/* Skip navigation link for accessibility */}
        <a href="#main-content" className="skip-nav">
          Skip to main content
        </a>
        
        <AppSidebar />
        <SidebarInset>
          <Navbar menuLinks={config.menuLinks} />
          
          <main id="main-content" className="min-h-[calc(100vh-5rem)] pt-20">
            <PageTransition className="min-h-full">
              {children}
            </PageTransition>
          </main>
          
          <Footer />
        </SidebarInset>
        
        {/* Performance monitoring components */}
        <PerformanceMonitor 
          enableAnalytics={process.env.NODE_ENV === 'production'}
          reportToConsole={process.env.NODE_ENV === 'development'}
        />
        <PerformanceDashboard 
          enabled={process.env.NODE_ENV === 'development'}
          position="bottom-right"
          collapsed={true}
        />
        
        {/* Toast notification system */}
        <Toaster />
      </SidebarProvider>
    </ThemeProvider>
  );
}

export default MainLayout;
