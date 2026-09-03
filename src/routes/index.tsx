import { createFileRoute } from "@tanstack/react-router";

import { Articles } from "#/components/Articles";
import { LatestTweet } from "#/components/LatestTweet";
import { Projects } from "#/components/Projects";
import { TextType } from "#/components/TextType";
import { getArticlesMetadata } from "#/lib/article-metadata";
import { buildHead } from "#/lib/seo";

export const Route = createFileRoute("/")({
	loader: () => getArticlesMetadata().slice(0, 6),
	staleTime: Infinity,
	head: () =>
		buildHead({
			path: "/",
			description:
				"A full-stack engineer writing about healthcare tech, AI, and whatever else is brewing.",
		}),
	component: Home,
});

function Home() {
	const articles = Route.useLoaderData();

	return (
		<div className="mx-auto w-full max-w-page px-[clamp(18px,4vw,24px)] pt-[clamp(40px,7vw,64px)]">
			<section className="flex flex-wrap items-start justify-center gap-10">
				<div className="min-w-70 flex-1">
					<div className="font-mono text-[13px] font-medium tracking-[0.14em] text-accent">
						{"// morning pour — thoughts on software & life"}
					</div>
					<h1 className="mt-4 max-w-prose text-[clamp(28px,4vw,40px)] leading-[1.28]">
						<TextType text="Hi, I'm Sai." />{" "}
						<span className="block">
							A full‑stack engineer writing about healthcare tech, AI, and
							whatever else is brewing.{" "}
						</span>
					</h1>
					<div className="mt-6 flex flex-wrap items-baseline gap-8 font-mono text-[13px]">
						{/*<Link
							to="/projects"
							activeProps={{ className: "text-accent" }}
							className="text-muted-foreground! [border-bottom:var(--rule-dotted)]"
						>
							view projects ↗
						</Link>*/}
						<div className="text-faint">
							<a
								href="https://github.com/funsaized"
								target="_blank"
								rel="noreferrer"
								className="text-faint no-underline hover:text-accent"
							>
								github
							</a>
							{" · "}
							<a
								href="https://www.linkedin.com/in/sainimmagadda/"
								target="_blank"
								rel="noreferrer"
								className="text-faint no-underline hover:text-accent"
							>
								linkedin
							</a>
							{" · "}
							<a
								href="https://x.com/funsaized"
								target="_blank"
								rel="noreferrer"
								className="text-faint no-underline hover:text-accent"
							>
								twitter
							</a>
							{" · "}
							<a
								href="https://www.threads.net/@funsaized"
								target="_blank"
								rel="noreferrer"
								className="text-faint no-underline hover:text-accent"
							>
								threads
							</a>
							{" · "}
							<a
								href="/rss.xml"
								className="text-faint no-underline hover:text-accent"
							>
								rss
							</a>
						</div>
					</div>
				</div>
				<div className="relative h-70.75 w-67.5 shrink-0 select-none">
					<LatestTweet />
				</div>
			</section>
			<section className="w-full pt-[clamp(36px,6vw,52px)] pb-10">
				<Articles articles={articles} />
			</section>
			<section className="w-full pb-10">
				<Projects />
			</section>
		</div>
	);
}
