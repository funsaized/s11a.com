import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/about/")({
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
	{ key: "keyboard", value: "Keychron K2 HE Wireless" },
	{ key: "this site", value: "TanStack Start + Tailwind, hosted on Netlify" },
];

function DefinitionList({ items }: { items: Definition[] }) {
	return (
		<dl>
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
					<div className="size-[140px] shrink-0 overflow-hidden rounded-full select-none">
						<img
							src="/images/me.jpg"
							alt="Sai Nimmagadda"
							className="pointer-events-none size-full object-cover"
						/>
					</div>
				</div>
				<h1 className="mt-7 mb-2.5 text-center text-[40px]">About me</h1>
				<p className="mx-auto max-w-[520px] text-center italic text-muted-foreground">
					Full-stack, platform, and AI-minded engineer building systems that
					scale from product UX to infrastructure
				</p>
				<div className="mt-10 mb-8 [border-top:var(--rule-dotted)]" />
				<div className="space-y-[22px]">
					<p>
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
						The throughline is leverage — products users value, and engineering
						systems that let teams move faster.
					</p>
				</div>
			</section>

			<section>
				<h2 className="mt-12 mb-2 text-[26px]">Core expertise</h2>
				<DefinitionList items={expertise} />
			</section>

			<section>
				<h2 className="mt-12 mb-2 text-[26px]">The desk</h2>
				<DefinitionList items={desk} />
			</section>

			<blockquote className="mt-13 border-y-2 border-dotted border-border px-5 py-6.5 text-center">
				<p className="font-display text-2xl leading-[1.45] text-accent-2">
					&ldquo;The best way to learn is through collaboration with
					others.&rdquo;
				</p>
				<footer className="mt-3 font-mono text-xs text-faint">
					sharing is caring — open source, knowledge, community
				</footer>
			</blockquote>

			<p className="mt-8 text-center font-mono text-[13px] text-faint">
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
				<Link to="/articles" className="no-underline">
					read my articles
				</Link>
			</p>
		</div>
	);
}
