import React, { useState } from "react";
import { Filter, Search, FolderOpen, Tag, X } from "lucide-react";
import { useStaticQuery, graphql } from "gatsby";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface FilterState {
  categories: string[];
  tags: string[];
  dateRange?: string;
  searchTerm: string;
}

interface CategoryTagFilterProps {
  className?: string;
  onFilterChange?: (filters: FilterState) => void;
}

export function CategoryTagFilter({
  className,
  onFilterChange,
}: CategoryTagFilterProps): React.ReactElement {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    tags: [],
    searchTerm: "",
  });

  const data = useStaticQuery(graphql`
    query CategoryTagFilterQuery {
      posts: allMarkdownRemark(
        sort: { fields: { date: DESC } }
        filter: { frontmatter: { type: { eq: "post" } } }
      ) {
        edges {
          node {
            fields {
              slug
              date
            }
            frontmatter {
              title
              category
              tags
            }
            excerpt(pruneLength: 150)
            timeToRead
          }
        }
      }
      categories: allMarkdownRemark {
        group(field: { frontmatter: { category: SELECT } }) {
          fieldValue
          totalCount
        }
      }
      tags: allMarkdownRemark {
        group(field: { frontmatter: { tags: SELECT } }) {
          fieldValue
          totalCount
        }
      }
    }
  `);

  // Get unique categories and tags with counts
  const categories = data.categories.group
    .filter((group: any) => group.fieldValue)
    .sort((a: any, b: any) => b.totalCount - a.totalCount);

  const tags = data.tags.group
    .filter((group: any) => group.fieldValue)
    .sort((a: any, b: any) => b.totalCount - a.totalCount);

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFilterChange?.(updated);
  };

  const toggleCategory = (category: string) => {
    const updated = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];
    updateFilters({ categories: updated });
  };

  const toggleTag = (tag: string) => {
    const updated = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag];
    updateFilters({ tags: updated });
  };

  const clearFilters = () => {
    updateFilters({ categories: [], tags: [], searchTerm: "" });
  };

  const activeFilterCount = filters.categories.length + filters.tags.length;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="relative">
            <Filter className="h-4 w-4 mr-2" />
            Filter
            {activeFilterCount > 0 && (
              <Badge
                variant="secondary"
                className="ml-2 h-5 w-5 p-0 text-xs flex items-center justify-center"
              >
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Posts
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Search */}
            <div>
              <label
                htmlFor="search-posts"
                className="text-sm font-medium mb-3 block"
              >
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="search-posts"
                  type="text"
                  value={filters.searchTerm}
                  onChange={(e) =>
                    updateFilters({ searchTerm: e.target.value })
                  }
                  placeholder="Search posts..."
                  className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            {/* Categories */}
            <div>
              <div className="text-sm font-medium mb-3 flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                Categories
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {categories.map((category: any) => (
                  <div
                    key={category.fieldValue}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="checkbox"
                      id={`category-${category.fieldValue}`}
                      checked={filters.categories.includes(category.fieldValue)}
                      onChange={() => toggleCategory(category.fieldValue)}
                      className="rounded border-border"
                    />
                    <label
                      htmlFor={`category-${category.fieldValue}`}
                      className="flex-1 text-sm cursor-pointer"
                    >
                      {category.fieldValue}
                    </label>
                    <Badge variant="secondary" className="text-xs">
                      {category.totalCount}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <div className="text-sm font-medium mb-3 flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Tags
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {tags.map((tag: any) => (
                  <div key={tag.fieldValue} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`tag-${tag.fieldValue}`}
                      checked={filters.tags.includes(tag.fieldValue)}
                      onChange={() => toggleTag(tag.fieldValue)}
                      className="rounded border-border"
                    />
                    <label
                      htmlFor={`tag-${tag.fieldValue}`}
                      className="flex-1 text-sm cursor-pointer"
                    >
                      {tag.fieldValue}
                    </label>
                    <Badge variant="secondary" className="text-xs">
                      {tag.totalCount}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t space-y-2">
              <Button
                onClick={clearFilters}
                variant="outline"
                className="w-full"
              >
                <X className="h-4 w-4 mr-2" />
                Clear All Filters
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-1">
          {filters.categories.map((category) => (
            <Badge
              key={category}
              variant="secondary"
              className="text-xs cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => toggleCategory(category)}
            >
              {category}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
          {filters.tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="text-xs cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => toggleTag(tag)}
            >
              {tag}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

export default CategoryTagFilter;
