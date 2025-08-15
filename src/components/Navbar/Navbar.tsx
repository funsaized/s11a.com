import React, { useState, useEffect, useCallback } from "react";
import { Link } from "gatsby";
import { StaticImage } from "gatsby-plugin-image";
import { MenuLink } from "../../models";
import { ThemeToggle } from "../ThemeToggle/ThemeToggle";
import { SidebarTrigger } from "../ui/sidebar";
import SearchTrigger from "../SearchTrigger/SearchTrigger";
import SearchDialog from "../SearchDialog/SearchDialog";

interface NavbarProps {
  menuLinks: MenuLink[];
}

function Navbar({ menuLinks }: NavbarProps): React.ReactElement {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

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
    <nav
      className={`fixed w-full top-0 left-0 z-30 bg-background border-b border-border transition-all duration-300 ${
        scrolled ? "shadow-md" : ""
      }`}
    >
      <div
        className={`px-4 max-w-7xl mr-auto flex items-center justify-between transition-all duration-300 ${
          scrolled ? "h-[60px]" : "h-[55px]"
        }`}
      >
        <div className="text-xl font-semibold flex items-center">
          <SidebarTrigger className="mr-3 hidden md:flex" />
          <Link
            to="/"
            className="flex items-center text-foreground hover:text-primary font-semibold text-lg transition-colors"
          >
            <StaticImage
              src="../../images/face.png"
              className="w-[30px] mr-3"
              alt="Face"
            />
            <span className="hidden md:block">Sai Nimmagadda</span>
          </Link>
        </div>
        <div className="flex flex-row justify-end flex-1 items-center">
          <div className="hidden md:flex items-center space-x-2">
            {menuLinks.map((link) => (
              <Link
                key={link.name}
                to={link.link}
                className={`flex items-center text-base font-medium py-4 px-3 text-muted-foreground hover:text-foreground transition-colors ${
                  scrolled
                    ? "hover:border-b-2 hover:border-primary active:border-b-2 active:border-dashed active:border-primary"
                    : ""
                }`}
                activeClassName={
                  scrolled
                    ? "text-foreground border-b-2 border-primary"
                    : "text-foreground"
                }
              >
                {link.name}
              </Link>
            ))}
            <SearchTrigger
              onClick={() => setSearchOpen(true)}
              variant="ghost"
              size="sm"
              className="ml-3"
            />
          </div>
          <div className="md:hidden flex items-center space-x-2">
            {menuLinks.slice(0, 2).map((link) => (
              <Link
                key={link.name}
                to={link.link}
                className="flex items-center text-sm font-medium py-2 px-2 text-muted-foreground hover:text-foreground transition-colors"
                activeClassName="text-foreground"
              >
                {link.name}
              </Link>
            ))}
            <SearchTrigger
              onClick={() => setSearchOpen(true)}
              variant="ghost"
              size="icon"
              showShortcut={false}
              className="h-8 w-8"
            />
          </div>
          <ThemeToggle />
        </div>
      </div>
      
      {/* Search Dialog */}
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </nav>
  );
}

export default Navbar;
