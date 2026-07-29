import React from "react";
import type { HeadFC, PageProps } from "gatsby";
import { graphql } from "gatsby";
import { Layout } from "../components/layout/Layout";
import { Hero } from "../components/home/Hero";
import { ArticleList } from "../components/home/ArticleList";
import { Projects } from "../components/home/Projects";
import { SEO } from "../components/layout/SEO";

interface ArticleNode {
  id: string;
  frontmatter: {
    title: string;
    slug: string;
    date: string;
  };
}

interface IndexPageData {
  articles: {
    nodes: ArticleNode[];
  };
}

const IndexPage: React.FC<PageProps<IndexPageData>> = ({ data }) => {
  const articles = data.articles.nodes.map((node) => ({
    id: node.id,
    title: node.frontmatter.title,
    slug: node.frontmatter.slug,
    date: node.frontmatter.date,
  }));

  return (
    <Layout>
      <Hero />

      {/* Articles Section */}
      <section className="py-12 md:py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <ArticleList
              title="Blog"
              subtitle="Guides, references, and tutorials."
              articles={articles}
              viewAllLink="/articles"
              viewAllText="See All"
            />
          </div>
        </div>
      </section>

      <Projects />
    </Layout>
  );
};

export default IndexPage;

export const query = graphql`
  query {
    articles: allMdx(
      filter: { internal: { contentFilePath: { regex: "/content/articles/" } } }
      sort: { frontmatter: { date: DESC } }
      limit: 10
    ) {
      nodes {
        id
        frontmatter {
          title
          slug
          date
        }
      }
    }
  }
`;

export const Head: HeadFC = () => (
  <SEO
    title="Full-Stack Engineer • Healthcare Tech"
    description="Full-stack engineer focused on healthcare, developer experience, and scalable systems. Building technology that improves patient outcomes."
    pathname="/"
  />
);
