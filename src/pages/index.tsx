import React from "react";
import type { HeadFC, PageProps } from "gatsby";
import { graphql } from "gatsby";
import { Layout } from "../components/layout/Layout";
import { Hero } from "../components/home/Hero";
import { RecentArticles } from "../components/home/RecentArticles";
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

interface IndexPageData {
  allMdx: {
    nodes: ArticleNode[];
  };
}

const IndexPage: React.FC<PageProps<IndexPageData>> = ({ data }) => {
  // Transform the GraphQL data to match the Article interface
  const articles = data.allMdx.nodes.map((node) => ({
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
  }));

  return (
    <Layout
      title="Full-Stack Engineer • Healthcare Tech"
      description="Full-stack engineer focused on healthcare, developer experience, and scalable systems. Building technology that improves patient outcomes."
    >
      <Hero />
      <RecentArticles articles={articles} />
      <Projects />
    </Layout>
  );
};

export default IndexPage;

export const query = graphql`
  query {
    allMdx(sort: { frontmatter: { date: DESC } }, limit: 4) {
      nodes {
        id
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
