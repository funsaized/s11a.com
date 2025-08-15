import React, { useState, useEffect, useCallback } from "react";
import { Link } from "gatsby";
import { StaticImage } from "gatsby-plugin-image";
import { MenuLink } from "../../models";
import ThemeToggle from "../ThemeToggle/ThemeToggle";

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
    <div className={scrolled ? "nav scroll" : "nav"}>
      <div className="nav-container">
        <div className="me">
          <Link key="sai" to="/" activeClassName="active">
            <StaticImage
              src="../../images/face.png"
              className="favicon"
              alt="Face"
            />
            <span className="text">Sai Nimmagadda</span>
          </Link>
        </div>
        <div className="links">
          {menuLinks.map((link) => (
            <Link key={link.name} to={link.link} activeClassName="active">
              {link.name}
            </Link>
          ))}
          <ThemeToggle className="theme-toggle--compact theme-toggle--subtle" />
        </div>
      </div>
    </div>
  );
}

export default Navbar;
