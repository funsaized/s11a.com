// tanstack start server functions
import { createServerFn } from "@tanstack/react-start";

import { articleViewsInputSchema } from "./article-views";

export const getViews = createServerFn({ method: "GET" })
	.validator(articleViewsInputSchema)
	.handler(async ({ data }) => {
		console.log("get handler called!");
		console.log(data);
	});

export const incrementViews = createServerFn({ method: "POST" })
	.validator(articleViewsInputSchema)
	.handler(async ({ data }) => {
		// Atomic Redis increment
		console.log("increment handler called!");
		console.log(data);
	});
