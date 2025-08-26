import React, { useState, useMemo } from "react";
import type { HeadFC, PageProps } from "gatsby";
import { graphql } from "gatsby";
import { Link } from "gatsby";
import { Layout } from "../components/layout/Layout";
import { SearchInput } from "../components/articles/SearchInput";
import { CategoryFilter } from "../components/articles/CategoryFilter";
import { TagFilter } from "../components/articles/TagFilter";
import { Pagination } from "../components/articles/Pagination";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";

const NOTES_PER_PAGE = 9;

const EditIcon = () => (
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
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
    />
  </svg>
);

const CalendarIcon = () => (
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
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

const ArrowRightIcon = () => (
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

interface Note {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  date?: string;
  category?: string;
  tags?: string[];
  author?: string;
}

// Dynamic category emoji mapping
const getCategoryEmoji = (category: string | undefined): string => {
  if (!category) return "📝";

  const categoryMap: Record<string, string> = {
    food: "🍽️",
    business: "💼",
    entertainment: "🎬",
    health: "💪",
    literature: "📚",
    personal: "👤",
    technology: "💻",
  };

  return categoryMap[category.toLowerCase()] || "📝";
};

function NoteCard({ note }: { note: Note }) {
  const categoryEmoji = getCategoryEmoji(note.category);

  return (
    <Card className="group transition-all duration-200 hover:shadow-lg hover:-translate-y-1 h-full bg-card border border-border">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <EditIcon className="h-4 w-4 text-muted-foreground" />
            {note.category && (
              <Badge variant="secondary" className="text-xs">
                {categoryEmoji} {note.category}
              </Badge>
            )}
          </div>
          {note.date && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarIcon />
              <time dateTime={note.date}>
                {new Date(note.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </time>
            </div>
          )}
        </div>
        <CardTitle className="text-lg leading-tight group-hover:text-foreground/80 transition-colors">
          <Link to={`/notes/${note.slug}`} className="block">
            {note.title}
          </Link>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        {note.excerpt && (
          <p className="text-muted-foreground text-sm mb-4 line-clamp-3 flex-1">
            {note.excerpt}
          </p>
        )}

        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {note.tags.slice(0, 4).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
            {note.tags.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{note.tags.length - 4}
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mt-auto">
          {note.author && (
            <span className="text-xs text-muted-foreground">
              — {note.author}
            </span>
          )}

          <Link
            to={`/notes/${note.slug}`}
            className="inline-flex items-center gap-1 text-sm text-foreground hover:gap-2 transition-all font-medium"
          >
            Read note
            <ArrowRightIcon />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

interface NoteNode {
  id: string;
  frontmatter: {
    title: string;
    slug?: string;
    excerpt?: string;
    date?: string;
    category?: string;
    tags?: string[];
    author?: string;
  };
  internal: {
    contentFilePath: string;
  };
}

interface NotesPageData {
  allMdx: {
    nodes: NoteNode[];
  };
}

const NotesPage: React.FC<PageProps<NotesPageData>> = ({ data }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Transform GraphQL data to Note format
  const notes: Note[] = data.allMdx.nodes.map((node) => {
    // Generate slug from title or filename
    const getFilenameFromPath = (filePath: string): string =>
      filePath.split("/").pop()?.replace(".mdx", "") || "";

    const generatedSlug =
      node.frontmatter.slug ||
      node.frontmatter.title
        ?.toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") ||
      getFilenameFromPath(node.internal.contentFilePath).toLowerCase();

    return {
      id: node.id,
      title: node.frontmatter.title,
      slug: generatedSlug,
      excerpt: node.frontmatter.excerpt,
      date: node.frontmatter.date,
      category: node.frontmatter.category,
      tags: node.frontmatter.tags || [],
      author: node.frontmatter.author,
    };
  });

  // Get unique categories and tags
  const categories = useMemo(
    () =>
      Array.from(
        new Set(notes.map((note) => note.category).filter(Boolean)),
      ).sort(),
    [notes],
  );

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    notes.forEach((note) => {
      if (note.tags) {
        note.tags.forEach((tag) => tagSet.add(tag));
      }
    });
    return Array.from(tagSet).sort();
  }, [notes]);

  // Filter notes based on search and filters
  const filteredNotes = useMemo(
    () =>
      notes.filter((note) => {
        // Search filter - check title, excerpt, and tags
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch =
          searchQuery === "" ||
          note.title.toLowerCase().includes(searchLower) ||
          (note.excerpt && note.excerpt.toLowerCase().includes(searchLower)) ||
          (note.tags &&
            note.tags.some((tag) => tag.toLowerCase().includes(searchLower)));

        // Category filter
        const matchesCategory =
          selectedCategory === "" || note.category === selectedCategory;

        // Tag filter
        const matchesTags =
          selectedTags.length === 0 ||
          (note.tags && selectedTags.every((tag) => note.tags!.includes(tag)));

        return matchesSearch && matchesCategory && matchesTags;
      }),
    [notes, searchQuery, selectedCategory, selectedTags],
  );

  // Pagination
  const totalPages = Math.ceil(filteredNotes.length / NOTES_PER_PAGE);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedTags]);

  const paginatedNotes = useMemo(() => {
    const startIndex = (currentPage - 1) * NOTES_PER_PAGE;
    const endIndex = startIndex + NOTES_PER_PAGE;
    return filteredNotes.slice(startIndex, endIndex);
  }, [filteredNotes, currentPage]);

  const handleTagSelect = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  return (
    <Layout
      title="Notes"
      description="Personal notes, jottings, and quick thoughts on various topics."
    >
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-6xl">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
              📓 Personal Notes & Jottings
            </h1>
            <p className="text-lg text-muted-foreground">
              A collection of quick notes, thoughts, and scratchpad entries on
              various topics.
            </p>
          </div>

          {/* Filters Section */}
          <div className="mb-8 space-y-4">
            {/* Search */}
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search notes by title, content, or tags..."
            />

            {/* Category and Tag Filters */}
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="md:w-1/3">
                <CategoryFilter
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onChange={setSelectedCategory}
                />
              </div>

              <div className="md:w-2/3">
                <TagFilter
                  availableTags={allTags}
                  selectedTags={selectedTags}
                  onTagToggle={handleTagSelect}
                  onClearTags={() => setSelectedTags([])}
                />
              </div>
            </div>

            {/* Active Filters Display */}
            {(selectedCategory || selectedTags.length > 0) && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Active filters:
                </span>
                {selectedCategory && (
                  <Badge
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => setSelectedCategory("")}
                  >
                    {selectedCategory} ✕
                  </Badge>
                )}
                {selectedTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => handleTagSelect(tag)}
                  >
                    #{tag} ✕
                  </Badge>
                ))}
                <button
                  type="button"
                  className="text-sm text-foreground hover:underline"
                  onClick={() => {
                    setSelectedCategory("");
                    setSelectedTags([]);
                  }}
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">
              Showing {paginatedNotes.length} of {filteredNotes.length} notes
            </p>
          </div>

          {/* Notes Grid */}
          <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {paginatedNotes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>

          {/* No Results Message */}
          {filteredNotes.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-lg text-muted-foreground">
                No notes found matching your criteria.
              </p>
              <button
                type="button"
                className="mt-4 text-foreground hover:underline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("");
                  setSelectedTags([]);
                }}
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default NotesPage;

export const query = graphql`
  query {
    allMdx(
      filter: { internal: { contentFilePath: { regex: "/content/notes/" } } }
      sort: { frontmatter: { date: DESC } }
    ) {
      nodes {
        id
        frontmatter {
          title
          slug
          excerpt
          date
          category
          tags
          author
        }
        internal {
          contentFilePath
        }
      }
    }
  }
`;

export const Head: HeadFC = () => (
  <>
    <title>Personal Notes - Sai Nimmagadda</title>
    <meta
      name="description"
      content="Personal notes, jottings, and quick thoughts on various topics."
    />
  </>
);
