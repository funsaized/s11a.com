import { useTheme } from "#/hooks/useTheme";

import { CoffeeCup } from "./CoffeeCup";
import { Button } from "./ui/button";

const SystemIcon = () => (
	<svg
		className="h-[1.2rem] w-[1.2rem]"
		fill="none"
		stroke="currentColor"
		viewBox="0 0 24 24"
		xmlns="http://www.w3.org/2000/svg"
	>
		<rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
		<line x1="8" y1="21" x2="16" y2="21" />
		<line x1="12" y1="17" x2="12" y2="21" />
	</svg>
);

export function ThemeToggle() {
	const { theme, toggleTheme, mounted } = useTheme();

	if (!mounted) {
		return (
			<Button variant="ghost" size="icon" className="h-9 w-9">
				<SystemIcon />
				<span className="sr-only">Toggle theme</span>
			</Button>
		);
	}

	const getIcon = () => {
		switch (theme) {
			case "light":
				return <CoffeeCup variant="filled" />;
			case "dark":
				return <CoffeeCup variant="filled" />;
			case "system":
				return <SystemIcon />;
			default:
				return <SystemIcon />;
		}
	};

	const getThemeLabel = () => {
		switch (theme) {
			case "light":
				return "latte";
			case "dark":
				return "espresso";
			case "system":
				return "system";
			default:
				return "system";
		}
	};

	const getLabel = () => {
		switch (theme) {
			case "light":
				return "Switch to dark mode";
			case "dark":
				return "Switch to system mode";
			case "system":
				return "Switch to light mode";
			default:
				return "Toggle theme";
		}
	};

	return (
		<Button
			variant="ghost"
			onClick={toggleTheme}
			className="h-auto w-auto rounded-full border border-input bg-transparent px-3 py-1.5 font-mono text-xs text-muted-foreground hover:border-accent hover:bg-transparent hover:text-accent"
		>
			{getIcon()}
			<span aria-hidden="true">{getThemeLabel()}</span>
			<span className="sr-only">{getLabel()}</span>
		</Button>
	);
}
