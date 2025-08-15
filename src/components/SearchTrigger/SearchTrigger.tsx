import React from "react";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchTriggerProps {
  onClick: () => void;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showShortcut?: boolean;
}

function SearchTrigger({
  onClick,
  variant = "outline",
  size = "default",
  className,
  showShortcut = true,
}: SearchTriggerProps): React.ReactElement {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      className={cn(
        "relative justify-start text-sm text-muted-foreground",
        size === "default" && "h-9 px-3",
        className
      )}
    >
      <Search className="mr-2 h-4 w-4" />
      <span className="hidden sm:inline-flex">Search...</span>
      <span className="sm:hidden">Search</span>
      {showShortcut && (
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      )}
    </Button>
  );
}

export default SearchTrigger;