import React from "react";
import { Link } from "gatsby";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { categoryIcons } from "../../data/sampleData";
import type { Article } from "../../data/sampleData";

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
    <Card className="group transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
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
      <CardContent>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
          {article.excerpt}
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

        <div className="flex items-center justify-between">
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

interface RecentArticlesProps {
  articles: Article[];
}

export function RecentArticles({ articles }: RecentArticlesProps) {
  return (
    <section className="py-12 md:py-18 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          {/* Section Header */}
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
              Recent Articles
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Insights on healthcare technology, scalable systems, and developer
              experience. From FHIR implementations and AI to rapid prototyping
              and UX.
            </p>
          </div>

          {/* Articles Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 mb-12">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>

          {/* View All Button */}
          <div className="text-center">
            <Button asChild size="lg" variant="outline">
              <Link to="/articles" className="inline-flex items-center gap-2">
                View All Articles
                <ArrowRightIcon />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
