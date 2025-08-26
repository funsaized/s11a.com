import React from "react";
import { graphql, Link } from "gatsby";
import { MDXProvider } from "@mdx-js/react";
import { Layout } from "../components/layout/Layout";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
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

const EditIcon = () => (
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
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
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

interface NoteTemplateProps {
  data: {
    mdx: {
      frontmatter: {
        title: string;
        excerpt?: string;
        date?: string;
        category?: string;
        tags?: string[];
        author?: string;
      };
    };
  };
  location: {
    pathname: string;
  };
  children: React.ReactNode;
}

const NoteTemplate: React.FC<NoteTemplateProps> = ({
  data,
  location,
  children,
}) => {
  const { mdx } = data;
  const { frontmatter } = mdx;

  return (
    <Layout
      title={frontmatter.title}
      description={frontmatter.excerpt || "Personal notes and jottings"}
      pathname={location.pathname}
      datePublished={frontmatter.date}
      tags={frontmatter.tags}
    >
      <article className="py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back Navigation */}
          <div className="mb-8">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/notes" className="inline-flex items-center gap-2">
                <BackArrowIcon />
                Back to Notes
              </Link>
            </Button>
          </div>

          {/* Note Content */}
          <div className="bg-card border border-border rounded-lg shadow-sm">
            <div className="p-8">
              {/* Image Disclaimer */}
              {/*<div className="mb-4 text-xs text-muted-foreground/70 italic border-l-2 border-muted-foreground/20 pl-3">
                Note: Images are currently being optimized and may not display properly.
              </div>*/}
              <div
                className="max-w-fit p-4 mb-4 text-sm text-blue-800 rounded-lg bg-blue-50 dark:bg-gray-800 dark:text-blue-400"
                role="alert"
              >
                <span className="font-medium">Psst!</span> Format may vary...
                blame Apple for not supporting Markdown fully
              </div>

              {/* Note Header */}
              <header className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <EditIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground font-medium">
                      Personal Note
                    </span>
                  </div>
                  {frontmatter.date && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <CalendarIcon />
                      <time dateTime={frontmatter.date}>
                        {new Date(frontmatter.date).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        )}
                      </time>
                    </div>
                  )}
                </div>

                <h1 className="text-3xl lg:text-4xl font-bold mb-4 leading-tight">
                  {frontmatter.title}
                </h1>

                {frontmatter.excerpt && (
                  <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                    {frontmatter.excerpt}
                  </p>
                )}

                <div className="flex items-center gap-4 mb-6">
                  {frontmatter.category && (
                    <Badge variant="secondary">{frontmatter.category}</Badge>
                  )}

                  {frontmatter.tags && frontmatter.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {frontmatter.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </header>

              {/* Note Content */}
              <div className="prose max-w-none dark:prose-invert prose-headings:scroll-mt-8 prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-pre:text-sm prose-pre:leading-relaxed prose-pre:overflow-x-auto prose-code:bg-muted prose-code:px-1.5 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none prose-img:rounded-lg prose-img:shadow-md prose-a:break-words overflow-hidden">
                <MDXProvider components={headingComponents}>
                  {children}
                </MDXProvider>
              </div>

              {/* Note Footer */}
              {frontmatter.author && (
                <footer className="mt-8 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    By {frontmatter.author}
                  </p>
                </footer>
              )}
            </div>
          </div>
        </div>
      </article>
    </Layout>
  );
};

export default NoteTemplate;

export const query = graphql`
  query NoteQuery($id: String!) {
    mdx(id: { eq: $id }) {
      frontmatter {
        title
        excerpt
        date
        category
        tags
        author
      }
    }
  }
`;
