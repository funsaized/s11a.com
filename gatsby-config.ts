import type { GatsbyConfig } from "gatsby";
import urljoin from "url-join";
import config from "./data/SiteConfig";

const gatsbyConfig: GatsbyConfig = {
  pathPrefix: config.pathPrefix === "" ? "/" : config.pathPrefix,
  siteMetadata: {
    siteUrl: urljoin(config.siteUrl, config.pathPrefix),
    rssMetadata: {
      site_url: urljoin(config.siteUrl, config.pathPrefix),
      feed_url: urljoin(config.siteUrl, config.pathPrefix, config.siteRss),
      title: config.siteTitle,
      description: config.siteDescription,
      image_url: `${urljoin(
        config.siteUrl,
        config.pathPrefix,
      )}/logos/logo-512.png`,
      copyright: config.copyright,
    },
  },
  headers: [
    {
      source: `/static/*`,
      headers: [
        {
          key: `X-Frame-Options`,
          value: `SAMEORIGIN`,
        },
        {
          key: `X-Content-Type-Options`,
          value: `nosniff`,
        },
        {
          key: `X-XSS-Protection`,
          value: `1; mode=block`,
        },
      ],
    },
  ],
  plugins: [
    "gatsby-plugin-sitemap",
    "gatsby-disable-404",
    "gatsby-plugin-postcss", // Add PostCSS plugin for Tailwind
    {
      resolve: "gatsby-plugin-sass",
      options: {
        // eslint-disable-next-line import/no-extraneous-dependencies, global-require
        implementation: require("sass"),
        sassOptions: {
          silenceDeprecations: ['legacy-js-api'], // Temporarily silence the deprecation warning
        },
      },
    },
    "gatsby-plugin-react-helmet",
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "assets",
        path: `${__dirname}/static/`,
      },
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "posts",
        path: `${__dirname}/content/`,
      },
    },
    {
      resolve: "gatsby-transformer-remark",
      options: {
        plugins: [
          {
            resolve: "gatsby-remark-images",
            options: {
              maxWidth: 690,
              quality: 90,
              withWebp: true,
              loading: "lazy",
              linkImagesToOriginal: false,
              showCaptions: false,
              backgroundColor: "transparent",
            },
          },
          {
            resolve: "gatsby-remark-responsive-iframe",
          },
          "gatsby-remark-copy-linked-files",
          "gatsby-remark-autolink-headers",
          {
            resolve: `gatsby-remark-prismjs`,
            options: {
              classPrefix: "language-",
              aliases: {},
              showLineNumbers: false,
              noInlineHighlight: false,
              inlineCodeMarker: ">",
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
    {
      resolve: "gatsby-plugin-nprogress",
      options: {
        color: config.themeColor,
      },
    },
    "gatsby-plugin-image",
    "gatsby-plugin-sharp",
    "gatsby-transformer-sharp",
    "gatsby-plugin-catch-links",
    {
      resolve: "gatsby-plugin-manifest",
      options: {
        name: config.siteTitle,
        short_name: config.siteTitleShort,
        description: config.siteDescription,
        start_url: config.pathPrefix,
        background_color: config.backgroundColor,
        theme_color: config.themeColor,
        display: "minimal-ui",
        icon: "src/favicon.png",
        icon_options: {
          purpose: "any maskable",
        },
        cache_busting_mode: "none",
      },
    },
    {
      resolve: "gatsby-plugin-offline",
      options: {
        precachePages: ["/", "/blog/*", "/about/"],
        workboxConfig: {
          globPatterns: [
            "**/*.{js,jpg,png,gif,html,css,webp,woff,woff2,ttf,svg,ico}",
          ],
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
        },
      },
    },
    {
      resolve: "gatsby-plugin-feed",
      options: {
        setup(ref) {
          const ret = ref.query.site.siteMetadata.rssMetadata;
          ret.allMarkdownRemark = ref.query.allMarkdownRemark;
          ret.generator = "s11a Programming Blog";
          return ret;
        },
        query: `
        {
          site {
            siteMetadata {
              rssMetadata {
                site_url
                feed_url
                title
                description
                image_url
                copyright
              }
            }
          }
        }
      `,
        feeds: [
          {
            serialize(ctx) {
              const { rssMetadata } = ctx.query.site.siteMetadata;
              return ctx.query.allMarkdownRemark.edges.map((edge) => ({
                categories: edge.node.frontmatter.tags,
                date: edge.node.fields.date,
                title: edge.node.frontmatter.title,
                description: edge.node.excerpt,
                url: rssMetadata.site_url + edge.node.fields.slug,
                guid: rssMetadata.site_url + edge.node.fields.slug,
                custom_elements: [
                  { "content:encoded": edge.node.html },
                  { author: config.userEmail },
                ],
              }));
            },
            query: `{
  allMarkdownRemark(limit: 1000, sort: {fields: {date: DESC}}) {
    edges {
      node {
        excerpt
        html
        timeToRead
        fields {
          slug
          date
        }
        frontmatter {
          title
          cover
          date
          category
          tags
        }
      }
    }
  }
}`,
            output: config.siteRss,
            title: "Sai Nimmagadda's Programming Blog",
          },
        ],
      },
    },
  ],
};

export default gatsbyConfig;
