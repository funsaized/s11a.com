import React from "react";
import Helmet from "react-helmet";
import config from "../../data/SiteConfig";
import "../styles/globals.css";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader } from "../components/ui/sidebar";

interface MainLayoutProps {
  children: React.ReactNode;
}

function MainLayout({ children }: MainLayoutProps): React.ReactElement {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background">
        <Helmet>
          <meta name="description" content={config.siteDescription} />
          <html lang="en" />
          {/* Resource hints for better performance */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
          <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
          <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
          <link rel="preconnect" href="https://cdn.jsdelivr.net" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1, shrink-to-fit=no"
          />
          <meta httpEquiv="x-ua-compatible" content="ie=edge" />
        </Helmet>
        
        {/* Skip navigation link for accessibility */}
        <a href="#main-content" className="skip-nav">
          Skip to main content
        </a>
        
        {/* Sidebar */}
        <Sidebar>
          <SidebarHeader>
            <h2 className="text-lg font-semibold">Navigation</h2>
          </SidebarHeader>
          <SidebarContent>
            <nav className="space-y-2">
              {config.menuLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.link}
                  className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </nav>
          </SidebarContent>
        </Sidebar>

        {/* Main content area */}
        <div className="flex flex-col min-h-screen">
          <Navbar menuLinks={config.menuLinks} />
          <main id="main-content" className="flex-1 pt-16">
            {children}
          </main>
          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
}

export default MainLayout;
