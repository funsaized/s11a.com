import { useEffect, useState, useSyncExternalStore } from "react";

type Theme = "light" | "dark" | "system";
const subscribeToHydration = () => () => {};

function getStoredTheme(): Theme {
	if (typeof window === "undefined") return "system";
	try {
		const stored = localStorage.getItem("theme");
		if (stored === "light" || stored === "dark" || stored === "system") {
			return stored;
		}
	} catch {}
	return "system";
}

export function useTheme() {
	const [theme, setTheme] = useState<Theme>(getStoredTheme);
	const mounted = useSyncExternalStore(
		subscribeToHydration,
		() => true,
		() => false,
	);

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

		// If theme is system, subscribe to OS theme changes
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
