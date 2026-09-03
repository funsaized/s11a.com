import { queryOptions } from "@tanstack/react-query";

import { getLatestTweet } from "./tweets.functions";

export function getLatestTweetQueryOptions() {
	return queryOptions({
		queryKey: ["getLatestTweet"],
		queryFn: async () => (await getLatestTweet()).tweet,
		staleTime: 12 * 60 * 60 * 1000, // 12 hours
		retry: 1,
		refetchOnWindowFocus: false,
	});
}
