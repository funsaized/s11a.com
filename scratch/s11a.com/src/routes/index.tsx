import { createFileRoute, Link } from "@tanstack/react-router";

import { Articles } from "#/components/Articles";
import { Projects } from "#/components/Projects";
import { TextType } from "#/components/TextType";
import { getArticlesMetadata } from "#/lib/article-metadata";
export const Route = createFileRoute("/")({
	loader: () => getArticlesMetadata().slice(0, 6),
	staleTime: Infinity,
	component: Home,
});

function Home() {
	const articles = Route.useLoaderData();

	return (
		<div className="mx-auto w-full max-w-page  pt-[clamp(40px,7vw,64px)]">
			<section className="flex flex-wrap items-start justify-center gap-10">
				<div className="min-w-70 flex-1">
					<div className="font-mono text-[13px] font-medium tracking-[0.14em] text-accent">
						{"// morning pour — thoughts on software & life"}
					</div>
					<h1 className="mt-4 max-w-prose text-[clamp(28px,4vw,40px)] leading-[1.28]">
						<TextType text="Hi, I'm Sai — a full‑stack engineer writing about healthcare tech, AI, and whatever else is brewing." />
					</h1>
					<div className="mt-6 flex flex-wrap items-baseline gap-8 font-mono text-[13px]">
						<Link
							to="/projects"
							activeProps={{ className: "text-accent" }}
							className="text-muted-foreground! [border-bottom:var(--rule-dotted)]"
						>
							view projects ↗
						</Link>
						<div className="text-faint">
							<a
								href="https://github.com/funsaized"
								target="_blank"
								rel="noreferrer"
								className="text-faint no-underline"
							>
								github
							</a>
							{" · "}
							<a
								href="https://www.linkedin.com/in/sainimmagadda/"
								target="_blank"
								rel="noreferrer"
								className="text-faint no-underline"
							>
								linkedin
							</a>
							{" · "}
							<span title="RSS feed coming soon">rss</span>
						</div>
					</div>
				</div>
				<div className="relative h-70.75 w-67.5 shrink-0 select-none">
					<img
						src="/images/stain-ring.png"
						alt=""
						className="stain pointer-events-none absolute inset-0 size-full -rotate-12 object-cover"
					/>
					<div className="absolute inset-[84px_32px_80px_58px] -rotate-2 font-hand text-2xl text-center flex flex-col items-center justify-center">
						<div className="text-base text-faint">latest tweet ~</div>
						<div>
							shipping a little forest that grows every time claude does my
							chores 🌳
						</div>
						<div className="text-lg font-semibold text-accent">
							-@funaized, 2h ago
						</div>
					</div>
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
