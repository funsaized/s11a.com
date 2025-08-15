import React from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
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
        "relative text-sm text-muted-foreground flex items-center",
        size === "icon" ? "justify-center" : "justify-center gap-3",
        size === "default" && "h-9 px-3",
        size === "sm" && "h-9 px-3",
        className,
      )}
    >
      {size !== "icon" && (
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline-flex truncate">Search...</span>
          <span className="sm:hidden truncate">Search</span>
          {showShortcut && (
            <kbd className="pointer-events-none hidden h-5 select-none items-center rounded border bg-muted px-1 font-mono text-[10px] font-medium opacity-100 sm:flex ml-2">
              <span className="text-xs">⌘</span>K
            </kbd>
          )}
        </div>
      )}
      {size === "icon" && <Search className="h-4 w-4" />}
    </Button>
  );
}

export default SearchTrigger;
