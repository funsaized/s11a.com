import { createFileRoute, useParams } from "@tanstack/react-router";

import { getArticleMetadataBySlug } from "#/lib/article-metadata";

export const Route = createFileRoute("/articles/$slug")({
	loader: ({ params }) => getArticleMetadataBySlug(params.slug),
	component: RouteComponent,
});

function RouteComponent() {
	const { slug } = useParams({ from: "/articles/$slug" });
	return (
		<div className="mx-auto w-full max-w-prose px-[clamp(18px,4vw,24px)] pt-[clamp(40px,6vw,56px)] pb-12">
			<div>Hello! from `${slug}`</div>
		</div>
	);
}
