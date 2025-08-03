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
    <div className={`posts ${expanded ? "expanded" : ""}`}>
      {postList.map((post) => {
        let thumbnail;
        if (post.thumbnail && post.thumbnail.childImageSharp) {
          thumbnail = getImage(post.thumbnail.childImageSharp.gatsbyImageData);
        }

        return (
          <Link to={post.path} key={post.title}>
            <div className="post-info">
              <div className="icon">
                {thumbnail ? <GatsbyImage image={thumbnail} alt="" /> : <div />}
              </div>
              <div className="post-line">
                <h2>{post.title}</h2>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default PostListing;
