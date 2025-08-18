import React, { useMemo } from "react";
import { GatsbyImage, getImage } from "gatsby-plugin-image";
import { Link } from "gatsby";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  Settings, 
  Code, 
  Database, 
  Server, 
  Zap, 
  GitBranch, 
  Layers, 
  Truck, 
  Gauge,
  HardDrive,
  Cloud,
  Palette,
  Workflow,
  Monitor
} from "lucide-react";

interface PostEdge {
  node: {
    fields: {
      slug: string;
      date: string;
    };
    frontmatter: {
      tags: string[];
      cover: string;
      title: string;
      thumbnail?: {
        childImageSharp: {
          gatsbyImageData: any;
        };
      };
      isdev: boolean;
    };
    excerpt: string;
    timeToRead: number;
  };
}

interface PostListingProps {
  postEdges: PostEdge[];
  expanded?: boolean;
  simple?: boolean;
}

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

// Function to get appropriate icon and color for each article
function getArticleIcon(title: string, tags: string[] = []) {
  const titleLower = title.toLowerCase();
  const allTags = tags.map(tag => tag.toLowerCase()).join(' ');
  const searchText = `${titleLower} ${allTags}`;

  // Node.js / JavaScript
  if (searchText.includes('node') || searchText.includes('javascript') || searchText.includes('js')) {
    return { Icon: Settings, color: 'text-green-600', bgColor: 'bg-green-100' };
  }
  
  // VSCode / Development Tools
  if (searchText.includes('vscode') || searchText.includes('visual studio') || searchText.includes('operator') || searchText.includes('mono')) {
    return { Icon: Monitor, color: 'text-blue-600', bgColor: 'bg-blue-100' };
  }
  
  // Azure / Cloud / Database
  if (searchText.includes('azure') || searchText.includes('cosmos') || searchText.includes('db') || searchText.includes('database')) {
    return { Icon: Database, color: 'text-blue-500', bgColor: 'bg-blue-100' };
  }
  
  // Kubernetes / OpenShift / Cloud Infrastructure
  if (searchText.includes('kubernetes') || searchText.includes('openshift') || searchText.includes('cloud') || searchText.includes('nginx')) {
    return { Icon: Cloud, color: 'text-indigo-600', bgColor: 'bg-indigo-100' };
  }
  
  // Java / Spring / Batch Processing
  if (searchText.includes('java') || searchText.includes('spring') || searchText.includes('batch') || searchText.includes('pipeline') || searchText.includes('job')) {
    return { Icon: Settings, color: 'text-orange-600', bgColor: 'bg-orange-100' };
  }
  
  // AWS / Lambda / Serverless
  if (searchText.includes('aws') || searchText.includes('lambda') || searchText.includes('serverless') || searchText.includes('garlic')) {
    return { Icon: Zap, color: 'text-orange-500', bgColor: 'bg-orange-100' };
  }
  
  // GitHub / Git / Version Control
  if (searchText.includes('github') || searchText.includes('git') || searchText.includes('bot')) {
    return { Icon: GitBranch, color: 'text-gray-800', bgColor: 'bg-gray-100' };
  }
  
  // CSS / Frontend / Design
  if (searchText.includes('css') || searchText.includes('responsive') || searchText.includes('grid') || searchText.includes('flexbox') || searchText.includes('frontend')) {
    return { Icon: Palette, color: 'text-pink-600', bgColor: 'bg-pink-100' };
  }
  
  // ETL / Data Pipeline / Luigi
  if (searchText.includes('luigi') || searchText.includes('etl') || searchText.includes('data') || searchText.includes('workflow')) {
    return { Icon: Workflow, color: 'text-purple-600', bgColor: 'bg-purple-100' };
  }
  
  // Spring Framework
  if (searchText.includes('spring') || searchText.includes('quickstart')) {
    return { Icon: Layers, color: 'text-green-600', bgColor: 'bg-green-100' };
  }
  
  // Development / Deployment / Tools
  if (searchText.includes('development') || searchText.includes('dropdown') || searchText.includes('downshift')) {
    return { Icon: Truck, color: 'text-red-600', bgColor: 'bg-red-100' };
  }
  
  // API / Testing / Scripts
  if (searchText.includes('postman') || searchText.includes('script') || searchText.includes('api')) {
    return { Icon: Gauge, color: 'text-orange-600', bgColor: 'bg-orange-100' };
  }
  
  // Server / Infrastructure
  if (searchText.includes('server') || searchText.includes('persistent') || searchText.includes('volumes')) {
    return { Icon: Server, color: 'text-slate-600', bgColor: 'bg-slate-100' };
  }
  
  // General Components / Forms
  if (searchText.includes('discord') || searchText.includes('login') || searchText.includes('form') || searchText.includes('component')) {
    return { Icon: HardDrive, color: 'text-orange-500', bgColor: 'bg-orange-100' };
  }
  
  // Default icon for general code/programming content
  return { Icon: Code, color: 'text-gray-600', bgColor: 'bg-gray-100' };
}

function PostListing({
  postEdges,
  expanded,
  simple = false,
}: PostListingProps): React.ReactElement {
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

  // Simple list view for home page
  if (simple) {
    return (
      <div className="space-y-3">
        {postList.map((post) => {
          const { Icon, color, bgColor } = getArticleIcon(post.title, post.tags);
          
          return (
            <Link 
              to={post.path} 
              key={post.title} 
              className="flex items-center gap-4 p-2 -mx-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
            >
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                bgColor
              )}>
                <Icon className={cn("w-5 h-5", color)} />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {post.title}
                </h3>
              </div>
            </Link>
          );
        })}
      </div>
    );
  }

  // Card view for other pages
  return (
    <div className={cn("grid gap-4", expanded ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3")}>
      {postList.map((post) => {
        let thumbnail;
        if (post.thumbnail && post.thumbnail.childImageSharp) {
          thumbnail = getImage(post.thumbnail.childImageSharp.gatsbyImageData);
        }

        return (
          <Link to={post.path} key={post.title} className="block">
            <Card className="h-full hover:shadow-lg transition-shadow duration-200 group">
              {thumbnail && (
                <div className="relative w-full h-48 overflow-hidden rounded-t-xl">
                  <GatsbyImage 
                    image={thumbnail} 
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
              )}
              
              <CardHeader className="space-y-2">
                <div className="flex items-start gap-3">
                  {!thumbnail && (
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <div className="w-6 h-6 rounded bg-primary/20" />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                      {post.title}
                    </CardTitle>
                  </div>
                </div>
                
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {post.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {post.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{post.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </CardHeader>

              {expanded && post.excerpt && (
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <span>{post.timeToRead} min read</span>
                    <span>•</span>
                    <time dateTime={post.date}>
                      {new Date(post.date).toLocaleDateString()}
                    </time>
                  </div>
                </CardContent>
              )}
            </Card>
          </Link>
        );
      })}
    </div>
  );
}

export default PostListing;
