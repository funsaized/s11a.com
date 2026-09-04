import { Link } from "@tanstack/react-router";
import { Folder } from "lucide-react";
import { useState } from "react";

import { projects, type Project, type ProjectBadge } from "#/lib/projects";
import { cn } from "#/lib/utils";

function brewingByYear() {
	const grouped = new Map<number, Project[]>();

	for (const project of projects) {
		const list = grouped.get(project.year) ?? [];
		list.push(project);
		grouped.set(project.year, list);
	}

	return [...grouped.entries()]
		.toSorted(([a], [b]) => b - a)
		.map(([year, items]) => ({ year, items }));
}

const YEARS = brewingByYear();

function Badge({ kind }: { kind: ProjectBadge }) {
	if (kind === "building") {
		return (
			<span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[color-mix(in_oklab,var(--accent2)_16%,var(--background))] px-1.5 py-0.5 font-mono text-[10px] leading-none text-accent-2">
				<span className="size-1.5 rounded-full bg-accent-2" aria-hidden />
				Building…
			</span>
		);
	}

	if (kind === "archived") {
		return (
			<span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 font-mono text-[10px] leading-none text-muted-foreground">
				Archived
			</span>
		);
	}

	return (
		<span className="shrink-0 rounded-full bg-[color-mix(in_oklab,var(--accent)_20%,var(--background))] px-1.5 py-0.5 font-mono text-[10px] leading-none text-accent">
			New
		</span>
	);
}

function ProjectRow({ item }: { item: Project }) {
	const badge =
		item.badge ?? (item.status === "archived" ? "archived" : undefined);

	return (
		<a
			href={item.path}
			target="_blank"
			rel="noopener noreferrer"
			className="row-link relative flex min-h-9 w-full min-w-0 items-center gap-2 py-1.5 pr-1"
		>
			<span className="flex min-w-0 flex-1 items-center gap-1.5">
				<span className="truncate text-[14px] leading-snug">{item.title}</span>
				{badge ? <Badge kind={badge} /> : null}
			</span>
			<span className="hidden shrink-0 font-mono text-[12px] text-faint italic sm:inline">
				{"// "}
				{item.category}
			</span>
		</a>
	);
}

function YearFolder({
	year,
	items,
	open,
	current,
	last,
	onToggle,
}: {
	year: number;
	items: Project[];
	open: boolean;
	current: boolean;
	last: boolean;
	onToggle: () => void;
}) {
	const folderColor = current ? "text-accent" : "text-dim";

	return (
		<li className="relative">
			<span
				className={cn(
					"pointer-events-none absolute top-0 left-2.75 w-px bg-border",
					last ? "h-4.5" : "bottom-0",
				)}
				aria-hidden
			/>
			<span
				className="pointer-events-none absolute top-4.5 left-2.75 h-px w-3 bg-border"
				aria-hidden
			/>
			<button
				type="button"
				aria-expanded={open}
				onClick={onToggle}
				className={cn(
					"relative ml-6 flex w-[calc(100%-1.5rem)] cursor-pointer items-center gap-2 rounded-[10px] border border-transparent px-2.5 py-2 text-left font-mono text-[14px] leading-none",
					"hover:bg-[color-mix(in_oklab,currentColor_8%,transparent)]",
					"focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
					folderColor,
					open &&
						"border-current bg-[color-mix(in_oklab,currentColor_8%,transparent)]",
					!current && !open && "text-muted-foreground",
				)}
			>
				<Folder
					aria-hidden
					className={cn("size-3.5 shrink-0 fill-current", folderColor)}
					strokeWidth={1.5}
				/>
				{year}
			</button>
			<div
				className={cn(
					"grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none",
					open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
				)}
			>
				<ul
					className="ml-10 min-h-0 overflow-hidden"
					inert={open ? undefined : true}
				>
					{items.map((item) => (
						<li key={item.title}>
							<ProjectRow item={item} />
						</li>
					))}
				</ul>
			</div>
		</li>
	);
}

export function WorkTree() {
	const newest = YEARS[0]?.year;
	const [openYear, setOpenYear] = useState<number | null>(newest ?? null);

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
				<p className="mb-1 font-mono text-[13px] text-faint">Work</p>
				<ul>
					{YEARS.map((group, index) => (
						<YearFolder
							key={group.year}
							year={group.year}
							items={group.items}
							open={openYear === group.year}
							current={group.year === newest}
							last={index === YEARS.length - 1}
							onToggle={() =>
								setOpenYear((current) =>
									current === group.year ? null : group.year,
								)
							}
						/>
					))}
				</ul>
			</div>
		</div>
	);
}
