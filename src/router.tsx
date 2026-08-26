import { createRouter as createTanStackRouter } from "@tanstack/react-router";

import { ErrorComponent } from "./components/ErrorComponent";
import { NotFoundComponent } from "./components/NotFoundComponent";
import { bindAnalytics } from "./lib/analytics";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
	const router = createTanStackRouter({
		routeTree,
		scrollRestoration: true,
		defaultPreload: "intent",
		defaultPreloadStaleTime: 0,

		defaultNotFoundComponent: () => <NotFoundComponent />,

		// Shown when an error bubbles to the router
		defaultErrorComponent: ({ error, reset }) => (
			<ErrorComponent error={error} reset={reset} />
		),
	});

	bindAnalytics(router);

	return router;
}

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}
