import { valueToEstree } from "estree-util-value-to-estree";
import type { Element, Root } from "hast";
import { toString } from "hast-util-to-string";
import type { Plugin } from "unified";
import { define } from "unist-util-mdx-define";
import { visit } from "unist-util-visit";

export interface TocItem {
	url: string;
	title: string;
	items?: TocItem[];
}

const MAX_HEADING_DEPTH = 3;

function headingDepth(tagName: string): number | undefined {
	if (!/^h[1-6]$/.test(tagName)) {
		return undefined;
	}

	return Number(tagName[1]);
}

function headingId(node: Element): string | undefined {
	const id = node.properties.id;

	if (typeof id !== "string" || id.length === 0) {
		return undefined;
	}

	return id;
}

export const rehypeMdxToc: Plugin<[], Root> = () => {
	return (tree, file) => {
		const toc: TocItem[] = [];
		const stack: { depth: number; item: TocItem }[] = [];

		visit(tree, "element", (node) => {
			const depth = headingDepth(node.tagName);

			if (depth === undefined || depth > MAX_HEADING_DEPTH) {
				return;
			}

			const id = headingId(node);

			if (!id) {
				return;
			}

			const title = toString(node).trim();

			if (!title) {
				return;
			}

			const item: TocItem = { url: `#${id}`, title };

			let parent = stack.at(-1);

			while (parent && parent.depth >= depth) {
				stack.pop();
				parent = stack.at(-1);
			}

			if (parent) {
				parent.item.items ??= [];
				parent.item.items.push(item);
			} else {
				toc.push(item);
			}

			stack.push({ depth, item });
		});

		define(tree, file, { toc: valueToEstree(toc) });
	};
};
