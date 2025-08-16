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
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-5xl font-bold mb-4">Articles</h1>

          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((category) => {
              const active = currentCategories.includes(category.fieldValue);

              return (
                <button
                  key={category.fieldValue}
                  type="button"
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                  onClick={() => handleCategoryClick(category.fieldValue)}
                  onKeyDown={(event) =>
                    handleKeyDown(event, category.fieldValue)
                  }
                >
                  {category.fieldValue}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-4 mb-6">
            <input
              className="flex-1 px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              type="text"
              name="searchTerm"
              value={searchTerm}
              placeholder="Type here to filter posts..."
              onChange={handleChange}
            />
            <div className="px-3 py-2 bg-muted rounded-md font-medium">
              {filterCount}
            </div>
          </div>

          <PostListing postEdges={filteredPosts} expanded />
        </div>
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
