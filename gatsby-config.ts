import type { GatsbyConfig } from "gatsby";

const analyticsId = process.env.GATSBY_GA_MEASUREMENT_ID;
const analyzeBundle = process.env.GATSBY_ANALYZE === "true";

interface FeedQueryResult {
  site: { siteMetadata: { siteUrl: string } };
  allMdx: {
    nodes: Array<{
      excerpt: string;
      frontmatter: {
        title: string;
        slug: string;
        date: string;
        excerpt?: string;
      };
    }>;
  };
}

const config: GatsbyConfig = {
  siteMetadata: {
    title: `Sai Nimmagadda`,
    siteUrl: `https://s11a.com`,
    description: `Full-stack engineer focused on healthcare, developer experience, and scalable systems.`,
    author: `@FunSaized`,
  },
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `content`,
        path: `${__dirname}/src/content/`,
      },
    },
    {
      resolve: `gatsby-plugin-mdx`,
      options: {
        extensions: [`.md`, `.mdx`],
        gatsbyRemarkPlugins: [
          {
            resolve: `gatsby-remark-prismjs`,
            options: {
              classPrefix: "language-",
              inlineCodeMarker: null,
              aliases: {
                sh: "bash",
                js: "javascript",
                ts: "typescript",
                yml: "yaml",
                k8s: "yaml",
              },
              showLineNumbers: true,
              noInlineHighlight: false,
              languageExtensions: [
                {
                  language: "superscript",
                  extend: "javascript",
                  definition: {
                    superscript_types: /(SuperType)/,
                  },
                  insertBefore: {
                    function: {
                      superscript_keywords: /(superif|superelse)/,
                    },
                  },
                },
              ],
              prompt: {
                user: "root",
                host: "localhost",
                global: false,
              },
              escapeEntities: {},
            },
          },
        ],
      },
    },
    `gatsby-plugin-sitemap`,
    `gatsby-plugin-robots-txt`,
    {
      resolve: `gatsby-plugin-feed`,
      options: {
        feeds: [
          {
            output: "/rss.xml",
            title: "Sai Nimmagadda",
            query: `
              {
                allMdx(
                  filter: {
                    internal: {
                      contentFilePath: { regex: "/content/articles/" }
                    }
                  }
                  sort: { frontmatter: { date: DESC } }
                ) {
                  nodes {
                    excerpt
                    frontmatter {
                      title
                      slug
                      date
                      excerpt
                    }
                  }
                }
              }
            `,
            serialize: ({
              query: { site, allMdx },
            }: {
              query: FeedQueryResult;
            }) =>
              allMdx.nodes.map((node) => ({
                title: node.frontmatter.title,
                description: node.frontmatter.excerpt || node.excerpt,
                date: node.frontmatter.date,
                url: `${site.siteMetadata.siteUrl}/articles/${node.frontmatter.slug}`,
                guid: `${site.siteMetadata.siteUrl}/articles/${node.frontmatter.slug}`,
              })),
          },
        ],
      },
    },
    ...(analyzeBundle
      ? [
          {
            resolve: `gatsby-plugin-webpack-bundle-analyser-v2`,
            options: {
              analyzerMode: "static",
              reportFilename: "bundle-analyzer-report.html",
              openAnalyzer: false,
            },
          },
        ]
      : []),
    ...(analyticsId
      ? [
          {
            resolve: `gatsby-plugin-google-gtag`,
            options: {
              trackingIds: [analyticsId],
              pluginConfig: {
                head: false,
                respectDNT: true,
              },
            },
          },
        ]
      : []),
  ],
};

export default config;
