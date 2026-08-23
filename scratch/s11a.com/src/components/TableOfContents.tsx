import type { TocItem } from "#/lib/rehype-mdx-toc";

const ListIcon = () => (
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
			d="M4 6h16M4 10h16M4 14h16M4 18h16"
		/>
	</svg>
);

function TocList({ items, level = 0 }: { items: TocItem[]; level?: number }) {
	return (
		<ul className={`space-y-2 ${level > 0 ? "ml-4 mt-2" : ""}`}>
			{items.map((item) => (
				<li key={item.url}>
					<a
						href={item.url}
						className={`block text-sm transition-colors hover:text-primary ${
							level === 0
								? "font-medium text-foreground"
								: level === 1
									? "text-muted-foreground"
									: "text-muted-foreground/80"
						}`}
					>
						{item.title}
					</a>
					{item.items && item.items.length > 0 && (
						<TocList items={item.items} level={level + 1} />
					)}
				</li>
			))}
		</ul>
	);
}

export function TableOfContents({ toc }: { toc: TocItem[] }) {
	if (toc.length === 0) {
		return null;
	}

	return (
		<nav>
			<div className="flex items-center gap-2 font-semibold text-sm font-mono uppercase text-muted-foreground">
				<ListIcon />
				Table of contents
			</div>
			<div className="border-l-2 border-muted pl-6">
				<TocList items={toc} />
			</div>
		</nav>
	);
}
