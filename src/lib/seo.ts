import type { ArticleMetadata } from "./article-metadata";
import { SITE_ORIGIN } from "./site";

export const SITE_NAME = "Sai Nimmagadda";
export const SITE_TITLE = "Sai Nimmagadda - Full-Stack Engineer";
export const SITE_DESCRIPTION = "Full-stack engineer. full-time nerd";

const DEFAULT_IMAGE_PATH = "/images/articles/share.jpg";
const TWITTER_USERNAME = "@FunSaized";
const SAME_AS = [
	"https://github.com/funsaized",
	"https://www.linkedin.com/in/sainimmagadda",
	"https://twitter.com/FunSaized",
];

interface ArticleSeo {
	datePublished: string;
	dateModified?: string;
	category: string;
	tags: string[];
}

interface BuildHeadInput {
	title?: string;
	description?: string;
	path: string;
	image?: string;
	article?: ArticleSeo;
}

export function canonicalUrl(path: string) {
	const withSlash = path.endsWith("/") ? path : `${path}/`;
	return new URL(withSlash, SITE_ORIGIN).toString();
}

function absoluteUrl(pathOrUrl: string) {
	if (pathOrUrl.startsWith("http")) {
		return pathOrUrl;
	}

	return new URL(pathOrUrl, SITE_ORIGIN).toString();
}

export function buildHead({
	title,
	description = SITE_DESCRIPTION,
	path,
	image = DEFAULT_IMAGE_PATH,
	article,
}: BuildHeadInput) {
	const url = canonicalUrl(path);
	const pageTitle = title ? `${title} | ${SITE_TITLE}` : SITE_TITLE;
	const imageUrl = absoluteUrl(image);
	const dateModified = article
		? (article.dateModified ?? article.datePublished)
		: undefined;

	const meta: Array<Record<string, unknown>> = [
		{ title: pageTitle },
		{ name: "description", content: description },
		{ name: "author", content: SITE_NAME },
		{ property: "og:title", content: pageTitle },
		{ property: "og:description", content: description },
		{ property: "og:image", content: imageUrl },
		{ property: "og:url", content: url },
		{ property: "og:type", content: article ? "article" : "website" },
		{ property: "og:site_name", content: SITE_NAME },
		{ name: "twitter:card", content: "summary_large_image" },
		{ name: "twitter:creator", content: TWITTER_USERNAME },
		{ name: "twitter:title", content: pageTitle },
		{ name: "twitter:description", content: description },
		{ name: "twitter:image", content: imageUrl },
		{
			"script:ld+json": {
				"@context": "https://schema.org",
				"@type": article ? "BlogPosting" : "WebPage",
				headline: pageTitle,
				description,
				image: imageUrl,
				url,
				author: {
					"@type": "Person",
					name: SITE_NAME,
					url: SITE_ORIGIN,
					sameAs: SAME_AS,
				},
				publisher: {
					"@type": "Person",
					name: SITE_NAME,
					url: SITE_ORIGIN,
				},
				...(article && {
					datePublished: article.datePublished,
					dateModified,
					keywords: article.tags.join(", "),
					articleSection: article.category,
					mainEntityOfPage: {
						"@type": "WebPage",
						"@id": url,
					},
				}),
			},
		},
	];

	if (article) {
		meta.push(
			{
				property: "article:published_time",
				content: article.datePublished,
			},
			{
				property: "article:modified_time",
				content: dateModified,
			},
		);
	}

	return {
		meta,
		links: [
			{ rel: "canonical", href: url },
			{
				rel: "alternate",
				type: "application/rss+xml",
				title: SITE_NAME,
				href: `${SITE_ORIGIN}/rss.xml`,
			},
		],
	};
}

export function articleHead({ frontmatter }: ArticleMetadata) {
	return buildHead({
		title: frontmatter.title,
		description: frontmatter.excerpt,
		path: `/articles/${frontmatter.slug}/`,
		article: {
			datePublished: frontmatter.date,
			category: frontmatter.category,
			tags: frontmatter.tags,
		},
	});
}
