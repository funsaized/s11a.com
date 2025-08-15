import React from "react";
import { Link } from "gatsby";
import { Separator } from "../ui/separator";
import { useSidebar } from "../../context/SidebarContext";

function GlobalSidebar(): React.ReactElement {
  const { isOpen } = useSidebar();

  return (
    <div
      className={`hidden md:block fixed left-0 top-20 bottom-0 w-64 bg-background border-r border-border p-4 overflow-y-auto transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="space-y-6">
        {/* About Me Section */}
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3">
            About Me
          </h2>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground leading-relaxed">
              I'm <span className="text-primary font-medium">Sai</span>,
              software engineer and open-source creator. Software is my hobby 🎮
            </p>
          </div>
        </div>

        <Separator />

        {/* Stay Connected Section */}
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3">
            Stay Connected
          </h2>
          <div className="space-y-1">
            <a
              href="https://github.com/funsaized"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm text-muted-foreground hover:text-primary transition-colors py-1"
            >
              🧡 GitHub
            </a>
            <a
              href="https://www.threads.com/@funsaized"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm text-muted-foreground hover:text-primary transition-colors py-1"
            >
              🧵 Threads
            </a>
            <Link
              to="/rss.xml"
              className="block text-sm text-muted-foreground hover:text-primary transition-colors py-1"
            >
              📡 RSS Feed
            </Link>
          </div>
        </div>

        <Separator />

        {/* Notes Section */}
        <div>
          <h2 className="text-sm text-muted-foreground font-semibold text-foreground mb-3">
            Notes (coming soon...)
          </h2>
          <div className="space-y-1">
            <Link
              to="/notes"
              className="block text-sm text-muted-foreground hover:text-primary transition-colors py-1"
            >
              📝 Notes
            </Link>
          </div>
        </div>

        <Separator />

        {/* Lifestyle Section */}
        <div>
          <h2 className="text-sm text-muted-foreground font-semibold text-foreground mb-3">
            Lifestyle (coming soon...)
          </h2>
          <Link
            to="/lifestyle/productivity"
            className="block text-sm text-muted-foreground hover:text-primary transition-colors py-1"
          >
            🍳 Productivity & Workflows
          </Link>
          <Link
            to="/lifestyle/cooking"
            className="block text-sm text-muted-foreground hover:text-primary transition-colors py-1"
          >
            🍳 Cooking Experiments
          </Link>
          <div className="space-y-1">
            <Link
              to="/lifestyle/fitness"
              className="block text-sm text-muted-foreground hover:text-primary transition-colors py-1"
            >
              💪 Fitness Journey
            </Link>
            <Link
              to="/lifestyle/travel"
              className="block text-sm text-muted-foreground hover:text-primary transition-colors py-1"
            >
              ✈️ Travel Adventures
            </Link>
            <Link
              to="/lifestyle/music"
              className="block text-sm text-muted-foreground hover:text-primary transition-colors py-1"
            >
              🎵 Music & Playlists
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GlobalSidebar;
