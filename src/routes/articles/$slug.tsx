import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { createElement, Suspense, useState } from "react";

import { Prose } from "#/components/Prose";
import { TableOfContents } from "#/components/TableOfContents";
import { Button } from "#/components/ui/button";
import { getArticleMetadataBySlug } from "#/lib/article-metadata";
import { getArticleComponentBySlug } from "#/lib/article-modules";
import { formatLongDate } from "#/lib/dates";
import { articleHead } from "#/lib/seo";
import { SITE_ORIGIN } from "#/lib/site";

const TwitterIcon = () => (
	<svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
		<path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
	</svg>
);

const LinkedInIcon = () => (
	<svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
		<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
	</svg>
);

const RedditIcon = () => (
	<svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
		<path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
	</svg>
);

const LinkIcon = () => (
	<svg
		className="h-4 w-4"
		fill="none"
		stroke="currentColor"
		viewBox="0 0 24 24"
	>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={2}
			d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
		/>
	</svg>
);

const CheckIcon = () => (
	<svg
		className="h-4 w-4"
		fill="none"
		stroke="currentColor"
		viewBox="0 0 24 24"
	>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={2}
			d="M5 13l4 4L19 7"
		/>
	</svg>
);

const ShareIcon = () => (
	<svg
		className="h-4 w-4"
		fill="none"
		stroke="currentColor"
		viewBox="0 0 24 24"
	>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={2}
			d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
		/>
	</svg>
);

export const Route = createFileRoute("/articles/$slug")({
	loader: ({ params }) => {
		const meta = getArticleMetadataBySlug(params.slug);
		if (!meta) throw notFound();
		return meta;
	},
	staleTime: Infinity,
	head: ({ loaderData }) => {
		if (!loaderData) return {};
		return articleHead(loaderData);
	},
	component: RouteComponent,
});

function RouteComponent() {
	const meta = Route.useLoaderData();
	const {
		frontmatter: { slug, title, category, tags, date, readingTime, excerpt },
		toc,
	} = meta;
	const [copied, setCopied] = useState(false);

	const Article = getArticleComponentBySlug(slug);
	if (!Article) {
		throw new Error(`Missing MDX module for published slug: ${slug}`);
	}

	const articleUrl = `${SITE_ORIGIN}/articles/${slug}/`;
	const encodedUrl = encodeURIComponent(articleUrl);
	const encodedTitle = encodeURIComponent(title);
	const shareLinks = {
		twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
		linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
		reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
	};

	async function copyLink() {
		try {
			await navigator.clipboard.writeText(articleUrl);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error("Failed to copy URL:", err);
		}
	}

	return (
		<div className="mx-auto w-full max-w-6xl px-[clamp(18px,4vw,24px)] pt-[clamp(40px,6vw,56px)] pb-12">
			<Button asChild variant="link" className="hover:no-underline font-mono">
				<Link to="/articles">← back to articles</Link>
			</Button>
			<div className="mt-7 grid grid-cols-1 gap-10 lg:grid-cols-[12rem_1fr_12rem]">
				<aside className="hidden lg:block">
					<div className="sticky top-20">
						<TableOfContents toc={toc} />
					</div>
				</aside>

				<article className="max-w-prose">
					<div className="font-mono text-faint text-xs font-medium lowercase">
						{category} {" · "}
						{formatLongDate(date)} {" · "}
						{readingTime}
					</div>
					<h1 className="text-[clamp(34px,5vw,48px)] leading-[1.15] my-4">
						{title}
					</h1>
					<p className="italic text-muted-foreground text-xl font-medium">
						{excerpt}
					</p>
					<div className="flex flex-wrap gap-2 mt-4">
						{tags.map((tag) => (
							<span
								key={tag}
								className="rounded-full border border-accent px-3 py-1 font-mono text-muted-foreground text-xs"
							>
								{tag}
							</span>
						))}
					</div>
					<div className="my-8 border-b-2 border-dotted border-border"></div>
					<Suspense fallback={<div></div>}>
						<Prose>{createElement(Article)}</Prose>
					</Suspense>
				</article>

				<aside className="lg:block">
					<div className="sticky top-20">
						<div className="flex flex-col gap-4">
							<div className="flex items-center gap-2 font-semibold text-sm text-muted-foreground uppercase">
								<ShareIcon />
								Share the article
							</div>
							<Button
								variant="outline"
								size="sm"
								className="w-full justify-start"
								asChild
							>
								<a
									href={shareLinks.twitter}
									target="_blank"
									rel="noopener noreferrer"
									className="font-mono"
								>
									<TwitterIcon />
									Share on Twitter
								</a>
							</Button>
							<Button
								variant="outline"
								size="sm"
								className="w-full justify-start"
								asChild
							>
								<a
									href={shareLinks.linkedin}
									target="_blank"
									rel="noopener noreferrer"
									className="font-mono"
								>
									<LinkedInIcon />
									Share on LinkedIn
								</a>
							</Button>
							<Button
								variant="outline"
								size="sm"
								className="w-full justify-start"
								asChild
							>
								<a
									href={shareLinks.reddit}
									target="_blank"
									rel="noopener noreferrer"
									className="font-mono"
								>
									<RedditIcon />
									Share on Reddit
								</a>
							</Button>
							<Button
								variant="outline"
								size="sm"
								className="w-full justify-start font-mono text-accent hover:text-foreground"
								onClick={copyLink}
							>
								{copied ? (
									<>
										<CheckIcon />
										Link Copied!
									</>
								) : (
									<>
										<LinkIcon />
										Copy Link
									</>
								)}
							</Button>
						</div>
					</div>
				</aside>
			</div>
		</div>
	);
}
