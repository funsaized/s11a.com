import { lazy, type ComponentType, type LazyExoticComponent } from "react";

import { getArticlesMetadata } from "#/lib/article-metadata";

interface ArticleModule {
	default: ComponentType<Record<string, unknown>>;
	frontmatter: Record<string, unknown>;
}

const articleModulesByPath = import.meta.glob<ArticleModule>(
	"../content/articles/*.mdx",
);

type ArticleModuleLoader = () => Promise<ArticleModule>;

type LazyArticleComponent = LazyExoticComponent<ArticleModule["default"]>;

const articleModuleLoadersBySlug = new Map<string, ArticleModuleLoader>();

for (const { path, frontmatter } of getArticlesMetadata()) {
	const loadModuleFunc = articleModulesByPath[path];

	if (!loadModuleFunc) {
		throw new Error(`😵 Missing MDX module for ${path}`);
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
