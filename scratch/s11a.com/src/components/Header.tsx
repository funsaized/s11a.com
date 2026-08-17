import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { ThemeToggle } from "./ThemeToggle";
import { Button } from "./ui/button";

const navigation = [
	{ name: "Home", href: "/" },
	{ name: "Articles", href: "/articles" },
	{ name: "About", href: "/about" },
];

const MenuIcon = () => (
	<svg
		className="h-6 w-6"
		fill="none"
		stroke="currentColor"
		viewBox="0 0 24 24"
		xmlns="http://www.w3.org/2000/svg"
	>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={2}
			d="M4 6h16M4 12h16M4 18h16"
		/>
	</svg>
);

const CloseIcon = () => (
	<svg
		className="h-6 w-6"
		fill="none"
		stroke="currentColor"
		viewBox="0 0 24 24"
		xmlns="http://www.w3.org/2000/svg"
	>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={2}
			d="M6 18L18 6M6 6l12 12"
		/>
	</svg>
);

export function Header() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

	useEffect(() => {
		if (!isMenuOpen) return undefined;
		const closeOnEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") setIsMenuOpen(false);
		};
		document.addEventListener("keydown", closeOnEscape);
		return () => document.removeEventListener("keydown", closeOnEscape);
	}, [isMenuOpen]);

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

				<nav className="flex-none">
					<div className="hidden md:flex items-center space-x-4 text-sm font-medium">
						{navigation.map((item) => (
							<Link key={item.name} to={item.href}>
								{item.name}
							</Link>
						))}
					</div>
				</nav>

				<div className="flex flex-1 gap-4 justify-end">
					<div className="flex items-center space-x-2">
						<ThemeToggle />
						{/* Mobile Burger Menu */}
						<div className="md:hidden">
							<Button
								variant="ghost"
								size="icon"
								onClick={toggleMenu}
								aria-expanded={isMenuOpen}
								aria-controls="mobile-navigation"
							>
								{isMenuOpen ? <CloseIcon /> : <MenuIcon />}
								<span className="sr-only">Toggle menu</span>
							</Button>
						</div>{" "}
					</div>
				</div>
			</div>
			{/* Mobile Navigation */}
			{isMenuOpen && (
				<div id="mobile-navigation" className="md:hidden">
					<div className="border-t bg-background px-4 py-4 space-y-3">
						{navigation.map((item) => (
							<Link
								key={item.name}
								to={item.href}
								className="block py-2 text-base font-medium transition-colors hover:text-foreground/80 text-foreground/60"
								onClick={() => setIsMenuOpen(false)}
								activeProps={{ className: "text-foreground" }}
							>
								{item.name}
							</Link>
						))}
					</div>
				</div>
			)}
		</header>
	);
}
