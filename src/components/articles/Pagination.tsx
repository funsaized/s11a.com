import React from "react";
import { Button } from "../ui/button";

const ChevronLeftIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 19l-7-7 7-7"
    />
  </svg>
);

const ChevronRightIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 5l7 7-7 7"
    />
  </svg>
);

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}: PaginationProps) {
  // Don't render if there's only one page or no pages
  if (totalPages <= 1) return null;

  const generatePageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const showEllipsis = totalPages > 7;

    if (!showEllipsis) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage <= 3) {
        // Current page is near the beginning
        pages.push(2, 3, 4);
        if (totalPages > 5) {
          pages.push("ellipsis");
        }
        if (totalPages > 4) {
          pages.push(totalPages);
        }
      } else if (currentPage >= totalPages - 2) {
        // Current page is near the end
        if (totalPages > 4) {
          pages.push("ellipsis");
        }
        for (let i = Math.max(2, totalPages - 3); i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Current page is in the middle
        pages.push("ellipsis");
        pages.push(currentPage - 1, currentPage, currentPage + 1);
        pages.push("ellipsis");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pages = generatePageNumbers();

  return (
    <div className={`flex items-center justify-center space-x-1 ${className}`}>
      {/* Previous Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="h-8 w-8 p-0"
        aria-label="Previous page"
      >
        <ChevronLeftIcon />
      </Button>

      {/* Page Numbers */}
      {pages.map((page, index) => {
        if (page === "ellipsis") {
          return (
            <span
              key={`ellipsis-${index}`}
              className="px-2 text-muted-foreground"
            >
              ...
            </span>
          );
        }

        const isCurrentPage = page === currentPage;

        return (
          <Button
            key={page}
            variant={isCurrentPage ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(page)}
            className="h-8 w-8 p-0"
            aria-label={`Page ${page}`}
            aria-current={isCurrentPage ? "page" : undefined}
          >
            {page}
          </Button>
        );
      })}

      {/* Next Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="h-8 w-8 p-0"
        aria-label="Next page"
      >
        <ChevronRightIcon />
      </Button>
    </div>
  );
}
