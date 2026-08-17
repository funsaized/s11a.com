import { Link } from "@tanstack/react-router";

export function Header() {
	return (
		<header className="sticky top-0 z-50 w-full border-b  bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
			<div className="container flex h-16 items-center mx-auto">
				<div className="flex flex-1 gap-4 justify-start">
					<Link to="/" className="flex items-center space-x-2">
						<img
							src="face.png"
							alt=""
							width={32}
							height={32}
							className="w-8 h-8"
						></img>
						<span className="text-xxl font-bold">s11a</span>
					</Link>
				</div>

				<div className="flex-none">
					<p>Centered</p>
				</div>

				<div className="flex flex-1 gap-4 justify-end">
					<p>Right 1</p>
					<p>Right 2</p>
				</div>
			</div>
		</header>
	);
}
