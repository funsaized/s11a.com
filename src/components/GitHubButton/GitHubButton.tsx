import React from "react";
import { Github } from "lucide-react";
import { Button } from "../ui/button";

interface GitHubButtonProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "secondary" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

function GitHubButton({
  href,
  children,
  className = "",
  variant = "outline",
  size = "default",
}: GitHubButtonProps): React.ReactElement {
  return (
    <Button variant={variant} size={size} className={className} asChild>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`View ${children} on GitHub`}
      >
        <Github className="w-4 h-4 mr-2" />
        {children}
      </a>
    </Button>
  );
}

export default GitHubButton;
