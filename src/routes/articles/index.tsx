import {
	createFileRoute,
	Link,
	stripSearchParams,
} from "@tanstack/react-router";
import { z } from "zod";

import {
	getArticlesMetadata,
	getCategories,
	type ArticleCategory,
	type ArticleMetadata,
} from "#/lib/article-metadata";
import { formatShortDate } from "#/lib/dates";
import { buildHead } from "#/lib/seo";
import { cn } from "#/lib/utils";

const articleSearchSchema = z.object({
	q: z.string().default("").catch(""),
	category: z.enum(getCategories()).optional().catch(undefined),
});

export const Route = createFileRoute("/articles/")({
	validateSearch: articleSearchSchema,
	search: {
		middlewares: [stripSearchParams({ q: "" })],
	},
	loader: () => getArticlesMetadata(),
	staleTime: Infinity,
	head: () => buildHead({ title: "Articles", path: "/articles/" }),
	component: RouteComponent,
});

// ponytail: token AND + punctuation strip. Fuse if typo-tolerance matters.
function normalize(value: string) {
	return value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, " ")
		.trim();
}

function queryTokens(needle: string) {
	return normalize(needle).split(" ").filter(Boolean);
}

function Highlight({ text, tokens }: { text: string; tokens: string[] }) {
	if (tokens.length === 0) return text;

	// Vibe coded splitter, escape matches group
	const pattern = tokens
		.toSorted((a, b) => b.length - a.length)
		.map((token) => token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
		.join("|");
	const parts = text.split(new RegExp(`(${pattern})`, "gi"));
	const seen = new Map<string, number>();

	return parts.map((part) => {
		const n = (seen.get(part) ?? 0) + 1;
		seen.set(part, n);
		const key = `${part}-${n}`;
		const hit = tokens.some((token) => part.toLowerCase().includes(token));
		if (!hit) return <span key={key}>{part}</span>;

		return (
			<mark key={key} className="rounded-sm bg-accent/20 text-inherit">
				{part}
			</mark>
		);
	});
}

function matchesQuery(
	{ title, excerpt, category, tags, slug }: ArticleMetadata["frontmatter"],
	needle: string,
) {
	const tokens = queryTokens(needle);
	if (tokens.length === 0) return true;

	const haystack = normalize(
		[title, excerpt, category, slug, ...tags].join(" "),
	);
	return tokens.every((token) => haystack.includes(token));
}

function chipClass(active: boolean) {
	return cn(
		"rounded-full border px-3.5 py-1.5 font-mono text-xs",
		active
			? "border-accent bg-accent text-background"
			: "border-border bg-transparent text-muted-foreground",
	);
}

function RouteComponent() {
	const articles = Route.useLoaderData();
	const navigate = Route.useNavigate();
	const { q, category: selectedCategory } = Route.useSearch();
	const tokens = queryTokens(q);

	const visible = articles.filter(({ frontmatter }) => {
		if (selectedCategory && frontmatter.category !== selectedCategory) {
			return false;
		}

		return matchesQuery(frontmatter, q);
	});

	function setQuery(next: string) {
		void navigate({
			search: (prev) => ({ ...prev, q: next }),
			replace: true,
		});
	}

	function setCategory(next: ArticleCategory | undefined) {
		void navigate({
			search: (prev) => ({ ...prev, category: next }),
		});
	}

	return (
		<div className="mx-auto w-full max-w-page px-[clamp(18px,4vw,24px)] pt-[clamp(44px,7vw,72px)] pb-12">
			<div className="font-mono text-accent text-[13px]">(mostly)</div>
			<h1 className="text-[clamp(34px,5vw,48px)] leading-[1.15] my-4">
				Technical Articles
			</h1>
			<p className="italic text-muted-foreground text-xl font-medium">
				Deep dives into healthcare, technology, scalable systems, modern dev
				practices, and misc
			</p>
			<input
				type="search"
				value={q}
				onChange={(event) => setQuery(event.target.value)}
				placeholder="search the shelf — title, tag, topic, or anything rly…"
				aria-label="search the shelf"
				className="mt-8 w-full rounded-input border border-border bg-card px-4 py-3.25 font-mono text-sm text-foreground focus:outline-none"
			/>
			<fieldset className="mt-4 flex flex-wrap gap-2 border-0 p-0">
				<legend className="sr-only">category</legend>
				<button
					type="button"
					aria-pressed={!selectedCategory}
					onClick={() => setCategory(undefined)}
					className={chipClass(!selectedCategory)}
				>
					all
				</button>
				{getCategories().map((category) => (
					<button
						key={category}
						type="button"
						aria-pressed={selectedCategory === category}
						onClick={() => setCategory(category)}
						className={chipClass(selectedCategory === category)}
					>
						{category.toLowerCase()}
					</button>
				))}
			</fieldset>
			<div className="mt-6.5 font-mono text-xs text-faint">
				showing {visible.length} of {articles.length} articles
			</div>
			{visible.length === 0 ? (
				<div className="py-12 text-center font-mono text-sm text-faint">
					nothing on the shelf — try another blend.
				</div>
			) : null}
			<div>
				{visible.map((article) => {
					const { slug, title, date, excerpt, category, tags, readingTime } =
						article.frontmatter;

					return (
						<Link
							key={slug}
							to="/articles/$slug"
							params={{ slug }}
							className="row-link block border-b border-border px-0.5 py-5.5 no-underline"
						>
							<span className="flex flex-wrap items-baseline gap-x-3.5 gap-y-2">
								<span className="min-w-0 font-body text-[22px] font-medium text-inherit">
									<Highlight text={title} tokens={tokens} />
								</span>
								<span className="min-w-10.5 flex-1 -translate-y-1.25 [border-bottom:var(--rule-dotted)]" />
								<time
									dateTime={date}
									className="whitespace-nowrap font-mono text-[13px] text-faint"
								>
									{formatShortDate(date)}
								</time>
							</span>
							<span className="mt-1.5 block font-body text-[16.5px] text-muted-foreground">
								<Highlight text={excerpt} tokens={tokens} />
							</span>
							<span className="mt-2 block font-mono text-xs text-faint">
								{readingTime} · <Highlight text={category} tokens={tokens} /> ·{" "}
								<Highlight text={tags.join(", ")} tokens={tokens} />
							</span>
						</Link>
					);
				})}
			</div>
		</div>
	);
}
