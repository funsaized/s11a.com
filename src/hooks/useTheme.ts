import { useState, useEffect } from "react";

type Theme = "light" | "dark" | "system";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem("theme") as Theme | null;
      if (stored && ["light", "dark", "system"].includes(stored)) {
        setTheme(stored);
      }
    } catch {
      // System theme remains active when storage is blocked.
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const applyTheme = () => {
      const resolvedTheme =
        theme === "system" ? (mediaQuery.matches ? "dark" : "light") : theme;
      root.classList.remove("light", "dark");
      root.classList.add(resolvedTheme);
    };

    applyTheme();
    if (theme === "system") {
      mediaQuery.addEventListener("change", applyTheme);
    }
    try {
      localStorage.setItem("theme", theme);
    } catch {
      // Theme still works when storage is blocked.
    }

    return () => mediaQuery.removeEventListener("change", applyTheme);
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme((current) => {
      switch (current) {
        case "light":
          return "dark";
        case "dark":
          return "system";
        case "system":
          return "light";
        default:
          return "light";
      }
    });
  };

  return { theme, setTheme, toggleTheme, mounted };
}
