import { z } from "zod";

const category = [
	"Backend",
	"Cloud",
	"DevOps",
	"Frontend",
	"Productivity",
	"Misc",
] as const;

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
	date: z.string(),
	category: z.enum(category),
	tags: z.array(z.string()),
	readingTime: z.string(),
	featured: z.boolean(),
	author: z.string(),
	toc: z.array(tocEntrySchema),
});

type ArticleFrontmatter = z.infer<typeof articleFrontmatterSchema>;

const rawFrontmatterByPath = import.meta.glob<Record<string, unknown>>(
	"../content/articles/*.mdx",
	{
		eager: true,
		import: "frontmatter",
	},
);

export const frontmatterByPath = Object.fromEntries(
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

export function getArticlesMeta() {
	return Object.entries(frontmatterByPath).map(([path, frontmatter]) => ({
		path,
		frontmatter,
		toc: frontmatter.toc,
	}));
}
