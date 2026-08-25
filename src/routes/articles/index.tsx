import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { getArticlesMetadata } from "#/lib/article-metadata";
export const Route = createFileRoute("/articles/")({
	loader: () => getArticlesMetadata(),
	component: RouteComponent,
});

function RouteComponent() {
	// WIP: keep article state around while the listing UI is migrated.
	const [_selectedArticles, _setSelectedArticles] = useState(
		getArticlesMetadata(),
	);

	const articles = Route.useLoaderData();

	return (
		<div className="mx-auto w-full max-w-page px-[clamp(18px,4vw,24px)] pt-[clamp(44px,7vw,72px)] pb-12">
			<div className="flex flex-col">
				<div className="font-mono">(mostly)</div>
			</div>
			<div className="flex flex-col">
				{articles.map((article) => {
					return (
						<div key={article.path} className="flex-1">
							{article.path}
						</div>
					);
				})}
			</div>
		</div>
	);
}
