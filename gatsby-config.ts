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
  // Enhanced performance optimizations
  flags: {
    DEV_SSR: false,
  },
  headers: [
    {
      source: `/static/*`,
      headers: [
        {
          key: `Cache-Control`,
          value: `public, max-age=31536000, immutable`,
        },
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
    {
      source: `**/*.{js,jsx,ts,tsx,css,woff,woff2,ttf,otf}`,
      headers: [
        {
          key: `Cache-Control`,
          value: `public, max-age=31536000, immutable`,
        },
      ],
    },
    {
      source: `**/*.{jpg,jpeg,png,gif,ico,svg,webp,avif}`,
      headers: [
        {
          key: `Cache-Control`,
          value: `public, max-age=31536000, immutable`,
        },
      ],
    },
  ],
  plugins: [
    // Bundle analyzer for development insights
    ...(process.env.NODE_ENV === "development"
      ? [
          {
            resolve: "gatsby-plugin-webpack-bundle-analyser-v2",
            options: {
              analyzerMode: "server",
              analyzerPort: 8080,
              openAnalyzer: false,
            },
          },
        ]
      : []),
    {
      resolve: "gatsby-plugin-sitemap",
      options: {
        excludes: ["/dev-404-page/", "/404/", "/404.html", "/offline-plugin-app-shell-fallback/"],
        query: `
          {
            allSitePage {
              nodes {
                path
              }
            }
            allMarkdownRemark {
              nodes {
                fields {
                  slug
                }
                frontmatter {
                  date
                }
              }
            }
          }
        `,
        serialize: ({ allSitePage, allMarkdownRemark }: any) => {
          const pages = allSitePage.nodes.map((page: any) => ({
            url: page.path,
            changefreq: "weekly",
            priority: page.path === "/" ? 1.0 : 0.7,
          }));
          
          const posts = allMarkdownRemark.nodes.map((post: any) => ({
            url: post.fields.slug,
            changefreq: "monthly",
            priority: 0.8,
            lastmod: post.frontmatter.date,
          }));
          
          return [...pages, ...posts];
        },
      },
    },
    {
      resolve: "gatsby-plugin-robots-txt",
      options: {
        host: config.siteUrl,
        sitemap: `${config.siteUrl}/sitemap.xml`,
        policy: [{
          userAgent: "*",
          allow: "/",
          disallow: ["/dev-404-page/", "/404/", "/404.html", "/offline-plugin-app-shell-fallback/"],
          crawlDelay: 2,
        }],
      },
    },
    "gatsby-disable-404",
    "gatsby-plugin-postcss", // Add PostCSS plugin for Tailwind
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
              maxWidth: 1200,
              quality: 85,
              withWebp: true,
              withAvif: true,
              loading: "lazy",
              linkImagesToOriginal: false,
              showCaptions: false,
              backgroundColor: "transparent",
              srcSetBreakpoints: [200, 340, 520, 890, 1200],
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
    {
      resolve: "gatsby-plugin-image",
      options: {
        defaults: {
          formats: ["auto", "webp", "avif"],
          quality: 85,
          loading: "lazy",
          placeholder: "blurred",
          breakpoints: [750, 1080, 1366, 1920],
        },
      },
    },
    {
      resolve: "gatsby-plugin-sharp",
      options: {
        defaults: {
          formats: ["auto", "webp", "avif"],
          quality: 85,
          placeholder: "blurred",
          breakpoints: [750, 1080, 1366, 1920],
        },
        // Enhanced AVIF encoding
        avifOptions: {
          quality: 75,
          lossless: false,
          effort: 4,
        },
        // Optimized WebP encoding
        webpOptions: {
          quality: 85,
          lossless: false,
        },
        // JPEG optimization
        jpgOptions: {
          quality: 85,
          progressive: true,
        },
        // PNG optimization
        pngOptions: {
          quality: 90,
          compressionSpeed: 4,
        },
      },
    },
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
            "**/*.{js,jpg,png,gif,html,css,webp,avif,woff,woff2,ttf,svg,ico}",
          ],
          maximumFileSizeToCacheInBytes: 8 * 1024 * 1024, // 8MB for modern formats
          runtimeCaching: [
            {
              urlPattern: /^https?:.*\/page-data\/.*\.json$/,
              handler: "CacheFirst",
            },
            {
              urlPattern: /^https?:.*\.(png|jpg|jpeg|webp|avif|svg|gif|tiff)$/i,
              handler: "CacheFirst",
            },
            {
              urlPattern: /^https?:.*\.(woff|woff2|ttf|otf)$/i,
              handler: "CacheFirst",
            },
          ],
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
