import { useQuery } from "@tanstack/react-query";
import { ClientOnly } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { getLatestTweetQueryOptions } from "#/lib/tweets.query";

const FALLBACK = {
	text: "shipping a little forest that grows every time claude does my chores 🌳",
	attribution: "-@FunSaized, 2h ago",
};

function timeAgo(iso: string) {
	const mins = Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 60_000));
	if (mins < 60) return `${mins}m ago`;
	const hours = Math.round(mins / 60);
	if (hours < 24) return `${hours}h ago`;
	return `${Math.round(hours / 24)}d ago`;
}

function NapkinFrame({ children }: { children: ReactNode }) {
	return (
		<>
			<img
				src="/images/stain-ring.png"
				alt=""
				className="stain pointer-events-none absolute inset-0 size-full -rotate-12 object-cover"
			/>
			<div className="absolute inset-[84px_32px_80px_58px] -rotate-2 font-hand text-2xl text-center flex flex-col items-center justify-center gap-2">
				{children}
			</div>
		</>
	);
}

function TweetSkeleton() {
	return (
		<NapkinFrame>
			<div className="h-4 w-24 animate-pulse rounded bg-faint/30" />
			<div className="h-6 w-full animate-pulse rounded bg-foreground/15" />
			<div className="h-6 w-4/5 animate-pulse rounded bg-foreground/15" />
			<div className="h-5 w-32 animate-pulse rounded bg-accent/30" />
		</NapkinFrame>
	);
}

function LatestTweetLoaded() {
	const { data: tweet, isPending } = useQuery(getLatestTweetQueryOptions());

	if (isPending) return <TweetSkeleton />;

	return (
		<NapkinFrame>
			<div className="text-base text-faint">latest tweet ~</div>
			<div>{tweet?.text ?? FALLBACK.text}</div>
			<div className="text-lg font-semibold text-accent">
				{tweet
					? `-@FunSaized, ${timeAgo(tweet.createdAt)}`
					: FALLBACK.attribution}
			</div>
		</NapkinFrame>
	);
}

export function LatestTweet() {
	return (
		<ClientOnly fallback={<TweetSkeleton />}>
			<LatestTweetLoaded />
		</ClientOnly>
	);
}
