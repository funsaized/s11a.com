import React, { useMemo } from "react";
import { Link } from "gatsby";
import { GatsbyImage, getImage } from "gatsby-plugin-image";
import { cn } from "../../lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { RelatedPostsProps } from "../../models";
import {
  findRelatedPosts,
  formatReadingTime,
  formatRelativeDate,
} from "../../services/relatedPostsUtils";

function RelatedPosts({
  currentPost,
  allPosts,
  limit = 4,
  className,
}: RelatedPostsProps): React.ReactElement | null {
  const relatedPosts = useMemo(() => findRelatedPosts(currentPost, allPosts, limit), [currentPost, allPosts, limit]);

  if (relatedPosts.length === 0) {
    return null;
  }

  return (
    <section className={cn("space-y-6", className)}>
      <div>
        <h2 className="text-2xl font-bold mb-2">Related Posts</h2>
        <p className="text-muted-foreground">
          Discover more content you might find interesting
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {relatedPosts.map((post) => {
          const thumbnail = post.thumbnail ? getImage(post.thumbnail) : null;

          return (
            <Link
              key={post.slug}
              to={post.slug}
              className="block transition-transform hover:scale-[1.02]"
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <div className="flex gap-4 p-4">
                  <div className="flex-shrink-0">
                    {thumbnail ? (
                      <GatsbyImage
                        image={thumbnail}
                        alt=""
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                        <span className="text-muted-foreground text-lg">
                          📄
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <CardHeader className="p-0 space-y-1">
                      <CardTitle className="text-sm font-semibold line-clamp-2 hover:text-primary transition-colors">
                        {post.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatRelativeDate(post.date)}</span>
                        <span>•</span>
                        <span>{formatReadingTime(post.timeToRead)}</span>
                        {post.similarity > 0 && (
                          <>
                            <span>•</span>
                            <Badge
                              variant="secondary"
                              className="h-4 px-1 text-xs"
                            >
                              {Math.round(post.similarity * 100)}% match
                            </Badge>
                          </>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="p-0 mt-2">
                      <CardDescription className="text-xs line-clamp-2">
                        {post.excerpt}
                      </CardDescription>

                      {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {post.tags.slice(0, 2).map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="h-4 px-1 text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {post.tags.length > 2 && (
                            <Badge
                              variant="outline"
                              className="h-4 px-1 text-xs"
                            >
                              +{post.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default RelatedPosts;
