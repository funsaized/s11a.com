import React from "react";

interface SEOProps {
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
  image: "https://s11a.com/logo-512.png",
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
  const seo = {
    title: title ? `${title} | ${defaultMeta.title}` : defaultMeta.title,
    description,
    image: `${defaultMeta.siteUrl}${image}`,
    url: `${defaultMeta.siteUrl}${pathname}`,
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
        "https://github.com/snimmagadda1",
        "https://linkedin.com/in/snimmagadda",
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
        datePublished: datePublished,
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

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </>
  );
}
