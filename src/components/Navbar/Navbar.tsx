import React, { useState, useEffect, useCallback } from "react";
import { Link } from "gatsby";
import { StaticImage } from "gatsby-plugin-image";
import { MenuLink } from "../../models";
import { ThemeToggle } from "../ThemeToggle/ThemeToggleNew";
import { SidebarTrigger } from "../ui/sidebar";
import { cn } from "@/lib/utils";

interface NavbarProps {
  menuLinks: MenuLink[];
}

function Navbar({ menuLinks }: NavbarProps): React.ReactElement {
  const [scrolled, setScrolled] = useState(false);

  const navOnScroll = useCallback(() => {
    if (window.scrollY > 20) {
      setScrolled(true);
    } else {
      setScrolled(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", navOnScroll);
    return () => window.removeEventListener("scroll", navOnScroll);
  }, [navOnScroll]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border transition-shadow duration-300",
        scrolled && "shadow-sm"
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left side: Sidebar trigger + Logo */}
          <div className="flex items-center space-x-4">
            <SidebarTrigger />
            <Link to="/" className="flex items-center space-x-2">
              <StaticImage
                src="../../images/face.png"
                className="w-8 h-8 rounded-full"
                alt="Sai Nimmagadda"
                placeholder="blurred"
                width={32}
                height={32}
              />
              <span className="text-xl font-bold">Sai Nimmagadda</span>
            </Link>
          </div>

          {/* Right side: Navigation links + Theme toggle */}
          <div className="flex items-center space-x-4">
            <nav className="hidden md:flex items-center space-x-6">
              {menuLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.link}
                  className="text-sm font-medium transition-colors hover:text-primary"
                  activeClassName="text-primary"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
