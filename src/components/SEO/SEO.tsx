import React, { useMemo } from "react";
import Helmet from "react-helmet";
import urljoin from "url-join";
import config from "../../../data/SiteConfig";

interface PostNode {
  frontmatter: {
    title: string;
    description?: string;
    cover?: string;
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
}

interface SEOProps {
  postNode?: PostNode;
  postPath?: string;
  postSEO?: boolean;
}

function SEO({ postNode, postPath, postSEO }: SEOProps): React.ReactElement {
  const seoData = useMemo(() => {
    let title: string;
    let description: string;
    let image: string;
    let postURL: string | undefined;

    if (postSEO && postNode) {
      const postMeta = postNode.frontmatter;
      title = postMeta.title;
      description = postMeta.description || postNode.excerpt;
      image = postMeta.cover || "";
      
      if (postMeta.thumbnail) {
        image = postMeta.thumbnail.childImageSharp.gatsbyImageData.images.fallback.src;
      }
      postURL = urljoin(config.siteUrl, config.pathPrefix, postPath || "");
    } else {
      title = config.siteTitle;
      description = config.siteDescription;
      image = `${config.siteLogo}/`;
    }

    image = config.siteUrl + image;
    const blogURL = urljoin(config.siteUrl, config.pathPrefix);
    
    const schemaOrgJSONLD = [
      {
        "@context": "http://schema.org",
        "@type": "WebSite",
        url: blogURL,
        name: title,
        alternateName: config.siteTitleAlt || "",
      },
    ];

    if (postSEO) {
      schemaOrgJSONLD.push(
        {
          "@context": "http://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              item: {
                "@id": postURL,
                name: title,
                image,
              },
            },
          ],
        },
        {
          "@context": "http://schema.org",
          "@type": "BlogPosting",
          url: blogURL,
          name: title,
          alternateName: config.siteTitleAlt || "",
          headline: title,
          image: {
            "@type": "ImageObject",
            url: image,
          },
          description,
        },
      );
    }

    return {
      title,
      description,
      image,
      postURL,
      blogURL,
      schemaOrgJSONLD,
    };
  }, [postNode, postPath, postSEO]);

  return (
    <Helmet>
      {/* General tags */}
      <meta name="description" content={seoData.description} />
      <meta name="image" content={seoData.image} />

      {/* Schema.org tags */}
      <script type="application/ld+json">
        {JSON.stringify(seoData.schemaOrgJSONLD)}
      </script>

      {/* OpenGraph tags */}
      <meta property="og:url" content={postSEO ? seoData.postURL : seoData.blogURL} />
      {postSEO ? <meta property="og:type" content="article" /> : null}
      <meta property="og:title" content={seoData.title} />
      <meta property="og:description" content={seoData.description} />
      <meta property="og:image" content={seoData.image} />
      <meta
        property="fb:app_id"
        content={config.siteFBAppID || ""}
      />

      {/* Twitter Card tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta
        name="twitter:creator"
        content={config.userTwitter || ""}
      />
      <meta name="twitter:title" content={seoData.title} />
      <meta name="twitter:description" content={seoData.description} />
      <meta name="twitter:image" content={seoData.image} />
    </Helmet>
  );
}

export default SEO;
