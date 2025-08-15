import React, { useMemo } from "react";
import Helmet from "react-helmet";
import urljoin from "url-join";
import config from "../../../data/SiteConfig";

interface PostNode {
  fields: {
    date: string;
  };
  frontmatter: {
    title: string;
    description?: string;
    cover?: string;
    tags?: string[];
    category?: string;
    date?: string;
    time?: string;
    thumbnail?: {
      childImageSharp: {
        gatsbyImageData: {
          images: {
            fallback: {
              src: string;
            };
          };
        };
      };
    };
  };
  excerpt: string;
  timeToRead?: number;
}

interface SEOProps {
  postNode?: PostNode;
  postPath?: string;
  postSEO?: boolean;
  title?: string;
  description?: string;
}

function SEO({ postNode, postPath, postSEO, title: customTitle, description: customDescription }: SEOProps): React.ReactElement {
  const seoData = useMemo(() => {
    let title: string;
    let description: string;
    let image: string;
    let postURL: string | undefined;
    let canonicalURL: string;
    let keywords: string | undefined;
    let publishedTime: string | undefined;
    let modifiedTime: string | undefined;
    let author: string;
    let readingTime: number | undefined;

    if (postSEO && postNode) {
      const postMeta = postNode.frontmatter;
      title = `${postMeta.title} | ${config.siteTitle}`;
      description = postMeta.description || postNode.excerpt;
      image = postMeta.cover || "";
      keywords = postMeta.tags ? postMeta.tags.join(", ") : undefined;
      publishedTime = postNode.fields.date;
      modifiedTime = postNode.fields.date; // Use date as modified until we track actual modifications
      author = config.userName;
      readingTime = postNode.timeToRead;

      if (postMeta.thumbnail) {
        image =
          postMeta.thumbnail.childImageSharp.gatsbyImageData.images.fallback
            .src;
      }
      postURL = urljoin(config.siteUrl, config.pathPrefix, postPath || "");
      canonicalURL = postURL;
    } else {
      title = customTitle || config.siteTitle;
      description = customDescription || config.siteDescription;
      image = `${config.siteLogo}/`;
      canonicalURL = urljoin(config.siteUrl, config.pathPrefix);
      author = config.userName;
    }

    image = config.siteUrl + image;
    const blogURL = urljoin(config.siteUrl, config.pathPrefix);

    const schemaOrgJSONLD = [
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": `${blogURL}#website`,
        url: blogURL,
        name: config.siteTitle,
        description: config.siteDescription,
        alternateName: config.siteTitleAlt || "",
        publisher: {
          "@type": "Person",
          "@id": `${blogURL}#/schema/person`,
          name: config.userName,
          url: blogURL,
          sameAs: config.userLinks.map(link => link.url)
        }
      },
    ];

    if (postSEO && postNode) {
      schemaOrgJSONLD.push(
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: blogURL
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Blog",
              item: urljoin(blogURL, "/blog/")
            },
            {
              "@type": "ListItem",
              position: 3,
              name: postNode.frontmatter.title,
              item: postURL
            }
          ],
        },
        {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "@id": `${postURL}#article`,
          url: postURL,
          headline: postNode.frontmatter.title,
          name: postNode.frontmatter.title,
          description: description,
          image: {
            "@type": "ImageObject",
            url: image,
            width: 1200,
            height: 630
          },
          datePublished: publishedTime,
          dateModified: modifiedTime,
          author: {
            "@type": "Person",
            "@id": `${blogURL}#/schema/person`,
            name: author,
            url: blogURL
          },
          publisher: {
            "@type": "Person",
            "@id": `${blogURL}#/schema/person`,
            name: author,
            url: blogURL
          },
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": postURL
          },
          keywords: keywords,
          timeRequired: readingTime ? `PT${readingTime}M` : undefined,
          inLanguage: "en-US",
          isPartOf: {
            "@type": "Blog",
            "@id": `${blogURL}#blog`,
            name: config.siteTitle,
            url: blogURL
          },
          about: postNode.frontmatter.category ? {
            "@type": "Thing",
            name: postNode.frontmatter.category
          } : undefined
        },
      );
    }

    return {
      title,
      description,
      image,
      postURL,
      blogURL,
      canonicalURL,
      keywords,
      publishedTime,
      modifiedTime,
      author,
      schemaOrgJSONLD,
    };
  }, [postNode, postPath, postSEO]);

  return (
    <Helmet>
      {/* General tags */}
      <title>{seoData.title}</title>
      <meta name="description" content={seoData.description} />
      <meta name="image" content={seoData.image} />
      <link rel="canonical" href={seoData.canonicalURL} />
      {seoData.keywords && <meta name="keywords" content={seoData.keywords} />}
      <meta name="author" content={seoData.author} />
      <meta name="robots" content="index, follow" />
      
      {/* Article-specific meta tags */}
      {postSEO && seoData.publishedTime && (
        <meta property="article:published_time" content={seoData.publishedTime} />
      )}
      {postSEO && seoData.modifiedTime && (
        <meta property="article:modified_time" content={seoData.modifiedTime} />
      )}
      {postSEO && postNode?.frontmatter.category && (
        <meta property="article:section" content={postNode.frontmatter.category} />
      )}
      {postSEO && postNode?.frontmatter.tags && 
        postNode.frontmatter.tags.map(tag => (
          <meta key={tag} property="article:tag" content={tag} />
        ))
      }

      {/* Schema.org tags */}
      <script type="application/ld+json">
        {JSON.stringify(seoData.schemaOrgJSONLD)}
      </script>

      {/* OpenGraph tags */}
      <meta property="og:url" content={postSEO ? seoData.postURL : seoData.blogURL} />
      <meta property="og:type" content={postSEO ? "article" : "website"} />
      <meta property="og:title" content={seoData.title} />
      <meta property="og:description" content={seoData.description} />
      <meta property="og:image" content={seoData.image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={config.siteTitle} />
      <meta property="og:locale" content="en_US" />
      {config.siteFBAppID && <meta property="fb:app_id" content={config.siteFBAppID} />}

      {/* Twitter Card tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={config.userTwitter ? `@${config.userTwitter}` : ""} />
      <meta name="twitter:creator" content={config.userTwitter ? `@${config.userTwitter}` : ""} />
      <meta name="twitter:title" content={seoData.title} />
      <meta name="twitter:description" content={seoData.description} />
      <meta name="twitter:image" content={seoData.image} />
      <meta name="twitter:image:alt" content={postSEO ? postNode?.frontmatter.title : config.siteTitle} />
    </Helmet>
  );
}

export default SEO;
