import { expect, test } from "@playwright/test";

test("required routes render without browser failures", async ({ page }) => {
	const problems: string[] = [];
	const record = (message: string) => problems.push(message);

	page.on("console", (message) => {
		if (message.type() === "error") record(`console: ${message.text()}`);
	});
	page.on("pageerror", (error) => record(`page: ${error.message}`));
	page.on("requestfailed", (request) =>
		record(`request: ${request.method()} ${request.url()}`),
	);
	page.on("response", (response) => {
		if (response.status() >= 400) {
			record(`response: ${response.status()} ${response.url()}`);
		}
	});

	async function visit(path: string) {
		const response = await page.goto(path);
		expect(response?.ok(), `${path} returned ${response?.status()}`).toBe(true);
		await expect(page.locator("h1")).toBeVisible();
		expect(
			await page.evaluate(
				() =>
					document.documentElement.scrollWidth -
					document.documentElement.clientWidth,
			),
			`${path} overflows horizontally`,
		).toBeLessThanOrEqual(1);
	}

	await visit("/");
	await visit("/articles");
	await visit("/about");

	await page.goto("/articles");
	const newestArticle = page.locator('a[href^="/articles/"]').first();
	await expect(newestArticle).toBeVisible();
	await newestArticle.click();
	await expect(page).toHaveURL(/\/articles\/[^/]+\/?$/);
	await expect(page.locator("h1")).toBeVisible();
	expect(
		await page.evaluate(
			() =>
				document.documentElement.scrollWidth -
				document.documentElement.clientWidth,
		),
		"newest article overflows horizontally",
	).toBeLessThanOrEqual(1);
	expect(problems, problems.join("\n")).toEqual([]);
});
