import { createFileRoute, Link } from "@tanstack/react-router";
import { Suspense } from "react";

import { TableOfContents } from "#/components/TableOfContents";
import { Button } from "#/components/ui/button";
import { getArticleMetadataBySlug } from "#/lib/article-metadata";
import { getArticleComponentBySlug } from "#/lib/article-modules";
import { formatLongDate } from "#/lib/dates";

export const Route = createFileRoute("/articles/$slug")({
	loader: ({ params }) => getArticleMetadataBySlug(params.slug),
	component: RouteComponent,
});

function RouteComponent() {
	const meta = Route.useLoaderData();
	const {
		frontmatter: { slug, title, category, date, readingTime, excerpt },
		toc,
	} = meta;

	const Article = getArticleComponentBySlug(slug);
	if (!Article) throw new Error("Article not found");

	return (
		<div className="mx-auto w-full max-w-6xl px-[clamp(18px,4vw,24px)] pt-[clamp(40px,6vw,56px)] pb-12">
			<Button asChild variant="link" className="hover:no-underline font-mono">
				<Link to="/articles">← back to articles</Link>
			</Button>
			<div className="mt-7 grid grid-cols-1 gap-10 lg:grid-cols-[12rem_1fr]">
				<aside className="hidden lg:block">
					<div className="sticky top-20">
						<TableOfContents toc={toc} />
					</div>
				</aside>

				<div className="max-w-prose">
					<div className="font-mono text-faint text-xs font-medium lowercase">
						{category} {" · "}
						{formatLongDate(date)} {" · "}
						{readingTime}
					</div>
					<h1 className="text-[clamp(34px,5vw,48px)] leading-[1.15] my-4">
						{title}
					</h1>
					<p className="italic text-muted-foreground text-xl font-medium">
						{excerpt}
					</p>
					<div className="my-10 border-b-2 border-dotted border-border"></div>
					<Suspense fallback={<div></div>}>
						<Article />
					</Suspense>
				</div>
			</div>
		</div>
	);
}
