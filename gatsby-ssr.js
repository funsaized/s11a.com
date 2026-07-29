const React = require("react");

// Prevent theme flashing on load
exports.onRenderBody = ({ setPreBodyComponents }) => {
  setPreBodyComponents([
    React.createElement("script", {
      key: "theme-init",
      dangerouslySetInnerHTML: {
        __html: `
          (function() {
            let theme = 'system';
            try {
              theme = localStorage.getItem('theme') || 'system';
            } catch (_) {}
            if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.add('light');
            }
          })();
        `,
      },
    }),
  ]);
};
