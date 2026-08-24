import mdx from "@mdx-js/rollup";
import netlify from "@netlify/vite-plugin-tanstack-start";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { rehypePrettyCode } from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import { defineConfig } from "vite";

import { rehypeMdxToc } from "#/lib/rehype-mdx-toc";

const config = defineConfig({
	server: {
		allowedHosts: ["blog-new.dev.s11a.com", "blog-new.omarchy.dev.s11a.com"],
	},
	resolve: { tsconfigPaths: true },
	plugins: [
		devtools(),
		netlify(),
		tailwindcss(),
		tanstackStart({
			prerender: {
				enabled: true,
				crawlLinks: true,
				onSuccess: ({ page }) => {
					console.log(`🫪 Wow dude! Rendered ${page.path}`);
				},
			},
		}),
		mdx({
			remarkPlugins: [
				remarkFrontmatter,
				[remarkMdxFrontmatter, { name: "frontmatter" }],
				remarkGfm,
			],
			rehypePlugins: [
				[
					rehypePrettyCode,
					{
						theme: { light: "kanagawa-lotus", dark: "kanagawa-dragon" },
						keepBackground: false,
						defaultLang: "plaintext",
					},
				],
				rehypeSlug,
				rehypeMdxToc,
			],
		}),
		viteReact(),
	],
});

export default config;
