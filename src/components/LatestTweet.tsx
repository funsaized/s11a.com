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

function napkinCopy(text: string) {
	return text.replace(/\s*https?:\/\/\S+/g, "").trim();
}

function NapkinFrame({ children }: { children: ReactNode }) {
	return (
		<>
			<img
				src="/images/stain-ring.png"
				alt=""
				className="stain pointer-events-none absolute inset-0 size-full -rotate-12 object-cover"
			/>
			<div className="absolute inset-[64px_44px_68px_48px] flex flex-col items-center justify-center gap-1 overflow-hidden -rotate-2 text-center font-hand">
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

	const text = napkinCopy(tweet?.text ?? FALLBACK.text);
	const long = text.length > 120;

	return (
		<NapkinFrame>
			<div className="shrink-0 text-base text-faint">latest tweet ~</div>
			<a
				href={
					tweet
						? `https://x.com/funsaized/status/${tweet.id}`
						: "https://x.com/funsaized"
				}
				target="_blank"
				rel="noreferrer"
				className="row-link min-h-0 w-full"
			>
				<span
					className={
						long
							? "line-clamp-4 wrap-break-words text-lg leading-tight"
							: "line-clamp-3 text-2xl leading-snug"
					}
				>
					{text}
				</span>
				<div className="mt-0.5 shrink-0 text-lg font-semibold">
					{tweet
						? `-@FunSaized, ${timeAgo(tweet.createdAt)}`
						: FALLBACK.attribution}
				</div>
			</a>
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
