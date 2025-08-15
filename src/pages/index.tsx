import React from "react";
import Helmet from "react-helmet";
import { graphql } from "gatsby";
import GitHubButton from "../components/GitHubButton/GitHubButton";
import Layout from "../layout";
import PostListing from "../components/PostListing/PostListing";
import ProjectListing from "../components/ProjectListing/ProjectListing";
import SEO from "../components/SEO/SEO";
import config from "../../data/SiteConfig";
import projects from "../../data/projects";

interface IndexPageProps {
  data: {
    allMarkdownRemark: {
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

function IndexContent({ postEdges }: { postEdges: any[] }): React.ReactElement {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-4xl">
      <Helmet title={config.siteTitle} />
      <SEO />
      <div className="mb-12 max-w-2xl mx-auto text-center sm:text-left">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
          Hi, I&apos;m Sai
        </h1>
        <p className="text-sm sm:text-base mb-6 text-muted-foreground leading-relaxed">
          I&apos;m a full stack software engineer focused on using tech to find
          novel solutions to today&apos;s problems. My day to day focus is
          largely in the healthcare sphere. I build things, contribute to open
          source, and love a good challenge.
        </p>
        <div className="flex gap-4 justify-center sm:justify-start">
          <GitHubButton
            href="https://github.com/funsaized"
            data-size="large"
            data-show-count="true"
            aria-label="Follow @funsaized on GitHub"
          >
            Follow
          </GitHubButton>
        </div>
      </div>

      <div className="grid gap-8 lg:gap-12">
        <section>
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-center sm:text-left">
              Articles
            </h2>
            <PostListing simple postEdges={postEdges} />
          </div>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-center sm:text-left">
            OSS & Projects
          </h2>
          <ProjectListing projects={projects} />
        </section>
      </div>
    </div>
  );
}

function Index({ data }: IndexPageProps): React.ReactElement {
  const { edges: postEdges } = data.allMarkdownRemark;

  return (
    <Layout>
      <IndexContent postEdges={postEdges} />
    </Layout>
  );
}

export default Index;

/* eslint no-undef: "off" */
export const pageQuery = graphql`
  query IndexQuery {
    allMarkdownRemark(
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
