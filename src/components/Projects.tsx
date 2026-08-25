import { Link } from "@tanstack/react-router";

import { projects, type Project } from "#/lib/projects";

function Project({ icon, title, path, description, status, stars }: Project) {
	return (
		<a
			className="text-foreground no-underline row-link border-b border-border"
			href={path}
			target="_blank"
			rel="noopener noreferrer"
			aria-label={title}
		>
			<div className="flex items-baseline gap-x-3.5 ">
				<span>{icon}</span>
				<div className="flex gap-4 justify-between items-center">
					<h3 className="w-fit">{title}</h3>
					<span className="uppercase font-mono text-[10px] text-muted-foreground">
						{status}
					</span>
				</div>
				<span className="min-w-10.5 flex-1 -translate-y-1.25 [border-bottom:var(--rule-dotted)]" />
				<span className="text-faint text-[10px]">
					{"★ "}
					{stars || 0}
				</span>
			</div>

			<div className="flex items-baseline gap-x-3.5 gap-y-2 px-0.5 py-3.75">
				<p className="text-base">{description}</p>
			</div>
		</a>
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
			<div className="mt-6 grid grid-cols-1 gap-4">
				{projects.slice(0, 5).map((project) => (
					<Project key={project.title} {...project} />
				))}
			</div>
		</div>
	);
}
