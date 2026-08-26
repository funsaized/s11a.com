import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	testDir: "./e2e",
	reporter: "line",
	use: {
		baseURL: "http://127.0.0.1:3001",
		trace: "retain-on-failure",
	},
	webServer: {
		command: "npm run dev",
		url: "http://127.0.0.1:3001",
		reuseExistingServer: !process.env.CI,
	},
	projects: [
		{
			name: "desktop",
			use: {
				...devices["Desktop Chrome"],
				viewport: { width: 1440, height: 900 },
			},
		},
		{
			name: "mobile",
			use: { ...devices["Pixel 7"] },
		},
	],
});
