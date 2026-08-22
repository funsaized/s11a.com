import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";

import {
	frontmatterByPath,
	getArticleComponentBySlug,
	getArticlesMeta,
} from "#/lib/content";
export const Route = createFileRoute("/articles/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<section className="island-shell mt-8 rounded-2xl p-6">
			<details className="mt-6">
				<pre className="mt-3 overflow-x-auto rounded-xl bg-black/5 p-4 text-xs text-[var(--sea-ink-soft)]">
					<summary className="cursor-pointer font-semibold text-[var(--sea-ink)]">
						{JSON.stringify({ frontmatterByPath }, null, 2)}
					</summary>
				</pre>
			</details>
			{getArticlesMeta().map((meta) => {
				const slug = meta.frontmatter.slug;
				const Article = getArticleComponentBySlug(slug);
				if (!Article) {
					return null;
				}
				return (
					<Suspense key={slug} fallback={<div>Loading article…</div>}>
						<Article />
					</Suspense>
				);
			})}
		</section>
	);
}
