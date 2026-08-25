import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";

import { ErrorComponent } from "./components/ErrorComponent";
import { NotFoundComponent } from "./components/NotFoundComponent";
import { getContext } from "./integrations/tanstack-query/root-provider";
import { bindAnalytics } from "./lib/analytics";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
	const context = getContext();

	const router = createTanStackRouter({
		routeTree,
		context,
		scrollRestoration: true,
		defaultPreload: "intent",
		defaultPreloadStaleTime: 0,

		defaultNotFoundComponent: () => <NotFoundComponent />,

		// Shown when an error bubbles to the router
		defaultErrorComponent: ({ error, reset }) => (
			<ErrorComponent error={error} reset={reset} />
		),
	});

	setupRouterSsrQueryIntegration({ router, queryClient: context.queryClient });
	bindAnalytics(router);

	return router;
}

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}
