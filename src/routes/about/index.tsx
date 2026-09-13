import { createFileRoute, Link } from "@tanstack/react-router";

import { buildHead } from "#/lib/seo";

export const Route = createFileRoute("/about/")({
	head: () =>
		buildHead({
			title: "About",
			path: "/about/",
			description:
				"Full-stack, platform, and AI-minded engineer building systems that scale from product UX to infrastructure.",
		}),
	component: RouteComponent,
});

interface Definition {
	key: string;
	value: string;
}

const expertise: Definition[] = [
	{ key: "full-stack", value: "0→1 product delivery, product-led engineering" },
	{
		key: "forward deploy engineer",
		value: "Embedded at the edge of the problem, securely shipping ideas",
	},
	{
		key: "backend & platform",
		value: "API design, distributed systems, microservices",
	},
	{
		key: "datastores",
		value: "PostgreSQL, MySQL, Redis, Elasticsearch, Cosmos DB",
	},
	{
		key: "ai engineering",
		value: "LLM workflows, agents, RAG, evaluation loops",
	},
	{ key: "leadership", value: "Mentoring, technical strategy, systems design" },
];

const desk: Definition[] = [
	{ key: "editor", value: "Zed" },
	{ key: "terminal", value: "Ghostty" },
	{ key: "laptop", value: 'MacBook Air 13" M4, 24GB RAM' },
	{ key: "home server", value: "Mac Mini M1 (2020), 16GB RAM" },
	{
		key: "home server 2",
		value: "Omarchy, Ryzen 9 5900XT, RTX 3080 Ti, 32GB RAM",
	},
	{ key: "keyboard", value: "Keychron K2 HE Wireless" },
	{ key: "this site", value: "TanStack Start + Tailwind, hosted on Vercel" },
];

function DefinitionList({ items }: { items: Definition[] }) {
	return (
		<dl className="border-t border-dotted border-border">
			{items.map((item) => (
				<div
					key={item.key}
					className="grid grid-cols-[minmax(105px,170px)_1fr] gap-3.5 border-b border-dotted border-border px-0.5 py-3.25"
				>
					<dt className="self-baseline pt-1 font-mono text-[12.5px] tracking-[0.05em] text-accent">
						{item.key}
					</dt>
					<dd className="text-[17px] text-muted-foreground">{item.value}</dd>
				</div>
			))}
		</dl>
	);
}

function RouteComponent() {
	return (
		<div className="mx-auto w-full max-w-prose px-[clamp(18px,4vw,24px)] pt-[clamp(44px,7vw,72px)] pb-12">
			<section>
				<div className="flex justify-center">
					<div className="relative size-[188px] select-none">
						<div
							className="absolute -inset-2.5 rounded-full [border:var(--rule-dotted)]"
							aria-hidden
						/>
						<div className="size-full overflow-hidden rounded-full shadow-[0_12px_32px_var(--glow)]">
							<img
								src="/images/me.jpg"
								alt="Sai Nimmagadda"
								width={188}
								height={188}
								className="pointer-events-none size-full object-cover"
							/>
						</div>
					</div>
				</div>
				<div className="mt-7 text-center font-mono text-[13px] font-medium tracking-[0.14em] text-accent">
					{"// behind the pour"}
				</div>
				<h1 className="mt-3 mb-2.5 text-center text-[clamp(34px,5vw,48px)] leading-[1.15]">
					About me
				</h1>
				<p className="mx-auto max-w-[520px] text-center text-xl font-medium italic text-muted-foreground">
					Full-stack, platform, and AI-minded engineer building systems that
					scale from product UX to infrastructure
				</p>
				<div className="mt-10 mb-8 [border-top:var(--rule-dotted)]" />
				<div className="space-y-[22px]">
					<p className="text-[21px] leading-[1.55]">
						I&apos;m a full-stack software engineer with a BSE in Electrical and
						Computer Engineering and Biomedical Engineering from{" "}
						<strong>Duke University</strong>. My work spans product-facing web
						applications, backend services, cloud infrastructure, and data-heavy
						systems — with a particular interest in healthcare, developer
						experience, and AI-enabled workflows.
					</p>
					<p>
						I like problems at the intersection of architecture and execution:
						designing APIs, shaping platform capabilities, modernizing delivery
						workflows, and turning ambiguous ideas into shipped software.
					</p>
					<p>
						This site is my space for self-expression. It is a space to share
						what I've learned with the world. My digital garden 🌱. It will
						always be organically grown content, free from AI writing and
						sponsored posts.
					</p>
				</div>
			</section>

			<section>
				<h2 className="mt-12 mb-1 text-[26px]">Core expertise</h2>
				<p className="mb-4 font-mono text-[13px] text-faint">
					what I reach for
				</p>
				<DefinitionList items={expertise} />
			</section>

			<section>
				<h2 className="mt-12 mb-1 text-[26px]">The desk</h2>
				<p className="mb-4 font-mono text-[13px] text-faint">on the counter</p>
				<DefinitionList items={desk} />
			</section>

			<blockquote className="mt-13 border-y-2 border-dotted border-border px-5 py-6.5 text-center">
				<p className="font-display text-2xl leading-[1.45] text-accent-2">
					&ldquo;The best way to learn is through collaboration with
					others.&rdquo;
				</p>
				<footer className="mt-3 font-hand text-lg text-faint">
					sharing is caring — open source, knowledge, community
				</footer>
			</blockquote>

			<p className="mt-8 text-center font-mono text-[13px] text-faint">
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
				<Link to="/articles" className="no-underline">
					read my articles
				</Link>
			</p>
		</div>
	);
}
