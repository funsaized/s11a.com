import React from "react";
import Helmet from "react-helmet";
import { graphql } from "gatsby";
import Layout from "../layout";
import PostListing from "../components/PostListing/PostListing";
import config from "../../data/SiteConfig";

interface CategoryTemplateProps {
  pageContext: {
    category: string;
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
          };
        };
      }>;
    };
  };
}

function CategoryTemplate({
  pageContext,
  data,
}: CategoryTemplateProps): React.ReactElement {
  const { category } = pageContext;
  const { edges: postEdges } = data.allMarkdownRemark;

  return (
    <Layout>
      <div className="category-container">
        <Helmet
          title={`Posts in category "${category}" | ${config.siteTitle}`}
        />
        <PostListing postEdges={postEdges} />
      </div>
    </Layout>
  );
}

export default CategoryTemplate;

/* eslint no-undef: "off" */
export const pageQuery = graphql`
  query CategoryPage($category: String) {
    allMarkdownRemark(
      limit: 1000
      sort: { fields: { date: DESC } }
      filter: { frontmatter: { category: { eq: $category } } }
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
          }
        }
      }
    }
  }
`;
