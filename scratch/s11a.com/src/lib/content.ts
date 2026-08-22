import { lazy, type ComponentType, type LazyExoticComponent } from "react";
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

export interface ArticleMetadata {
	path: string;
	frontmatter: ArticleFrontmatter;
}

interface ArticleModule {
	default: ComponentType<Record<string, unknown>>;
	frontmatter: Record<string, unknown>;
}

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

export function getArticlesMeta(): ArticleMetadata[] {
	return Object.entries(frontmatterByPath).map(([path, frontmatter]) => ({
		path,
		frontmatter,
	}));
}

const articleModulesByPath = import.meta.glob<ArticleModule>(
	"../content/articles/*.mdx",
);

// Define lazy article loading
type ArticleModuleLoader = () => Promise<ArticleModule>;

type LazyArticleComponent = LazyExoticComponent<ArticleModule["default"]>;

// loaders by slug to be called by eager load client
const articleModuleLoadersBySlug = new Map<string, ArticleModuleLoader>();

for (const { path, frontmatter } of getArticlesMeta()) {
	const loadModuleFunc = articleModulesByPath[path];

	if (!loadModuleFunc) {
		throw new Error(`😵 Missing MDX module for ${path}`);
	}

	if (articleModuleLoadersBySlug.has(frontmatter.slug)) {
		throw new Error(`😵 Duplicate slug ${frontmatter.slug}`);
	}

	articleModuleLoadersBySlug.set(frontmatter.slug, loadModuleFunc);
}

const lazyComponentsBySlug = new Map<string, LazyArticleComponent>();

export function getArticleComponentBySlug(
	slug: string,
): LazyArticleComponent | undefined {
	const cachedComponent = lazyComponentsBySlug.get(slug);

	if (cachedComponent) {
		return cachedComponent;
	}

	const loadModule = articleModuleLoadersBySlug.get(slug);

	if (!loadModule) {
		return undefined;
	}

	const component = lazy(loadModule);

	lazyComponentsBySlug.set(slug, component);

	return component;
}
