export function Footer() {
	return (
		<footer className="w-full border-t bg-background">
			<div className="w-full px-[clamp(16px,4vw,44px)] py-6">
				<div className="flex flex-wrap items-center justify-between gap-2.5 font-mono text-xs text-faint">
					{/* Copyright*/}
					<div>© 2026 Sai Nimmagadda. All rights reserved.</div>
					{/* Social Links*/}
					<div className="flex items-center space-x-4">
						<a
							href="https://github.com/funsaized"
							target="_blank"
							rel="noreferrer"
							className="text-faint no-underline hover:text-accent"
						>
							github
						</a>
						<a
							href="https://www.linkedin.com/in/sainimmagadda/"
							target="_blank"
							rel="noreferrer"
							className="text-faint no-underline hover:text-accent"
						>
							linkedin
						</a>
						<span title="RSS feed coming soon">rss</span>
						<a
							href="/404"
							className="text-faint no-underline hover:text-accent"
						>
							404
						</a>
					</div>
				</div>
			</div>
		</footer>
	);
}
