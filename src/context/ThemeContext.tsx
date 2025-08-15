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
  isLoading: boolean;
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
  const [isLoading, setIsLoading] = useState<boolean>(true);

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
      const root = document.documentElement;
      
      if (newTheme === "system") {
        // Remove explicit dark class and let CSS media query handle it
        root.classList.remove("dark", "light");
        root.setAttribute("data-theme", "system");
      } else {
        // Set explicit theme class
        root.classList.remove("dark", "light");
        root.classList.add(resolved);
        root.setAttribute("data-theme", resolved);
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

    // Prevent FOUC by temporarily disabling transitions
    const root = document.documentElement;
    root.classList.add("no-transitions");

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

    // Re-enable transitions after a short delay
    const enableTransitions = () => {
      root.classList.remove("no-transitions");
      setIsLoading(false);
    };
    
    // Use requestAnimationFrame to ensure DOM is updated first
    requestAnimationFrame(() => {
      setTimeout(enableTransitions, 50);
    });

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        const newResolved = getSystemTheme();
        setResolvedTheme(newResolved);
        // Update DOM to reflect system preference change
        const docRoot = document.documentElement;
        docRoot.classList.remove("dark", "light");
        docRoot.setAttribute("data-theme", "system");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
      // Cleanup: ensure transitions are enabled if component unmounts
      root.classList.remove("no-transitions");
    };
  }, [defaultTheme]);

  const value: ThemeContextType = React.useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
      toggleTheme,
      isLoading,
    }),
    [theme, resolvedTheme, setTheme, toggleTheme, isLoading]
  );

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
