import { Redis } from "@upstash/redis";

const KEY = "LATEST_TWEET";
const TTL_SECONDS = 30 * 60;
const API_URL =
	"https://api.x.com/2/users/386363438/tweets?max_results=5&exclude=retweets,replies&tweet.fields=created_at";

export type Tweet = {
	id: string;
	text: string;
	createdAt: string;
};

let redis: Redis | undefined;

function getRedis() {
	const url = process.env.KV_REST_API_URL;
	const token = process.env.KV_REST_API_TOKEN;

	if (!url || !token) return undefined;

	return (redis ??= new Redis({ url, token }));
}

export async function getTweet(): Promise<Tweet | null> {
	const client = getRedis();
	const cached = client ? await client.get<Tweet>(KEY) : null;
	if (cached?.text) return cached;

	const token = process.env.X_API_TOKEN ?? process.env.TWITTER_API_KEY;
	if (!token) return cached;

	try {
		const response = await fetch(API_URL, {
			headers: { Authorization: `Bearer ${token}` },
		});
		if (!response.ok) return cached;

		const json = (await response.json()) as {
			data?: { id: string; text: string; created_at: string }[];
		};
		const raw = json.data?.[0];
		if (!raw) return cached;

		const tweet = { id: raw.id, text: raw.text, createdAt: raw.created_at };
		if (client) await client.set(KEY, tweet, { ex: TTL_SECONDS });
		return tweet;
	} catch {
		return cached;
	}
}
