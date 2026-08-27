import { Redis } from "@upstash/redis";

import { getArticleMetadataBySlug } from "./article-metadata";

let redis: Redis | undefined;

function getRedis() {
	const url = process.env.KV_REST_API_URL;
	const token = process.env.KV_REST_API_TOKEN;

	if (!url || !token) return undefined;

	return (redis ??= new Redis({ url, token }));
}

function articleViewKey(slug: string) {
	if (!getArticleMetadataBySlug(slug)) {
		throw new Error(`Unknown article slug: ${slug}`);
	}

	return `article-views:${slug}`;
}

export async function getArticleViews(slug: string) {
	const key = articleViewKey(slug);
	const client = getRedis();

	if (!client) return null;

	return (await client.get<number>(key)) ?? 0;
}

export async function incrementArticleViews(slug: string) {
	const key = articleViewKey(slug);
	const client = getRedis();

	if (!client) return null;

	return client.incr(key);
}
