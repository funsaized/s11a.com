import React from "react";
import { ThemeProvider } from "./src/context/ThemeContext";

// Wrap root element with theme provider for SSR
export const wrapRootElement = ({ element }) => (
  <ThemeProvider defaultTheme="system">{element}</ThemeProvider>
);

// Inject initial theme script to prevent FOUC (Flash of Unstyled Content)
export const onRenderBody = ({ setHeadComponents }) => {
  const script = `
    (function() {
      try {
        // Get saved theme preference
        const savedTheme = localStorage.getItem('theme-preference');
        
        // Determine initial theme
        let theme = 'system';
        if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
          theme = savedTheme;
        }
        
        // Apply theme before page load
        if (theme === 'system') {
          // Remove explicit classes and let CSS media query handle system preference
          document.documentElement.classList.remove('dark', 'light');
          document.documentElement.setAttribute('data-theme', 'system');
        } else {
          // Set explicit theme class
          document.documentElement.classList.remove('dark', 'light');
          document.documentElement.classList.add(theme);
          document.documentElement.setAttribute('data-theme', theme);
        }
      } catch (e) {
        // Fallback to system preference
        console.warn('Theme initialization failed:', e);
      }
    })();
  `;

  setHeadComponents([
    <script key="theme-init" dangerouslySetInnerHTML={{ __html: script }} />,
  ]);
};
