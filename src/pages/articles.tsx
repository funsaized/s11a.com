import React, { useState, useMemo } from "react";
import type { HeadFC, PageProps } from "gatsby";
import { graphql } from "gatsby";
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
import { categoryIcons, type Article } from "../data/sampleData";
import { Link } from "gatsby";

const ARTICLES_PER_PAGE = 6;

const ClockIcon = () => (
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
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
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

function ArticleCard({ article }: { article: Article }) {
  const categoryIcon = categoryIcons[article.category] || "📝";

  return (
    <Card className="group transition-all duration-200 hover:shadow-lg hover:-translate-y-1 h-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">{categoryIcon}</span>
            <Badge variant="secondary" className="text-xs">
              {article.category}
            </Badge>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <ClockIcon />
            <span>{article.readingTime}</span>
          </div>
        </div>
        <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
          <Link to={`/articles/${article.slug}`} className="block">
            {article.title}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <p className="text-muted-foreground text-sm mb-4 line-clamp-3 flex-1">
          {article.excerpt || article.title}
        </p>

        <div className="flex flex-wrap gap-1 mb-4">
          {article.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {article.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{article.tags.length - 3}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between mt-auto">
          <time className="text-xs text-muted-foreground">
            {new Date(article.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </time>

          <Link
            to={`/articles/${article.slug}`}
            className="inline-flex items-center gap-1 text-sm text-primary hover:gap-2 transition-all"
          >
            Read more
            <ArrowRightIcon />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

interface ArticleNode {
  id: string;
  frontmatter: {
    title: string;
    slug: string;
    excerpt: string;
    date: string;
    category: string;
    tags: string[];
    readingTime: string;
    featured: boolean;
  };
}

interface ArticlesPageData {
  allMdx: {
    nodes: ArticleNode[];
  };
}

const ArticlesPage: React.FC<PageProps<ArticlesPageData>> = ({ data }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Transform GraphQL data to Article format
  const articles: Article[] = data.allMdx.nodes.map((node) => ({
    id: node.id,
    title: node.frontmatter.title,
    slug: node.frontmatter.slug,
    excerpt: node.frontmatter.excerpt || "",
    date: node.frontmatter.date,
    category: node.frontmatter.category,
    tags: node.frontmatter.tags || [],
    readingTime: node.frontmatter.readingTime,
    featured: node.frontmatter.featured || false,
    author: "Sai Nimmagadda",
  }));

  // Get unique categories and tags
  const categories = useMemo(() => {
    return Array.from(
      new Set(articles.map((article) => article.category)),
    ).sort();
  }, [articles]);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    articles.forEach((article) => {
      article.tags.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [articles]);

  // Filter articles based on search and filters
  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      // Search filter - check title, excerpt, and tags
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        searchQuery === "" ||
        article.title.toLowerCase().includes(searchLower) ||
        article.excerpt.toLowerCase().includes(searchLower) ||
        article.tags.some((tag) => tag.toLowerCase().includes(searchLower));

      // Category filter
      const matchesCategory =
        selectedCategory === "" || article.category === selectedCategory;

      // Tag filter
      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.every((tag) => article.tags.includes(tag));

      return matchesSearch && matchesCategory && matchesTags;
    });
  }, [articles, searchQuery, selectedCategory, selectedTags]);

  // Pagination
  const totalPages = Math.ceil(filteredArticles.length / ARTICLES_PER_PAGE);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedTags]);

  const paginatedArticles = useMemo(() => {
    const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
    const endIndex = startIndex + ARTICLES_PER_PAGE;
    return filteredArticles.slice(startIndex, endIndex);
  }, [filteredArticles, currentPage]);

  const handleTagSelect = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  return (
    <Layout
      title="Articles"
      description="Technical articles on healthcare technology, system architecture, and developer experience."
    >
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-6xl">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
              <span className="text-sm italic text-accent">(mostly)</span>{" "}
              Technical Articles
            </h1>
            <p className="text-lg text-muted-foreground">
              Deep dives into healthcare technology, scalable systems, and
              modern development practices.
            </p>
          </div>

          {/* Filters Section */}
          <div className="mb-8 space-y-4">
            {/* Search */}
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search articles by title, content, or tags..."
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
                    {tag} ✕
                  </Badge>
                ))}
                <button
                  className="text-sm text-primary hover:underline"
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
              Showing {paginatedArticles.length} of {filteredArticles.length}{" "}
              articles
            </p>
          </div>

          {/* Articles Grid */}
          <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {paginatedArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>

          {/* No Results Message */}
          {filteredArticles.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-lg text-muted-foreground">
                No articles found matching your criteria.
              </p>
              <button
                className="mt-4 text-primary hover:underline"
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

export default ArticlesPage;

export const query = graphql`
  query {
    allMdx(sort: { frontmatter: { date: DESC } }) {
      nodes {
        id
        frontmatter {
          title
          slug
          excerpt
          date
          category
          tags
          readingTime
          featured
        }
      }
    }
  }
`;

export const Head: HeadFC = () => (
  <>
    <title>Technical Articles - Sai Nimmagadda</title>
    <meta
      name="description"
      content="Technical articles on healthcare technology, system architecture, and developer experience."
    />
  </>
);
