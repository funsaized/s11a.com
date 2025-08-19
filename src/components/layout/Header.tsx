import React, { useState } from "react";
import { Link } from "gatsby";
import { StaticImage } from "gatsby-plugin-image";
import { Button } from "../ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "../../utils/cn";

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

const navigation = [
  { name: "Home", href: "/" },
  { name: "Articles", href: "/articles" },
  { name: "About", href: "/about" },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 mx-auto">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 text-xl font-bold">
          <StaticImage
            src="../../assets/images/face.png"
            alt="Face"
            placeholder="blurred"
            layout="fixed"
            width={32}
            height={32}
            className="w-8 h-8"
          />
          <span>s11a</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className="transition-colors hover:text-foreground/80 text-foreground/60"
              activeClassName="text-foreground"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Right side - Theme toggle + Mobile menu button */}
        <div className="flex items-center space-x-2">
          <ThemeToggle />

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              className="h-9 w-9"
            >
              {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="border-t bg-background px-4 py-4 space-y-3">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="block py-2 text-base font-medium transition-colors hover:text-foreground/80 text-foreground/60"
                activeClassName="text-foreground"
                onClick={() => setIsMenuOpen(false)}
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
