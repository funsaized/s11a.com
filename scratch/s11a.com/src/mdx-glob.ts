import type Post from "./content/post.mdx";

interface MdxModule {
	default: typeof Post;
	frontmatter: Record<string, unknown>;
}

export const mdxModules = import.meta.glob<MdxModule>("./content/*.mdx", {
	eager: true,
});

export const mdxModuleShape = Object.fromEntries(
	Object.entries(mdxModules).map(([path, module]) => [
		path,
		Object.keys(module).sort(),
	]),
);

console.log("MDX glob object shape:", mdxModuleShape);
