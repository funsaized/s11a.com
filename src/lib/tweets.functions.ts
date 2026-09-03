import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";

import { getTweet } from "./tweets.server";

export const getLatestTweet = createServerFn({ method: "GET" }).handler(
	async () => {
		setResponseHeader("Cache-Control", "no-store");
		return { tweet: await getTweet() };
	},
);
