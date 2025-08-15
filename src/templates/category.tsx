import React, { useState } from "react";
import Helmet from "react-helmet";
import { graphql } from "gatsby";
import Layout from "../layout";
import PostListing from "../components/PostListing/PostListing";
import DynamicBreadcrumb from "../components/Breadcrumb/Breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
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
  const [viewMode, setViewMode] = useState<'cards' | 'simple'>('cards');

  // Create breadcrumb items
  const breadcrumbItems = [
    { label: "Blog", href: "/blog" },
    { label: `Category: ${category}` }
  ];

  // Get unique tags from all posts in this category
  const allTags = Array.from(
    new Set(
      postEdges.flatMap(edge => edge.node.frontmatter.tags || [])
    )
  ).sort();

  return (
    <Layout>
      <div className="category-container">
        <Helmet
          title={`Posts in category "${category}" | ${config.siteTitle}`}
        />
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Breadcrumb Navigation */}
          <DynamicBreadcrumb items={breadcrumbItems} className="mb-6" />
          
          {/* Category Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  <Badge variant="outline" className="mr-3 text-sm">
                    Category
                  </Badge>
                  {category}
                </h1>
                <p className="text-lg text-muted-foreground">
                  {data.allMarkdownRemark.totalCount} post{data.allMarkdownRemark.totalCount !== 1 ? 's' : ''} in this category
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'cards' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('cards')}
                >
                  Cards
                </Button>
                <Button
                  variant={viewMode === 'simple' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('simple')}
                >
                  List
                </Button>
              </div>
            </div>

            {/* Category Stats */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <CardTitle className="text-sm font-medium text-muted-foreground mb-1">
                      TOTAL POSTS
                    </CardTitle>
                    <div className="text-2xl font-bold">{data.allMarkdownRemark.totalCount}</div>
                  </div>
                  
                  <div>
                    <CardTitle className="text-sm font-medium text-muted-foreground mb-1">
                      RELATED TAGS
                    </CardTitle>
                    <div className="text-2xl font-bold">{allTags.length}</div>
                  </div>
                  
                  <div>
                    <CardTitle className="text-sm font-medium text-muted-foreground mb-1">
                      READING TIME
                    </CardTitle>
                    <div className="text-2xl font-bold">
                      {Math.round(postEdges.reduce((total, edge) => total + edge.node.timeToRead, 0))} min
                    </div>
                  </div>
                </div>
                
                {/* Related Tags */}
                {allTags.length > 0 && (
                  <div className="mt-6 pt-6 border-t">
                    <CardTitle className="text-sm font-medium text-muted-foreground mb-3">
                      RELATED TAGS
                    </CardTitle>
                    <div className="flex flex-wrap gap-2">
                      {allTags.slice(0, 12).map((tag) => (
                        <Badge key={tag} variant="secondary" className="hover:bg-primary/20 transition-colors">
                          <a href={`/tags/${tag.toLowerCase()}`} className="text-inherit no-underline">
                            {tag}
                          </a>
                        </Badge>
                      ))}
                      {allTags.length > 12 && (
                        <Badge variant="outline">
                          +{allTags.length - 12} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Posts Listing */}
          <PostListing 
            postEdges={postEdges} 
            simple={viewMode === 'simple'}
            expanded={viewMode === 'cards'}
            showExcerpt={viewMode === 'cards'}
            showTags={viewMode === 'cards'}
            showReadingTime={true}
          />
        </div>
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
