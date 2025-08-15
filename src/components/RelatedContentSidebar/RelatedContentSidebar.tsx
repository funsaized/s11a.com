import React, { useMemo } from "react";
import { 
  Sparkles,
  Clock,
  TrendingUp,
  Archive,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useStaticQuery, graphql, navigate } from "gatsby";

interface RelatedContentSidebarProps {
  currentPost?: {
    slug: string;
    tags: string[];
    category?: string;
  };
  className?: string;
}

export function RelatedContentSidebar({ 
  currentPost,
  className 
}: RelatedContentSidebarProps): React.ReactElement {
  const data = useStaticQuery(graphql`
    query RelatedContentQuery {
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
            excerpt(pruneLength: 80)
            timeToRead
          }
        }
      }
    }
  `);

  const relatedPosts = useMemo(() => {
    if (!currentPost) return [];

    const allPosts = data.posts.edges
      .map(({ node }: any) => node)
      .filter((post: any) => post.fields.slug !== currentPost.slug);

    // Calculate similarity scores
    const postsWithScores = allPosts.map((post: any) => {
      let score = 0;

      // Category match (high weight)
      if (post.frontmatter.category && post.frontmatter.category === currentPost.category) {
        score += 10;
      }

      // Tag matches (medium weight)
      const commonTags = post.frontmatter.tags?.filter((tag: string) => 
        currentPost.tags.includes(tag)
      ) || [];
      score += commonTags.length * 5;

      // Recency boost (low weight)
      const daysSincePost = Math.floor(
        (Date.now() - new Date(post.fields.date).getTime()) / (1000 * 60 * 60 * 24)
      );
      score += Math.max(0, 30 - daysSincePost) * 0.1;

      return { ...post, score };
    });

    return postsWithScores
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [data, currentPost]);

  const recentPosts = useMemo(() => {
    return data.posts.edges
      .map(({ node }: any) => node)
      .filter((post: any) => post.fields.slug !== currentPost?.slug)
      .slice(0, 5);
  }, [data, currentPost]);

  const trendingTags = useMemo(() => {
    const tagCounts: Record<string, number> = {};
    
    data.posts.edges.forEach(({ node }: any) => {
      node.frontmatter.tags?.forEach((tag: string) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    return Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));
  }, [data]);

  return (
    <aside className={cn("space-y-6", className)}>
      {/* Related Posts */}
      {currentPost && relatedPosts.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Related Posts
          </h3>
          <div className="space-y-3">
            {relatedPosts.map((post: any) => (
              <div
                key={post.fields.slug}
                className="group cursor-pointer"
                onClick={() => navigate(post.fields.slug)}
              >
                <h4 className="font-medium text-sm mb-1 group-hover:text-primary transition-colors line-clamp-2">
                  {post.frontmatter.title}
                </h4>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {post.timeToRead} min read
                  <span>•</span>
                  {new Date(post.fields.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Posts */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          Recent Posts
        </h3>
        <div className="space-y-3">
          {recentPosts.map((post: any) => (
            <div
              key={post.fields.slug}
              className="group cursor-pointer"
              onClick={() => navigate(post.fields.slug)}
            >
              <h4 className="font-medium text-sm mb-1 group-hover:text-primary transition-colors line-clamp-2">
                {post.frontmatter.title}
              </h4>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {post.timeToRead} min read
                <span>•</span>
                {new Date(post.fields.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trending Tags */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Popular Tags
        </h3>
        <div className="flex flex-wrap gap-2">
          {trendingTags.map(({ tag, count }) => (
            <Badge
              key={tag}
              variant="secondary"
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={() => navigate(`/tags/${tag.toLowerCase().replace(/\s+/g, '-')}`)}
            >
              {tag} {count}
            </Badge>
          ))}
        </div>
      </div>

      {/* Archive Link */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Archive className="h-4 w-4 text-primary" />
          Archive
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/blog')}
          className="w-full justify-between"
        >
          View All Posts
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </aside>
  );
}

export default RelatedContentSidebar;