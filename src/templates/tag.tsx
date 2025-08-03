import React from "react";
import Helmet from "react-helmet";
import { graphql } from "gatsby";
import Layout from "../layout";
import PostListing from "../components/PostListing/PostListing";
import config from "../../data/SiteConfig";

interface TagTemplateProps {
  pageContext: {
    tag: string;
  };
  data: {
    allMarkdownRemark: {
      totalCount: number;
      edges: Array<{
        node: {
          fields: {
            slug: string;
            date: string;
          };
          excerpt: string;
          timeToRead: number;
          frontmatter: {
            title: string;
            tags: string[];
            cover?: string;
            date: string;
            thumbnail?: {
              childImageSharp: {
                gatsbyImageData: any;
              };
            };
          };
        };
      }>;
    };
  };
}

function TagTemplate({
  pageContext,
  data,
}: TagTemplateProps): React.ReactElement {
  const { tag } = pageContext;
  const postEdges = data.allMarkdownRemark.edges;

  return (
    <Layout>
      <div className="tag-container container">
        <h2>Posts with matching tag:</h2>
        <Helmet title={`Posts tagged as "${tag}" | ${config.siteTitle}`} />
        <PostListing postEdges={postEdges} />
      </div>
    </Layout>
  );
}

export default TagTemplate;

/* eslint no-undef: "off" */
export const pageQuery = graphql`
  query TagPage($tag: String) {
    allMarkdownRemark(
      limit: 1000
      sort: { fields: { date: DESC } }
      filter: { frontmatter: { tags: { in: [$tag] } } }
    ) {
      totalCount
      edges {
        node {
          fields {
            slug
            date
          }
          excerpt
          timeToRead
          frontmatter {
            title
            tags
            cover
            date
            thumbnail {
              childImageSharp {
                gatsbyImageData(layout: FIXED, width: 50, height: 50)
              }
            }
          }
        }
      }
    }
  }
`;
