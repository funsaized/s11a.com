// tanstack start server functions
import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";

import { articleViewsInputSchema } from "./article-views";
import { getArticleViews, incrementArticleViews } from "./article-views.server";

export const getViews = createServerFn({ method: "GET" })
	.validator(articleViewsInputSchema)
	.handler(async ({ data }) => {
		setResponseHeader("Cache-Control", "no-store");
		return { count: await getArticleViews(data.slug) };
	});

export const incrementViews = createServerFn({ method: "POST" })
	.validator(articleViewsInputSchema)
	.handler(async ({ data }) => {
		setResponseHeader("Cache-Control", "no-store");
		return { count: await incrementArticleViews(data.slug) };
	});
