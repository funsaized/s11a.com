declare module "*.mdx" {
	import type { ComponentType } from "react";

	const MDXComponent: ComponentType<Record<string, unknown>>;

	export default MDXComponent;
	export const frontmatter: Record<string, unknown>;
	export const toc: import("#/lib/rehype-mdx-toc").TocItem[];
}
