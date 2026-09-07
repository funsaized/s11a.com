import { Link } from "@tanstack/react-router";

import { projects, type Project } from "#/lib/projects";

function Project({
	icon,
	title,
	path,
	source,
	description,
	status,
	stars,
}: Project) {
	const sourceHref = source || undefined;

	return (
		<div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-3 border-b border-border">
			<a
				className="row-link col-start-1 row-span-2 no-underline"
				href={path}
				target="_blank"
				rel="noopener noreferrer"
				aria-label={title}
			>
				<div className="flex items-baseline gap-x-3.5">
					<span>{icon}</span>
					<div className="flex items-center justify-between gap-4">
						<h3 className="w-fit">{title}</h3>
						<span className="font-mono text-[10px] text-muted-foreground uppercase">
							{status}
						</span>
					</div>
					<span className="min-w-10.5 flex-1 -translate-y-1.25 [border-bottom:var(--rule-dotted)]" />
					<span className="text-[10px] text-faint">
						{"★ "}
						{stars || 0}
					</span>
				</div>
				<div className="flex items-baseline gap-x-3.5 gap-y-2 px-0.5 py-3.75">
					<p className="text-base">{description}</p>
				</div>
			</a>
			{sourceHref ? (
				<a
					href={sourceHref}
					target="_blank"
					rel="noopener noreferrer"
					aria-label={`${title} source`}
					className="col-start-2 row-start-1 font-mono text-[13px] no-underline"
				>
					source ↗
				</a>
			) : null}
		</div>
	);
}

export function ProjectList({ items }: { items: readonly Project[] }) {
	return (
		<div className="grid grid-cols-1 gap-4">
			{items.map((project) => (
				<Project key={project.title} {...project} />
			))}
		</div>
	);
}

export function Projects() {
	return (
		<div className="w-full">
			<div className="grid grid-cols-[1fr_auto] items-baseline">
				<h2 className="text-[32px] leading-[1.28]">Now brewing</h2>
				<Link to="/projects" className="font-mono text-[13px] no-underline">
					all projects →
				</Link>
			</div>
			<p className="mt-2 font-mono text-[13px] text-faint">
				open source, on the counter
			</p>
			<div className="mt-6">
				<ProjectList items={projects.slice(0, 5)} />
			</div>
		</div>
	);
}
