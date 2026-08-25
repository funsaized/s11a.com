import { ScriptOnce } from "@tanstack/react-router";

const themeScript = `(function() {
  try {
    const theme = localStorage.getItem('theme') || 'auto';
    const resolved = theme === 'auto'
      ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme;
    document.documentElement.classList.add(resolved);
  } catch (e) {}
})();`;

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	return (
		<>
			{/* oxlint-disable-next-line react/no-children-prop */}
			<ScriptOnce children={themeScript} />
			{children}
		</>
	);
}
