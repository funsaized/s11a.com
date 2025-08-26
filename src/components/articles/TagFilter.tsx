import React from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

const TagIcon = () => (
  <svg
    className="h-3 w-3"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z"
    />
  </svg>
);

const ClearIcon = () => (
  <svg
    className="h-3 w-3"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

interface TagFilterProps {
  selectedTags: string[];
  onTagToggle: (tagName: string) => void;
  onClearTags: () => void;
  availableTags: string[];
  className?: string;
}

export function TagFilter({
  selectedTags = [],
  onTagToggle,
  onClearTags,
  availableTags = [],
  className = "",
}: TagFilterProps) {
  // Show only unselected tags in the available list
  const unselectedTags = availableTags.filter(
    (tag) => !selectedTags.includes(tag),
  );

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium">
              <TagIcon />
              Selected Tags ({selectedTags.length})
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearTags}
              className="h-6 px-2 text-xs"
            >
              Clear All
            </Button>
          </div>
          <div className="flex flex-wrap gap-1">
            {selectedTags.map((tag) => (
              <Badge
                key={tag}
                variant="default"
                className="cursor-pointer hover:bg-primary/80 transition-colors"
                onClick={() => onTagToggle(tag)}
              >
                {tag}
                <ClearIcon />
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Available Tags */}
      {unselectedTags.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">
            Available Tags
          </div>
          <div className="flex flex-wrap gap-1">
            {unselectedTags.slice(0, 15).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                onClick={() => onTagToggle(tag)}
              >
                {tag}
              </Badge>
            ))}
            {unselectedTags.length > 15 && (
              <Badge variant="outline" className="opacity-60">
                +{unselectedTags.length - 15} more
              </Badge>
            )}
          </div>
        </div>
      )}

      {selectedTags.length === 0 && unselectedTags.length === 0 && (
        <div className="text-sm text-muted-foreground">No tags available</div>
      )}
    </div>
  );
}
