import React from "react";
import { Link } from "gatsby";

interface Article {
  id: string;
  title: string;
  slug: string;
  date: string;
  contentType?: string;
}

interface ArticleListProps {
  title: string;
  subtitle: string;
  articles: Article[];
  viewAllLink: string;
  viewAllText?: string;
}

export function ArticleList({
  title,
  subtitle,
  articles,
  viewAllLink,
  viewAllText = "See All",
}: ArticleListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="flex-1">
      <div className="flex items-baseline justify-between mb-2">
        <h2 className="text-3xl font-bold">{title}</h2>
        <Link
          to={viewAllLink}
          className="text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          {viewAllText}
        </Link>
      </div>

      <p className="text-muted-foreground mb-8">{subtitle}</p>

      <div className="space-y-0">
        {articles.slice(0, 6).map((article, index) => (
          <article key={article.id} className="group -mx-3">
            <Link
              to={`/articles/${article.slug}`}
              className="block px-3 py-4 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <h3 className="font-medium text-lg leading-snug text-primary group-hover:text-primary/80 transition-colors line-clamp-2">
                {article.title}
              </h3>
              <time className="text-sm text-muted-foreground">
                {formatDate(article.date)}
              </time>
            </Link>
            {index < articles.slice(0, 6).length - 1 && (
              <div className="border-b border-border mx-3" />
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
