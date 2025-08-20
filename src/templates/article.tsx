import React from "react";
import { graphql, Link } from "gatsby";
import { Layout } from "../components/layout/Layout";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { TableOfContents } from "../components/article/TableOfContents";
import { SharingComponent } from "../components/article/SharingComponent";
import { categoryIcons } from "../data/sampleData";
import { MDXProvider } from "@mdx-js/react";
import { headingComponents } from "../components/mdx/HeadingComponents";

const BackArrowIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 19l-7-7 7-7"
    />
  </svg>
);

const ClockIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const CalendarIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

interface ArticleTemplateProps {
  data: {
    mdx: {
      frontmatter: {
        title: string;
        excerpt: string;
        date: string;
        category: string;
        tags: string[];
        readingTime: string;
        author: string;
      };
      tableOfContents: {
        items?: Array<{
          url: string;
          title: string;
          items?: Array<{
            url: string;
            title: string;
          }>;
        }>;
      };
    };
  };
  location: {
    pathname: string;
  };
  children: React.ReactNode;
}

const ArticleTemplate: React.FC<ArticleTemplateProps> = ({
  data,
  location,
  children,
}) => {
  const { mdx } = data;
  const { frontmatter } = mdx;
  const categoryIcon = categoryIcons[frontmatter.category] || "📝";

  const articleUrl = `https://s11a.com${location.pathname}`;

  return (
    <Layout
      title={frontmatter.title}
      description={frontmatter.excerpt}
      article={true}
      pathname={location.pathname}
      datePublished={frontmatter.date}
      tags={frontmatter.tags}
    >
      <article className="py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Back Navigation */}
          <div className="mb-8">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/articles" className="inline-flex items-center gap-2">
                <BackArrowIcon />
                Back to Articles
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-6 gap-8">
            {/* Table of Contents - Hidden on mobile, shows on desktop */}
            <aside className="hidden lg:block lg:col-span-1">
              <div className="sticky top-8">
                <TableOfContents items={mdx.tableOfContents.items} />
              </div>
            </aside>

            {/* Main Content */}
            <main className="lg:col-span-4">
              {/* Article Header */}
              <header className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">{categoryIcon}</span>
                  <Badge variant="secondary">{frontmatter.category}</Badge>
                </div>

                <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                  {frontmatter.title}
                </h1>

                <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
                  {frontmatter.excerpt}
                </p>

                {/* Article Meta */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center gap-1">
                    <CalendarIcon />
                    <time dateTime={frontmatter.date}>
                      {new Date(frontmatter.date).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </time>
                  </div>

                  <div className="flex items-center gap-1">
                    <ClockIcon />
                    <span>{frontmatter.readingTime}</span>
                  </div>

                  <div>By {frontmatter.author}</div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {frontmatter.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </header>

              {/* Article Content */}
              <div className="prose prose-lg max-w-none prose-headings:scroll-mt-8 prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-pre:text-sm prose-pre:leading-relaxed prose-pre:overflow-x-auto prose-code:bg-muted prose-code:px-1.5 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none prose-img:rounded-lg prose-img:shadow-md">
                <MDXProvider components={headingComponents}>
                  {children}
                </MDXProvider>
              </div>
            </main>

            {/* Sharing Sidebar */}
            <aside className="lg:col-span-1">
              <div className="sticky top-8">
                <SharingComponent
                  url={articleUrl}
                  title={frontmatter.title}
                  excerpt={frontmatter.excerpt}
                />
              </div>
            </aside>
          </div>
        </div>
      </article>
    </Layout>
  );
};

export default ArticleTemplate;

export const query = graphql`
  query ArticleQuery($id: String!) {
    mdx(id: { eq: $id }) {
      frontmatter {
        title
        excerpt
        date
        category
        tags
        readingTime
        author
      }
      tableOfContents(maxDepth: 3)
    }
  }
`;
