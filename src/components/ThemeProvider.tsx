import { ScriptOnce } from "@tanstack/react-router";

const themeScript = `(function() {
  try {
    const stored = localStorage.getItem('theme');
    const resolved = stored === 'light' || stored === 'dark'
      ? stored
      : (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.classList.remove('light', 'dark', 'system', 'auto');
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
