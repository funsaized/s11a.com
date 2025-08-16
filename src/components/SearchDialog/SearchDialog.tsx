"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useStaticQuery, graphql, navigate } from "gatsby";
import {
  Search,
  FileText,
  FolderOpen,
  Tag,
  Home,
  User,
  Palette,
  History,
  Bookmark,
  Settings,
  Sun,
  Moon,
  Monitor,
  Clock,
  Star,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
} from "@/components/ui/command";

interface SearchResult {
  type: "post" | "category" | "tag" | "action" | "recent" | "bookmark";
  title: string;
  slug: string;
  excerpt?: string;
  category?: string;
  date?: string;
  action?: () => void;
  icon?: React.ReactNode;
  shortcut?: string;
}

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function SearchDialog({
  open,
  onOpenChange,
}: SearchDialogProps): React.ReactElement {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([]);
  const { theme, setTheme } = useTheme();

  const data = useStaticQuery(graphql`
    query SearchQuery {
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
            excerpt(pruneLength: 100)
            frontmatter {
              title
              tags
              category
            }
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

  // Prepare searchable data
  const searchData = React.useMemo(() => {
    const results: SearchResult[] = [];

    // Add quick actions first (always visible)
    const quickActions: SearchResult[] = [
      {
        type: "action",
        title: "Go to Home",
        slug: "/",
        icon: <Home className="h-4 w-4" />,
        action: () => navigate("/"),
      },
      {
        type: "action",
        title: "View About",
        slug: "/about",
        icon: <User className="h-4 w-4" />,
        action: () => navigate("/about"),
      },
      {
        type: "action",
        title: "Browse Blog",
        slug: "/blog",
        icon: <FileText className="h-4 w-4" />,
        action: () => navigate("/blog"),
      },
      {
        type: "action",
        title: "Switch to Light Theme",
        slug: "",
        icon: <Sun className="h-4 w-4" />,
        action: () => setTheme("light"),
        shortcut: "⌘⇧T",
      },
      {
        type: "action",
        title: "Switch to Dark Theme",
        slug: "",
        icon: <Moon className="h-4 w-4" />,
        action: () => setTheme("dark"),
        shortcut: "⌘⇧T",
      },
      {
        type: "action",
        title: "Use System Theme",
        slug: "",
        icon: <Monitor className="h-4 w-4" />,
        action: () => setTheme("system"),
        shortcut: "⌘⇧T",
      },
    ];

    results.push(...quickActions);

    // Add recent posts (last 5)
    const recentPosts = data.posts.edges.slice(0, 5);
    recentPosts.forEach(({ node }: any) => {
      results.push({
        type: "recent",
        title: node.frontmatter.title,
        slug: node.fields.slug,
        excerpt: node.excerpt,
        category: node.frontmatter.category,
        date: node.fields.date,
        icon: <Clock className="h-4 w-4" />,
      });
    });

    // Add posts
    data.posts.edges.forEach(({ node }: any) => {
      results.push({
        type: "post",
        title: node.frontmatter.title,
        slug: node.fields.slug,
        excerpt: node.excerpt,
        category: node.frontmatter.category,
        date: node.fields.date,
      });
    });

    // Add categories
    data.categories.group.forEach(({ fieldValue, totalCount }: any) => {
      if (fieldValue) {
        results.push({
          type: "category",
          title: `${fieldValue} (${totalCount} posts)`,
          slug: `/categories/${fieldValue.toLowerCase().replace(/\s+/g, "-")}`,
        });
      }
    });

    // Add tags
    data.tags.group.forEach(({ fieldValue, totalCount }: any) => {
      if (fieldValue) {
        results.push({
          type: "tag",
          title: `${fieldValue} (${totalCount} posts)`,
          slug: `/tags/${fieldValue.toLowerCase().replace(/\s+/g, "-")}`,
        });
      }
    });

    return results;
  }, [data, setTheme]);

  // Filter results based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      // Show quick actions and recent posts when no search term
      const quickActionsAndRecent = searchData.filter(
        (item) => item.type === "action" || item.type === "recent",
      );
      setFilteredResults(quickActionsAndRecent.slice(0, 15));
      return;
    }

    const filtered = searchData.filter((item) => {
      const searchText = searchTerm.toLowerCase();
      return (
        item.title.toLowerCase().includes(searchText) ||
        (item.excerpt && item.excerpt.toLowerCase().includes(searchText)) ||
        (item.category && item.category.toLowerCase().includes(searchText))
      );
    });

    // Sort results: actions first, then recent, posts, categories, tags
    const sorted = filtered.sort((a, b) => {
      const typeOrder = {
        action: 0,
        recent: 1,
        post: 2,
        category: 3,
        tag: 4,
        bookmark: 5,
      };
      return typeOrder[a.type] - typeOrder[b.type];
    });

    setFilteredResults(sorted.slice(0, 20)); // Limit to 20 results
  }, [searchTerm, searchData]);

  const handleSelect = useCallback(
    (result: SearchResult) => {
      onOpenChange(false);
      setSearchTerm("");

      if (result.action) {
        result.action();
      } else if (result.slug) {
        navigate(result.slug);
      }
    },
    [onOpenChange],
  );

  const getIcon = (type: SearchResult["type"], item?: SearchResult) => {
    // Use custom icon if provided
    if (item?.icon) return item.icon;

    switch (type) {
      case "post":
        return <FileText className="h-4 w-4" />;
      case "category":
        return <FolderOpen className="h-4 w-4" />;
      case "tag":
        return <Tag className="h-4 w-4" />;
      case "action":
        return <Settings className="h-4 w-4" />;
      case "recent":
        return <Clock className="h-4 w-4" />;
      case "bookmark":
        return <Bookmark className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: SearchResult["type"]) => {
    switch (type) {
      case "post":
        return "Posts";
      case "category":
        return "Categories";
      case "tag":
        return "Tags";
      case "action":
        return "Quick Actions";
      case "recent":
        return "Recent Posts";
      case "bookmark":
        return "Bookmarks";
    }
  };

  // Group results by type
  const groupedResults = filteredResults.reduce(
    (acc, item) => {
      if (!acc[item.type]) {
        acc[item.type] = [];
      }
      acc[item.type].push(item);
      return acc;
    },
    {} as Record<SearchResult["type"], SearchResult[]>,
  );

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === "Escape") {
        onOpenChange(false);
      }
    };

    document.addEventListener("keydown", handleKeydown);
    return () => document.removeEventListener("keydown", handleKeydown);
  }, [open, onOpenChange]);

  // Reset search when dialog closes
  useEffect(() => {
    if (!open) {
      setSearchTerm("");
    }
  }, [open]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search posts, categories, and tags..."
        value={searchTerm}
        onValueChange={setSearchTerm}
      />
      <CommandList>
        <CommandEmpty>
          {searchTerm
            ? `No results found for "${searchTerm}".`
            : "Start typing to search..."}
        </CommandEmpty>

        {(
          ["action", "recent", "post", "category", "tag", "bookmark"] as const
        ).map((type) => {
          const items = groupedResults[type];
          if (!items || items.length === 0) return null;

          return (
            <CommandGroup key={type} heading={getTypeLabel(type)}>
              {items.map((item, index) => (
                <CommandItem
                  key={`${item.type}-${item.slug || item.title}-${index}`}
                  value={`${item.title} ${item.excerpt || ""} ${item.category || ""}`}
                  onSelect={() => handleSelect(item)}
                  className="cursor-pointer"
                >
                  {getIcon(item.type, item)}
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="font-medium truncate">{item.title}</div>
                    {item.excerpt && (
                      <div className="text-xs text-muted-foreground truncate mt-1">
                        {item.excerpt}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {(item.type === "post" || item.type === "recent") &&
                      item.category && (
                        <div className="text-xs text-muted-foreground">
                          {item.category}
                        </div>
                      )}
                    {item.shortcut && (
                      <CommandShortcut>{item.shortcut}</CommandShortcut>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          );
        })}
      </CommandList>

      <div className="border-t border-border p-2 text-xs text-muted-foreground">
        <div className="flex items-center justify-between">
          <span>Use ↑ ↓ to navigate</span>
          <div className="flex items-center gap-1">
            <CommandShortcut>↵</CommandShortcut>
            <span>to select</span>
          </div>
        </div>
      </div>
    </CommandDialog>
  );
}

export default SearchDialog;
