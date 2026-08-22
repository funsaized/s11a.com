import { z } from "zod";

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

interface TocEntry {
	title: string;
	items?: TocEntry[];
}

const tocEntrySchema: z.ZodType<TocEntry> = z.lazy(() =>
	z.object({
		title: z.string(),
		items: z.array(tocEntrySchema).optional(),
	}),
);

const articleFrontmatterSchema = z.object({
	title: z.string(),
	slug: z.string(),
	excerpt: z.string(),
	date: z.iso.date(),
	category: z.enum(category),
	tags: z.array(z.string()),
	readingTime: z.string(),
	featured: z.boolean(),
	author: z.string(),
	toc: z.array(tocEntrySchema),
});

type ArticleFrontmatter = z.infer<typeof articleFrontmatterSchema>;

export interface ArticleMetadata {
	path: string;
	frontmatter: ArticleFrontmatter;
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

export function getArticlesMetadata(): ArticleMetadata[] {
	const metadata: ArticleMetadata[] = Object.entries(frontmatterByPath).map(
		([path, frontmatter]) => ({
			path,
			frontmatter,
		}),
	);

	return metadata.toSorted((a, b) =>
		b.frontmatter.date.localeCompare(a.frontmatter.date),
	);
}

export function getArticleMetadataBySlug(slug: string): ArticleMetadata {
	const metadata = getArticlesMetadata().find(
		(meta) => meta.frontmatter.slug === slug,
	);

	if (!metadata) {
		throw new Error(`No article found for slug: ${slug}`);
	}

	return metadata;
}

export function getAllTags() {
	return Object.values(frontmatterByPath).flatMap(
		(frontmatter) => frontmatter.tags ?? [],
	);
}
