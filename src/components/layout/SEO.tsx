import React from "react";

export interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  article?: boolean;
  pathname?: string;
  datePublished?: string;
  dateModified?: string;
  tags?: string[];
}

const defaultMeta = {
  title: "Sai Nimmagadda - Full-Stack Engineer",
  description:
    "Full-stack engineer focused on healthcare, developer experience, and scalable systems.",
  siteUrl: "https://s11a.com",
  image: "/images/face.png",
  twitterUsername: "@FunSaized",
};

export function SEO({
  title,
  description = defaultMeta.description,
  image = defaultMeta.image,
  article = false,
  pathname = "",
  datePublished,
  dateModified,
  tags = [],
}: SEOProps) {
  const imageUrl = image.startsWith("http")
    ? image
    : new URL(image, defaultMeta.siteUrl).toString();
  const url = new URL(pathname || "/", defaultMeta.siteUrl).toString();
  const seo = {
    title: title ? `${title} | ${defaultMeta.title}` : defaultMeta.title,
    description,
    image: imageUrl,
    url,
  };

  // Structured Data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": article ? "BlogPosting" : "WebPage",
    headline: seo.title,
    description: seo.description,
    image: seo.image,
    url: seo.url,
    author: {
      "@type": "Person",
      name: "Sai Nimmagadda",
      url: defaultMeta.siteUrl,
      sameAs: [
        "https://github.com/funsaized",
        "https://www.linkedin.com/in/sainimmagadda",
        "https://twitter.com/FunSaized",
      ],
    },
    publisher: {
      "@type": "Person",
      name: "Sai Nimmagadda",
      url: defaultMeta.siteUrl,
    },
    ...(article &&
      datePublished && {
        datePublished,
        dateModified: dateModified || datePublished,
        keywords: tags.join(", "),
        articleSection: "Technology",
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": seo.url,
        },
      }),
  };

  return (
    <>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta name="image" content={seo.image} />

      {/* Open Graph */}
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:image" content={seo.image} />
      <meta property="og:url" content={seo.url} />
      <meta property="og:type" content={article ? "article" : "website"} />
      <meta property="og:site_name" content="Sai Nimmagadda" />
      <meta property="og:image:width" content="320" />
      <meta property="og:image:height" content="320" />
      {article && datePublished && (
        <meta property="article:published_time" content={datePublished} />
      )}
      {article && (dateModified || datePublished) && (
        <meta
          property="article:modified_time"
          content={dateModified || datePublished}
        />
      )}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:creator" content={defaultMeta.twitterUsername} />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.image} />

      {/* Additional meta tags */}
      <meta name="robots" content="index, follow" />
      <meta name="author" content="Sai Nimmagadda" />
      <link rel="canonical" href={seo.url} />
      <link
        rel="alternate"
        type="application/rss+xml"
        title="Sai Nimmagadda"
        href={`${defaultMeta.siteUrl}/rss.xml`}
      />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </>
  );
}
