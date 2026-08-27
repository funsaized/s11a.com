import { queryOptions } from "@tanstack/react-query";

import { getViews } from "./article-views.functions";

export function viewCountQueryOptions(slug: string) {
	return queryOptions({
		queryKey: ["article-views", slug],
		queryFn: async () => (await getViews({ data: { slug } })).count,
		staleTime: 60_000,
		retry: 1,
		refetchOnWindowFocus: false,
	});
}
