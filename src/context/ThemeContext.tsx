import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

// Types
export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

// Context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme provider component
interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
}: ThemeProviderProps): React.ReactElement {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");

  // Get system preference
  const getSystemTheme = (): ResolvedTheme => {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  };

  // Resolve theme to actual light/dark value
  const resolveTheme = (currentTheme: Theme): ResolvedTheme => {
    if (currentTheme === "system") {
      return getSystemTheme();
    }
    return currentTheme;
  };

  // Update DOM and resolved theme
  const updateTheme = (newTheme: Theme) => {
    const resolved = resolveTheme(newTheme);
    setResolvedTheme(resolved);

    if (typeof document !== "undefined") {
      if (newTheme === "system") {
        // Remove explicit theme attribute to let CSS handle system preference
        document.documentElement.removeAttribute("data-theme");
      } else {
        // Set explicit theme
        document.documentElement.setAttribute("data-theme", resolved);
      }
    }
  };

  // Set theme with persistence
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    updateTheme(newTheme);

    // Persist to localStorage
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("theme-preference", newTheme);
      } catch (error) {
        console.warn("Failed to save theme preference:", error);
      }
    }
  };

  // Toggle between light, dark, and system
  const toggleTheme = () => {
    const themeOrder: Theme[] = ["light", "dark", "system"];
    const currentIndex = themeOrder.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    setTheme(themeOrder[nextIndex]);
  };

  // Initialize theme on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Get saved theme preference
    let savedTheme: Theme = defaultTheme;
    try {
      const saved = localStorage.getItem("theme-preference") as Theme;
      if (saved && ["light", "dark", "system"].includes(saved)) {
        savedTheme = saved;
      }
    } catch (error) {
      console.warn("Failed to load theme preference:", error);
    }

    setThemeState(savedTheme);
    updateTheme(savedTheme);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (savedTheme === "system") {
        const newResolved = getSystemTheme();
        setResolvedTheme(newResolved);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [defaultTheme]);

  const value: ThemeContextType = {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

// Custom hook to use theme context
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

// Helper hook for theme-aware styles
export function useThemeAware() {
  const { resolvedTheme } = useTheme();

  return {
    isDark: resolvedTheme === "dark",
    isLight: resolvedTheme === "light",
    resolvedTheme,
  };
}
