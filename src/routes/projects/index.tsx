import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/projects/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="mx-auto w-full max-w-page px-[clamp(18px,4vw,24px)] pt-[clamp(44px,7vw,72px)] pb-12">
			Hello "/projects/"!
		</div>
	);
}
