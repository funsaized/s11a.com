import { z } from "zod";

const articleFrontmatterSchema = z.object({
	title: z.string(),
	slug: z.string(),
	excerpt: z.string(),
	date: z.string(),
	category: z.string(),
	tags: z.array(z.string()),
	readingTime: z.string(),
	featured: z.boolean(),
	author: z.string(),
});

type ArticleFrontmatter = z.infer<typeof articleFrontmatterSchema>;

const frontmatterByPath = import.meta.glob<ArticleFrontmatter>(
	"../content/articles/*.mdx",
	{
		eager: true,
		import: "frontmatter",
	},
);

interface TocEntry {
	url: string;
	title: string;
	items?: TocEntry[];
}

type ArticleToc = TocEntry[];

const tocByPath = import.meta.glob<ArticleToc>("../content/articles/*.mdx", {
	eager: true,
	import: "toc",
});

interface ArticleModule {
	default: React.ComponentType;
	frontmatter: ArticleFrontmatter;
	toc: TocEntry[];
}

const articleModules = import.meta.glob<ArticleModule>(
	"../content/articles/*.mdx",
);

export function getArticles() {
	return Object.entries(frontmatterByPath).map(([path, frontmatter]) => ({
		path,
		frontmatter,
		toc: tocByPath[path],
	}));
}
