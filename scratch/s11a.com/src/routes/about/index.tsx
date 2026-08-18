import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about/")({
	loader: () => {
		throw new Error("Intentional default error test");
	},
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/about/"!</div>;
}
