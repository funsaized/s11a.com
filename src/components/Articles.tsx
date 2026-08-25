import { Link } from "@tanstack/react-router";

import type { ArticleMetadata } from "#/lib/article-metadata";
import { formatShortDate } from "#/lib/dates";

interface ArticleListProps {
	articles: ArticleMetadata[];
}

export function Articles({ articles }: ArticleListProps) {
	return (
		<div className="w-full">
			<div className="grid grid-cols-[1fr_auto] items-baseline">
				<h2 className="text-[32px] leading-[1.28]">From the journal</h2>
				<Link to="/articles" className="font-mono text-[13px] no-underline">
					see all →
				</Link>
			</div>
			<p className="mt-2 font-mono text-[13px] text-faint">
				guides, references & tutorials — served daily
			</p>
			<div className="mt-6">
				{articles.map((article) => {
					const { slug, title, date } = article.frontmatter;

					return (
						<Link
							key={slug}
							to="/articles/$slug"
							params={{ slug }}
							className="flex flex-wrap items-baseline gap-x-3.5 gap-y-2 px-0.5 py-3.75 text-foreground no-underline row-link"
						>
							<span className="min-w-0 font-body text-[21px] font-medium text-inherit">
								{title}
							</span>
							<span className="min-w-10.5 flex-1 -translate-y-1.25 [border-bottom:var(--rule-dotted)]" />
							<time
								dateTime={date}
								className="whitespace-nowrap font-mono text-[13px] text-faint"
							>
								{formatShortDate(date)}
							</time>
						</Link>
					);
				})}
			</div>
		</div>
	);
}
