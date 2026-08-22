import { createFileRoute } from "@tanstack/react-router";

import Post from "#/content/articles/building-a-batch-pipeline-01-crash-course-in-spring-batch.mdx";
import { frontmatterByPath } from "#/lib/content";
export const Route = createFileRoute("/articles/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<section className="island-shell mt-8 rounded-2xl p-6">
			<details className="mt-6">
				<summary className="cursor-pointer font-semibold text-[var(--sea-ink)]">
					Imported metadata
				</summary>
				<pre className="mt-3 overflow-x-auto rounded-xl bg-black/5 p-4 text-xs text-[var(--sea-ink-soft)]">
					{JSON.stringify({ frontmatterByPath }, null, 2)}
				</pre>
			</details>
			<Post />
		</section>
	);
}
