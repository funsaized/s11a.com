import { createFileRoute } from "@tanstack/react-router";

import { ProjectList } from "#/components/Projects";
import { projects } from "#/lib/projects";
import { buildHead } from "#/lib/seo";

export const Route = createFileRoute("/projects/")({
	head: () =>
		buildHead({
			title: "Projects",
			path: "/projects/",
			description: "Open source, on the counter.",
		}),
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="mx-auto w-full max-w-page px-[clamp(18px,4vw,24px)] pt-[clamp(44px,7vw,72px)] pb-12">
			<h1 className="my-4 text-[clamp(34px,5vw,48px)] leading-[1.15]">
				Projects
			</h1>
			<p className="text-xl font-medium text-muted-foreground italic">
				open source, on the counter
			</p>
			<div className="mt-8">
				<ProjectList items={projects} />
			</div>
		</div>
	);
}
