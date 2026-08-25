import { Link } from "@tanstack/react-router";

import { Button } from "./ui/button";

export function NotFoundComponent() {
	return (
		<div className="container mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center gap-4 px-4">
			<div className="flex w-full max-w-3xl flex-col items-center gap-4">
				<h1 className="text-4xl font-extrabold">This page took a sabbatical</h1>
				<p className="text-center leading-loose">
					This URL has been thoroughly searched. We looked behind the router,
					under the CDN, inside a folder ominously named `regrets/`, and asked
					the DNS records if they'd seen anything. They had not. Here is a
					consolation menu of pages that definitely exist.
				</p>
				<div className="flex items-center justify-center gap-4">
					<Button asChild>
						<Link
							className="text-primary-foreground! hover:text-primary-foreground!"
							to="/articles"
						>
							Browse Articles
						</Link>
					</Button>
					<Button variant="outline" asChild>
						<Link to="/" className="font-mono">
							Take me home
						</Link>
					</Button>
				</div>
				<p className="text-sm text-muted-foreground">
					If you think this is a mistake, please{" "}
					<a
						href="https://github.com/funsaized/s11a.com/issues"
						target="_blank"
						rel="noopener noreferrer"
						className="text-primary hover:underline"
					>
						report it on GitHub
					</a>
				</p>
			</div>
		</div>
	);
}
