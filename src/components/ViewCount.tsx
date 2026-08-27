import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { incrementViews } from "#/lib/article-views.functions";
import { viewCountQueryOptions } from "#/lib/article-views.query";

interface ViewCountProps {
	slug: string;
}

export function ViewCount({ slug }: ViewCountProps) {
	const queryClient = useQueryClient();
	const query = viewCountQueryOptions(slug);
	const storageKey = `article-viewed:${slug}`;

	// Count query
	const { data: count, isPending, isError } = useQuery(query);

	// Mutation
	const { mutate } = useMutation({
		mutationFn: () => incrementViews({ data: { slug } }),
		onSuccess: async ({ count: nextCount }) => {
			// null means redis unavail, should retry add
			if (nextCount === null) {
				sessionStorage.removeItem(storageKey);
				return;
			}

			await queryClient.cancelQueries({ queryKey: query.queryKey });
			queryClient.setQueryData(query.queryKey, nextCount);
		},
		onError: (error) => {
			sessionStorage.removeItem(storageKey);

			if (import.meta.env.DEV) {
				console.error("Failed to increment article views", error);
			}
		},
	});

	useEffect(() => {
		if (sessionStorage.getItem(storageKey)) return;

		sessionStorage.setItem(storageKey, "1");
		mutate();
	}, [mutate, storageKey]);

	if (isPending || isError || count === null) return null;

	return (
		<span className="font-mono text-faint text-xs">
			{count.toLocaleString()} {count === 1 ? "view" : "views"}
		</span>
	);
}
