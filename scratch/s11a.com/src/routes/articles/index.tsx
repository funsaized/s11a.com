import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";

import { getArticleComponentBySlug, getArticlesMetadata } from "#/lib/content";
export const Route = createFileRoute("/articles/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<section className="island-shell mt-8 rounded-2xl p-6">
			{getArticlesMetadata().map((meta) => {
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
