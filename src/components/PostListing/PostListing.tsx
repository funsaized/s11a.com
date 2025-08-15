import React, { useMemo } from "react";
import { GatsbyImage, getImage } from "gatsby-plugin-image";
import { Link } from "gatsby";
import { cn } from "../../lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { EnhancedPostListingProps, PostEdge } from "../../models";
import { formatReadingTime, formatRelativeDate } from "../../services/relatedPostsUtils";

interface Post {
  path: string;
  tags: string[];
  cover: string;
  title: string;
  thumbnail?: any;
  date: string;
  excerpt: string;
  timeToRead: number;
  isdev: boolean;
}

function PostListing({
  postEdges,
  expanded = false,
  simple = false,
  showExcerpt = true,
  showTags = true,
  showReadingTime = true,
  className,
}: EnhancedPostListingProps): React.ReactElement {
  const postList: Post[] = useMemo(
    () =>
      postEdges.map((postEdge) => ({
        path: postEdge.node.fields.slug,
        tags: postEdge.node.frontmatter.tags,
        cover: postEdge.node.frontmatter.cover,
        title: postEdge.node.frontmatter.title,
        thumbnail: postEdge.node.frontmatter.thumbnail,
        date: postEdge.node.fields.date,
        excerpt: postEdge.node.excerpt,
        timeToRead: postEdge.node.timeToRead,
        isdev: postEdge.node.frontmatter.isdev,
      })),
    [postEdges],
  );

  if (simple) {
    // Simple layout for minimal display
    return (
      <div className={cn("space-y-4", className)}>
        {postList.map((post) => {
          let thumbnail;
          if (post.thumbnail && post.thumbnail.childImageSharp) {
            thumbnail = getImage(post.thumbnail.childImageSharp.gatsbyImageData);
          }

          return (
            <Link
              to={post.path}
              key={post.title}
              className="block hover:opacity-80 transition-opacity"
            >
              <div className="flex items-center gap-4 md:gap-6">
                <div className="flex-shrink-0 w-12 h-12 md:w-16 md:h-16 flex items-center justify-center">
                  {thumbnail ? (
                    <GatsbyImage
                      image={thumbnail}
                      alt=""
                      className="w-12 h-12 md:w-16 md:h-16 object-cover rounded-md"
                    />
                  ) : (
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-muted rounded-md flex items-center justify-center">
                      <span className="text-muted-foreground text-base md:text-lg">
                        📄
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm md:text-base font-medium text-foreground hover:text-primary hover:underline transition-all leading-snug line-clamp-2">
                    {post.title}
                  </h2>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    );
  }

  // Enhanced card layout with metadata
  return (
    <div className={cn("space-y-6", className)}>
      {postList.map((post) => {
        let thumbnail;
        if (post.thumbnail && post.thumbnail.childImageSharp) {
          thumbnail = getImage(post.thumbnail.childImageSharp.gatsbyImageData);
        }

        return (
          <Link
            to={post.path}
            key={post.title}
            className="block transition-transform hover:scale-[1.01]"
          >
            <Card className="hover:shadow-lg transition-shadow">
              <div className={cn(
                "flex gap-6 p-6",
                expanded ? "flex-col sm:flex-row" : "flex-row"
              )}>
                <div className="flex-shrink-0">
                  {thumbnail ? (
                    <GatsbyImage
                      image={thumbnail}
                      alt=""
                      className={cn(
                        "object-cover rounded-lg",
                        expanded ? "w-full h-48 sm:w-32 sm:h-32" : "w-20 h-20"
                      )}
                    />
                  ) : (
                    <div className={cn(
                      "bg-muted rounded-lg flex items-center justify-center",
                      expanded ? "w-full h-48 sm:w-32 sm:h-32" : "w-20 h-20"
                    )}>
                      <span className="text-muted-foreground text-2xl">📄</span>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0 space-y-3">
                  <CardHeader className="p-0 space-y-2">
                    <CardTitle className="text-xl font-bold hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </CardTitle>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{formatRelativeDate(post.date)}</span>
                      {showReadingTime && (
                        <>
                          <span>•</span>
                          <span>{formatReadingTime(post.timeToRead)}</span>
                        </>
                      )}
                    </div>
                  </CardHeader>
                  
                  {showExcerpt && (
                    <CardContent className="p-0">
                      <CardDescription className={cn(
                        "text-sm",
                        expanded ? "line-clamp-4" : "line-clamp-2"
                      )}>
                        {post.excerpt}
                      </CardDescription>
                    </CardContent>
                  )}
                  
                  {showTags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {post.tags.slice(0, expanded ? 8 : 4).map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs hover:bg-primary/20 transition-colors"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {post.tags.length > (expanded ? 8 : 4) && (
                        <Badge variant="outline" className="text-xs">
                          +{post.tags.length - (expanded ? 8 : 4)} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}

export default PostListing;
