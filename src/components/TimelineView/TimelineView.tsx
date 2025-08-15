import React, { useMemo } from "react";
import { 
  Calendar,
  Clock
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useStaticQuery, graphql, navigate } from "gatsby";

interface TimelineViewProps {
  className?: string;
}

export function TimelineView({ 
  className 
}: TimelineViewProps): React.ReactElement {
  const data = useStaticQuery(graphql`
    query TimelineQuery {
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
            excerpt(pruneLength: 100)
            timeToRead
          }
        }
      }
    }
  `);

  const postsByYear = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    
    data.posts.edges.forEach(({ node }: any) => {
      const year = new Date(node.fields.date).getFullYear().toString();
      if (!grouped[year]) {
        grouped[year] = [];
      }
      grouped[year].push(node);
    });

    return grouped;
  }, [data]);

  const years = Object.keys(postsByYear).sort((a, b) => parseInt(b) - parseInt(a));

  return (
    <div className={cn("space-y-8", className)}>
      {years.map(year => (
        <div key={year} className="relative">
          {/* Year Header */}
          <div className="sticky top-4 z-10 mb-6">
            <div className="flex items-center gap-3 bg-background/80 backdrop-blur-sm border border-border rounded-full px-4 py-2 w-fit">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="font-semibold text-lg">{year}</span>
              <Badge variant="secondary" className="text-xs">
                {postsByYear[year].length} posts
              </Badge>
            </div>
          </div>

          {/* Posts for Year */}
          <div className="space-y-4 pl-6">
            {postsByYear[year].map((post: any, index: number) => (
              <div
                key={post.fields.slug}
                className="relative group cursor-pointer"
                onClick={() => navigate(post.fields.slug)}
              >
                {/* Timeline Line */}
                <div className="absolute -left-6 top-6 w-px h-full bg-border group-last:hidden" />
                
                {/* Timeline Dot */}
                <div className="absolute -left-8 top-6 w-3 h-3 bg-primary rounded-full border-2 border-background shadow-md" />
                
                {/* Post Card */}
                <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:border-primary/50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base mb-2 group-hover:text-primary transition-colors">
                        {post.frontmatter.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {post.excerpt}
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {post.timeToRead} min read
                        </div>
                        {post.frontmatter.category && (
                          <Badge variant="secondary" className="text-xs">
                            {post.frontmatter.category}
                          </Badge>
                        )}
                        {post.frontmatter.tags?.slice(0, 2).map((tag: string) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {post.frontmatter.tags?.length > 2 && (
                          <span className="text-xs text-muted-foreground">
                            +{post.frontmatter.tags.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(post.fields.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default TimelineView;