import React from "react";
import { Helmet } from "react-helmet";

interface BreadcrumbSEOItem {
  name: string;
  item: string;
}

interface BreadcrumbSEOProps {
  items: BreadcrumbSEOItem[];
  className?: string;
}

function BreadcrumbSEO({ items }: BreadcrumbSEOProps): React.ReactElement {
  const breadcrumbList = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.item,
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbList)}
      </script>
    </Helmet>
  );
}

export default BreadcrumbSEO;
