export function Footer() {
	return (
		<footer className="border-t bg-background">
			<div className="container max-w-screen-2xl px-4 py-9">
				<div className="flex flex-col items-center space-y-4 md:flex-row md:justify-between md:space-y-0">
					{/* Copyright*/}
					<div className="text-center text-sm text-muted-foreground">
						© 2026 Sai Nimmagadda. All rights reserved.
					</div>
					{/* Social Links*/}
					<div className="flex items-center space-x-4">
						<div>Item1</div>
						<div>Item2</div>
						<div>Item3</div>
					</div>
				</div>
				{/* Additional footer content */}
				<div className="mt-6 border-t pt-6 text-center text-xs text-muted-foreground">
					<p>
						Built with <span className="text-red-500">♥</span> using Tanstack &
						MDX
					</p>
				</div>
			</div>
		</footer>
	);
}
