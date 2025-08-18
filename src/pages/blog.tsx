import React, { useState, useEffect } from "react";
import Helmet from "react-helmet";
import { graphql } from "gatsby";
import Layout from "../layout";
import PostListing from "../components/PostListing/PostListing";
import SEO from "../components/SEO/SEO";
import { Badge } from "../components/ui/badge";
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
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">Articles</h1>
        
        {/* Category Filter Badges */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => {
            const active = currentCategories.includes(category.fieldValue);

            return (
              <Badge
                key={category.fieldValue}
                variant={active ? "default" : "outline"}
                className={`cursor-pointer transition-colors ${
                  active 
                    ? "bg-blue-500 hover:bg-blue-600 text-white border-blue-500" 
                    : "hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 dark:hover:bg-blue-900 dark:hover:border-blue-800"
                }`}
                role="button"
                tabIndex={0}
                onClick={() => handleCategoryClick(category.fieldValue)}
                onKeyDown={(event) => handleKeyDown(event, category.fieldValue)}
              >
                {category.fieldValue}
              </Badge>
            );
          })}
        </div>

        {/* Search Bar with Count */}
        <div className="relative mb-8">
          <div className="flex items-center gap-4">
            <input
              className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              type="text"
              name="searchTerm"
              value={searchTerm}
              placeholder="Type here to filter posts..."
              onChange={handleChange}
            />
            <div className="text-2xl font-bold text-blue-500 min-w-[2ch]">
              {filterCount}
            </div>
          </div>
        </div>

        {/* Articles List */}
        <PostListing postEdges={filteredPosts} simple={true} />
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
