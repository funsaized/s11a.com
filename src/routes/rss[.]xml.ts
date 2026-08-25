import { createFileRoute } from "@tanstack/react-router";

import { getArticlesMetadata } from "#/lib/article-metadata";
import { SITE_DESCRIPTION, SITE_NAME } from "#/lib/seo";
import { SITE_ORIGIN } from "#/lib/site";

function escapeXml(value: string) {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&apos;");
}

function rfc822(isoDate: string) {
	return new Date(`${isoDate}T00:00:00.000Z`).toUTCString();
}

// Simple RSS creation function
function buildRss() {
	const articles = getArticlesMetadata();
	const items = articles
		.map(({ frontmatter: { title, slug, excerpt, date, category } }) => {
			const url = `${SITE_ORIGIN}/articles/${slug}/`;

			return `    <item>
      <title>${escapeXml(title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${rfc822(date)}</pubDate>
      <author>saiguy@icloud.com (${escapeXml(SITE_NAME)})</author>
      <category>${escapeXml(category)}</category>
      <description>${escapeXml(excerpt)}</description>
    </item>`;
		})
		.join("\n");

	return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${SITE_ORIGIN}/</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en-us</language>
${items}
  </channel>
</rss>
`;
}

export const Route = createFileRoute("/rss.xml")({
	// @ts-ignore Start 1.168 types omit `server` on some installs; handlers still run
	server: {
		handlers: {
			GET: () =>
				new Response(buildRss(), {
					headers: {
						"Content-Type": "application/rss+xml; charset=utf-8",
					},
				}),
		},
	},
});
