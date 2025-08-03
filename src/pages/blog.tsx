import React, { useState, useEffect } from "react";
import Helmet from "react-helmet";
import { graphql } from "gatsby";
import Layout from "../layout";
import PostListing from "../components/PostListing/PostListing";
import SEO from "../components/SEO/SEO";
import config from "../../data/SiteConfig";

interface BlogPageProps {
  data: {
    posts: {
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
            categories?: string[];
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
    categories: {
      group: Array<{
        fieldValue: string;
        totalCount: number;
      }>;
    };
  };
}

function BlogPage({ data }: BlogPageProps): React.ReactElement {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentCategories, setCurrentCategories] = useState<string[]>([]);
  const [posts] = useState(data.posts.edges);
  const [filteredPosts, setFilteredPosts] = useState(data.posts.edges);

  const categories = data.categories.group;
  const filterCount = filteredPosts.length;

  const filterPosts = () => {
    let filtered = posts.filter((post) =>
      post.node.frontmatter.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
    );

    if (currentCategories.length > 0) {
      filtered = filtered.filter(
        (post) =>
          post.node.frontmatter.categories &&
          currentCategories.every((cat) =>
            post.node.frontmatter.categories!.includes(cat),
          ),
      );
    }

    setFilteredPosts(filtered);
  };

  useEffect(() => {
    filterPosts();
  }, [searchTerm, currentCategories]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const updateCategories = (category: string) => {
    if (!currentCategories.includes(category)) {
      setCurrentCategories([...currentCategories, category]);
    } else {
      setCurrentCategories(currentCategories.filter((cat) => category !== cat));
    }
  };

  const handleCategoryClick = (categoryValue: string) => {
    updateCategories(categoryValue);
  };

  const handleKeyDown = (event: React.KeyboardEvent, categoryValue: string) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleCategoryClick(categoryValue);
    }
  };

  return (
    <Layout>
      <Helmet title={`Articles – ${config.siteTitle}`} />
      <SEO />
      <div className="container">
        <h1>Articles</h1>
        <div className="category-container">
          {categories.map((category) => {
            const active = currentCategories.includes(category.fieldValue);

            return (
              <div
                className={`category-filter ${active ? "active" : ""}`}
                key={category.fieldValue}
                role="button"
                tabIndex={0}
                onClick={() => handleCategoryClick(category.fieldValue)}
                onKeyDown={(event) => handleKeyDown(event, category.fieldValue)}
              >
                {category.fieldValue}
              </div>
            );
          })}
        </div>
        <div className="search-container">
          <input
            className="search"
            type="text"
            name="searchTerm"
            value={searchTerm}
            placeholder="Type here to filter posts..."
            onChange={handleChange}
          />
          <div className="filter-count">{filterCount}</div>
        </div>
        <PostListing postEdges={filteredPosts} expanded />
      </div>
    </Layout>
  );
}

export default BlogPage;

export const pageQuery = graphql`
  query BlogQuery {
    posts: allMarkdownRemark(
      limit: 2000
      sort: { fields: { date: DESC } }
      filter: { frontmatter: { type: { eq: "post" } } }
    ) {
      edges {
        node {
          fields {
            slug
            date
          }
          excerpt(pruneLength: 180)
          timeToRead
          frontmatter {
            title
            tags
            categories
            thumbnail {
              childImageSharp {
                gatsbyImageData(layout: FIXED, width: 70, height: 70)
              }
            }
            date
          }
        }
      }
    }
    categories: allMarkdownRemark(limit: 2000) {
      group(field: { frontmatter: { categories: SELECT } }) {
        fieldValue
        totalCount
      }
    }
  }
`;
