import React, { useMemo } from "react";
import { Link } from "gatsby";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PostEdge {
  node: {
    fields: {
      slug: string;
      date: string;
    };
    frontmatter: {
      title: string;
      tags: string[];
    };
    excerpt: string;
    timeToRead: number;
  };
}

interface PostListingProps {
  postEdges: PostEdge[];
}

const PostListingNew = React.memo(
  ({ postEdges }: PostListingProps): React.ReactElement => {
    const postList = useMemo(
      () =>
        postEdges.map((postEdge) => ({
          path: postEdge.node.fields.slug,
          tags: postEdge.node.frontmatter.tags,
          title: postEdge.node.frontmatter.title,
          date: postEdge.node.fields.date,
          excerpt: postEdge.node.excerpt,
          timeToRead: postEdge.node.timeToRead,
        })),
      [postEdges],
    );

    return (
      <div className="space-y-4">
        {postList.map((post) => (
          <Link to={post.path} key={post.title} className="block">
            <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
              <CardHeader>
                <CardTitle className="text-xl">{post.title}</CardTitle>
                <CardDescription>{post.excerpt}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2 text-sm text-muted-foreground">
                  <time dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString()}
                  </time>
                  <span>{post.timeToRead} min read</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {post.tags?.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    );
  },
);

export default PostListingNew;
