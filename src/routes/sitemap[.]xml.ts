import { createFileRoute } from "@tanstack/react-router";

import { getArticlesMetadata } from "#/lib/article-metadata";
import { canonicalUrl } from "#/lib/seo";

function url(path: string, lastmod: string) {
	return `  <url>
    <loc>${canonicalUrl(path)}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`;
}

function buildSitemap() {
	const articles = getArticlesMetadata();
	const newest = articles[0]?.frontmatter.date ?? "2026-01-01";

	const pages = [
		url("/", newest),
		url("/articles/", newest),
		url("/about/", newest),
		url("/projects/", newest),
		...articles.map(({ frontmatter: { slug, date } }) =>
			url(`/articles/${slug}/`, date),
		),
	];

	return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.join("\n")}
</urlset>
`;
}

export const Route = createFileRoute("/sitemap.xml")({
	// @ts-ignore Start 1.168 types omit `server` on some installs; handlers still run
	server: {
		handlers: {
			GET: () =>
				new Response(buildSitemap(), {
					headers: {
						"Content-Type": "application/xml; charset=utf-8",
					},
				}),
		},
	},
});
