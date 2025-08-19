import React from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { SEO } from "./SEO";
import "../../styles/globals.css";
import "../../styles/prism-theme.css";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  image?: string;
  article?: boolean;
  pathname?: string;
  datePublished?: string;
  dateModified?: string;
  tags?: string[];
}

export function Layout({
  children,
  title,
  description,
  image,
  article,
  pathname,
  datePublished,
  dateModified,
  tags,
}: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SEO
        title={title}
        description={description}
        image={image}
        article={article}
        pathname={pathname}
        datePublished={datePublished}
        dateModified={dateModified}
        tags={tags}
      />

      <Header />

      <main className="flex-1">{children}</main>

      <Footer />
    </div>
  );
}
