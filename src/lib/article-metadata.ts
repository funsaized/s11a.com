import { z } from "zod";

import type { TocItem } from "./rehype-mdx-toc";

const category = [
	"Backend",
	"Cloud",
	"DevOps",
	"Frontend",
	"Productivity",
	"Misc",
] as const;

export type ArticleCategory = (typeof category)[number];

export function getCategories() {
	return category;
}

const articleFrontmatterSchema = z.object({
	title: z.string(),
	slug: z.string(),
	excerpt: z.string(),
	date: z.iso.date(),
	category: z.enum(category),
	tags: z.array(z.string()),
	readingTime: z.string(),
	author: z.string(),
});

type ArticleFrontmatter = z.infer<typeof articleFrontmatterSchema>;

export interface ArticleMetadata {
	path: string;
	frontmatter: ArticleFrontmatter;
	toc: TocItem[];
}

const rawFrontmatterByPath = import.meta.glob<Record<string, unknown>>(
	"../content/articles/*.mdx",
	{
		eager: true,
		import: "frontmatter",
	},
);

const frontmatterByPath = Object.fromEntries(
	Object.entries(rawFrontmatterByPath).map(([path, frontmatter]) => {
		try {
			return [path, articleFrontmatterSchema.parse(frontmatter)];
		} catch (error) {
			if (error instanceof z.ZodError) {
				throw new Error(`Invalid frontmatter in ${path}: ${error.message}`, {
					cause: error,
				});
			}

			throw error;
		}
	}),
) as Record<string, ArticleFrontmatter>;

const seenSlugs = new Set<string>();

for (const [path, frontmatter] of Object.entries(frontmatterByPath)) {
	if (seenSlugs.has(frontmatter.slug)) {
		throw new Error(`😵 Duplicate slug ${frontmatter.slug} in ${path}`);
	}

	seenSlugs.add(frontmatter.slug);
}

const tocByPath = import.meta.glob<TocItem[]>("../content/articles/*.mdx", {
	eager: true,
	import: "toc",
});

export function getArticlesMetadata(): ArticleMetadata[] {
	const metadata: ArticleMetadata[] = Object.entries(frontmatterByPath).map(
		([path, frontmatter]) => {
			const toc = tocByPath[path];

			if (!toc) {
				throw new Error(`😵 Missing toc export for ${path}`);
			}

			return { path, frontmatter, toc };
		},
	);

	return metadata.toSorted((a, b) =>
		b.frontmatter.date.localeCompare(a.frontmatter.date),
	);
}

export function getArticleMetadataBySlug(
	slug: string,
): ArticleMetadata | undefined {
	return getArticlesMetadata().find((meta) => meta.frontmatter.slug === slug);
}

export function getAllTags() {
	return Object.values(frontmatterByPath).flatMap(
		(frontmatter) => frontmatter.tags ?? [],
	);
}
