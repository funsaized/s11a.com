import React, { useMemo } from "react";
import { GatsbyImage, getImage } from "gatsby-plugin-image";
import { Link } from "gatsby";

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

function PostListing({
  postEdges,
  expanded,
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

  return (
    <div className="space-y-6">
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
            <div className="flex items-center gap-6">
              <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center">
                {thumbnail ? (
                  <GatsbyImage 
                    image={thumbnail} 
                    alt="" 
                    className="w-16 h-16 object-cover rounded"
                  />
                ) : (
                  <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                    <span className="text-muted-foreground text-lg">📄</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-medium text-foreground hover:text-primary transition-colors leading-snug">
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

export default PostListing;
