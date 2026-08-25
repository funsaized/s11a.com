import mdx from "@mdx-js/rollup";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { rehypePrettyCode } from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import { defineConfig } from "vite";

import { rehypeMdxToc } from "#/lib/rehype-mdx-toc";

const config = defineConfig({
	server: {
		allowedHosts: ["blog.nzxt.dev.s11a.com"],
	},
	resolve: { tsconfigPaths: true },
	plugins: [
		devtools(),
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
		nitro(),
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
