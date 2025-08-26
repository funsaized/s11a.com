import React from "react";
import type { HeadFC, PageProps } from "gatsby";
import { graphql } from "gatsby";
import { Layout } from "../components/layout/Layout";
import { Hero } from "../components/home/Hero";
import { ArticleList } from "../components/home/ArticleList";
import { NoteCards } from "../components/home/NoteCards";
import { Projects } from "../components/home/Projects";

interface ArticleNode {
  id: string;
  frontmatter: {
    title: string;
    slug: string;
    excerpt: string;
    date: string;
    category: string;
    tags: string[];
    readingTime: string;
    featured: boolean;
  };
}

interface ContentNode extends ArticleNode {
  internal: {
    contentFilePath: string;
  };
}

interface IndexPageData {
  allMdx: {
    nodes: ContentNode[];
  };
}

const IndexPage: React.FC<PageProps<IndexPageData>> = ({ data }) => {
  // Transform the GraphQL data to match the Article interface
  const articles = data.allMdx.nodes.map((node) => {
    // Extract content type from file path
    const contentType = node.internal.contentFilePath.includes("/articles/")
      ? "article"
      : "note";

    return {
      id: node.id,
      title: node.frontmatter.title,
      slug: node.frontmatter.slug,
      excerpt: node.frontmatter.excerpt || "",
      date: node.frontmatter.date,
      category: node.frontmatter.category,
      tags: node.frontmatter.tags || [],
      readingTime: node.frontmatter.readingTime,
      featured: node.frontmatter.featured || false,
      author: "Sai Nimmagadda",
      contentType,
    };
  });

  return (
    <Layout
      title="Full-Stack Engineer • Healthcare Tech"
      description="Full-stack engineer focused on healthcare, developer experience, and scalable systems. Building technology that improves patient outcomes."
    >
      <Hero />

      {/* Articles Section */}
      <section className="py-12 md:py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-8 lg:gap-8 lg:grid-cols-2 lg:divide-x lg:divide-border">
              <ArticleList
                title="Blog"
                subtitle="Guides, references, and tutorials."
                articles={articles.filter(
                  (article) => article.contentType === "article",
                )}
                viewAllLink="/articles"
                viewAllText="See All"
              />
              <div className="lg:pl-8">
                <NoteCards
                  notes={articles.filter(
                    (article) => article.contentType === "note",
                  )}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Projects />
    </Layout>
  );
};

export default IndexPage;

// TODO: limit this eventually...
export const query = graphql`
  query {
    allMdx(
      filter: {
        internal: { contentFilePath: { regex: "/content/(articles|notes)/" } }
      }
      sort: { frontmatter: { date: DESC } }
    ) {
      nodes {
        id
        internal {
          contentFilePath
        }
        frontmatter {
          title
          slug
          excerpt
          date
          category
          tags
          readingTime
          featured
        }
      }
    }
  }
`;

export const Head: HeadFC = () => (
  <>
    <title>Sai Nimmagadda - Full-Stack Engineer • Healthcare Tech</title>
    <meta
      name="description"
      content="Full-stack engineer focused on healthcare, developer experience, and scalable systems. Building technology that improves patient outcomes."
    />
    <meta property="og:type" content="website" />
    <meta
      property="og:title"
      content="Sai Nimmagadda - Full-Stack Engineer • Healthcare Tech"
    />
    <meta
      property="og:description"
      content="Full-stack engineer focused on healthcare, developer experience, and scalable systems. Building technology that improves patient outcomes."
    />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:creator" content="@FunSaized" />
    <meta
      name="twitter:title"
      content="Sai Nimmagadda - Full-Stack Engineer • Healthcare Tech"
    />
    <meta
      name="twitter:description"
      content="Full-stack engineer focused on healthcare, developer experience, and scalable systems. Building technology that improves patient outcomes."
    />
  </>
);
