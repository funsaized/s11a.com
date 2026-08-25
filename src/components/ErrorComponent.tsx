import type { ErrorComponentProps } from "@tanstack/react-router";

import { Button } from "./ui/button";

const DEFAULT_ERROR = `InternalError: the renderer tried its best and then didn't
at ArticleLoader.hydrate (s11a/articles.ts:214:11)
at handleRequest (s11a/edge.ts:48:22)
at async Server.serve (s11a/server.ts:19:5)
at cosmic ray (probably:1:1)
ßß... 3 frames hidden out of politeness`;

function StackTraceContainer() {
	return (
		<div className="w-full overflow-hidden rounded-3xl border-2">
			<pre
				aria-label="Error stack trace"
				className="m-0 overflow-x-auto px-6 py-7 font-mono text-sm leading-7 sm:px-9 sm:py-8 sm:text-base"
			>
				<code className="block min-w-max whitespace-pre">{DEFAULT_ERROR}</code>
			</pre>
		</div>
	);
}

function NavigationOptions() {
	return (
		<div className="flex w-full items-center gap-4">
			<Button
				type="button"
				variant="outline"
				className="h-auto min-h-16 flex-1 justify-between rounded-2xl px-6 py-2"
			>
				<span className="flex items-center gap-5 text-lg font-semibold">
					<span aria-hidden="true" className="size-3 rounded-full bg-current" />
					Articles
				</span>
				<span className="font-mono text-base">100%</span>
			</Button>
			<Button
				type="button"
				variant="outline"
				className="h-auto min-h-16 flex-1 justify-between rounded-2xl px-6 py-2"
			>
				<span className="flex items-center gap-5 text-lg font-semibold">
					<span aria-hidden="true" className="size-3 rounded-full bg-current" />
					Search
				</span>
				<span className="font-mono text-base">99.9%</span>
			</Button>
			<Button
				type="button"
				variant="outline"
				className="h-auto min-h-16 flex-1 justify-between rounded-2xl px-6 py-2"
			>
				<span className="flex items-center gap-5 text-lg font-semibold">
					<span aria-hidden="true" className="size-3 rounded-full bg-current" />
					Renderer
				</span>
				<span className="font-mono text-base">sulking</span>
			</Button>
			<Button
				type="button"
				variant="outline"
				className="h-auto min-h-16 flex-1 justify-between rounded-2xl px-6 py-2"
			>
				<span className="flex items-center gap-5 text-lg font-semibold">
					<span aria-hidden="true" className="size-3 rounded-full bg-current" />
					Coffee
				</span>
				<span className="font-mono text-base ">hot</span>
			</Button>
		</div>
	);
}

export function ErrorComponent(_props: ErrorComponentProps) {
	return (
		<div className="container mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center gap-4 px-4">
			<div className="flex w-full max-w-3xl flex-col items-center gap-4">
				<h1 className="text-4xl font-extrabold">
					Something exploded. Tastefully
				</h1>
				<p className="text-center leading-loose">
					Somewhere in a CDN, a very small process read your request, made
					direct eye contact with the abyss, and quietly stepped off the edge. A
					replacement process has been hired. Nothing you did caused this,
					though feel free to take credit.
				</p>
				<div className="flex items-center justify-center gap-4">
					<Button>
						<span>Back to safety</span>
					</Button>
					<Button variant="outline">
						<span className="font-mono">Copy error code</span>
					</Button>
				</div>
			</div>
			<StackTraceContainer />
			<NavigationOptions />
		</div>
	);
}
