export function Footer() {
	return (
		<footer className="w-full border-t bg-background">
			<div className="w-full px-2 py-9">
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
			</div>
		</footer>
	);
}
