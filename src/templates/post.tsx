import React, { useState, useEffect } from "react";
import Helmet from "react-helmet";
import { graphql } from "gatsby";
import { GatsbyImage, getImage } from "gatsby-plugin-image";
import Layout from "../layout";
import UserInfo from "../components/UserInfo/UserInfo";
import PostTags from "../components/PostTags/PostTags";
import SocialLinks from "../components/SocialLinks/SocialLinks";
import SEO from "../components/SEO/SEO";
import DynamicBreadcrumb from "../components/Breadcrumb/Breadcrumb";
import BreadcrumbSEO from "../components/BreadcrumbSEO/BreadcrumbSEO";
import TableOfContents from "../components/TableOfContents/TableOfContents";
import RelatedPosts from "../components/RelatedPosts/RelatedPosts";
import PostNavigation from "../components/PostNavigation/PostNavigation";
import ReadingProgress from "../components/ReadingProgress/ReadingProgress";
import BackToTop from "../components/BackToTop/BackToTop";
import config from "../../data/SiteConfig";
import { formatDate, editOnGithub } from "../services/appConstants";
import { extractHeadings, ensureHeadingIds } from "../services/tableOfContentsUtils";
import { PostEdge } from "../models";
import "./post.css";

interface PostTemplateProps {
  data: {
    markdownRemark: {
      html: string;
      timeToRead: number;
      excerpt: string;
      frontmatter: {
        title: string;
        date: string;
        tags: string[];
        time: string;
        thumbnail?: any;
        category?: string;
        id?: string;
        category_id?: string;
      };
      fields: {
        slug: string;
        date: string;
      };
    };
    allMarkdownRemark: {
      edges: PostEdge[];
    };
    previous?: {
      frontmatter: {
        title: string;
      };
      fields: {
        slug: string;
      };
    };
    next?: {
      frontmatter: {
        title: string;
      };
      fields: {
        slug: string;
      };
    };
  };
  pageContext: {
    slug: string;
  };
}

function PostTemplate({
  data,
  pageContext,
}: PostTemplateProps): React.ReactElement {
  const { slug } = pageContext;
  const postNode = data.markdownRemark;
  const post = postNode.frontmatter;
  const [processedHtml, setProcessedHtml] = useState(postNode.html);
  const [headings, setHeadings] = useState([]);
  let thumbnail;
  const date = formatDate(post.date);

  const githubLink = editOnGithub(post);

  if (!post.id) {
    post.id = slug;
  }
  if (!post.category_id) {
    post.category_id = config.postDefaultCategoryID;
  }
  if (post.thumbnail) {
    thumbnail = getImage(post.thumbnail);
  }

  // Process HTML and extract headings for TOC
  useEffect(() => {
    const htmlWithIds = ensureHeadingIds(postNode.html);
    setProcessedHtml(htmlWithIds);
    
    // Extract headings for TOC
    const extractedHeadings = extractHeadings(htmlWithIds, 4);
    setHeadings(extractedHeadings);
  }, [postNode.html]);

  // Navigation data
  const navigation = {
    previous: data.previous ? {
      slug: data.previous.fields.slug,
      title: data.previous.frontmatter.title,
    } : undefined,
    next: data.next ? {
      slug: data.next.fields.slug,
      title: data.next.frontmatter.title,
    } : undefined,
  };

  // Current post data for related posts
  const currentPost = {
    slug: postNode.fields.slug,
    tags: post.tags || [],
    category: post.category,
  };

  // Create breadcrumb items
  const breadcrumbItems = [
    { label: "Blog", href: "/blog" },
    ...(post.category ? [{ label: post.category, href: `/categories/${post.category.toLowerCase().replace(/\s+/g, "-")}` }] : []),
    { label: post.title }
  ];

  // Create SEO breadcrumb items
  const breadcrumbSEOItems = [
    { name: "Home", item: `${config.siteUrl}` },
    { name: "Blog", item: `${config.siteUrl}/blog` },
    ...(post.category ? [{ name: post.category, item: `${config.siteUrl}/categories/${post.category.toLowerCase().replace(/\s+/g, "-")}` }] : []),
    { name: post.title, item: `${config.siteUrl}${slug}` }
  ];

  return (
    <Layout>
      <div>
        <Helmet>
          <title>{`${post.title} | ${config.siteTitle}`}</title>
        </Helmet>
        <SEO postPath={slug} postNode={postNode} postSEO />
        <BreadcrumbSEO items={breadcrumbSEOItems} />
        
        {/* Reading Progress Bar */}
        <ReadingProgress />

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Breadcrumb Navigation */}
            <DynamicBreadcrumb items={breadcrumbItems} className="mb-6" />
            
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
              {/* Main Content Area */}
              <div className="xl:col-span-3">
                <article>
                  <header className="mb-8">
                    <div className="flex items-start gap-8 mb-6">
                      <div className="flex-shrink-0">
                        {thumbnail ? (
                          <GatsbyImage 
                            image={thumbnail} 
                            alt=""
                            className="w-28 h-28 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-28 h-28 bg-muted rounded-lg flex items-center justify-center">
                            <span className="text-muted-foreground text-2xl">📄</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h1 className="text-3xl font-bold mb-4 text-foreground">{post.title}</h1>
                        <div className="text-sm text-muted-foreground mb-4 space-y-1">
                          <div>
                            By <strong>Sai Nimmagadda</strong> on {date} | {post.time}
                          </div>
                          <a
                            className="text-primary hover:text-primary/80 transition-colors"
                            href={githubLink}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Edit on Github ✍️
                          </a>
                        </div>
                        <PostTags tags={post.tags} />
                      </div>
                    </div>
                  </header>
                  
                  {/* Article Content */}
                  <div
                    className="prose prose-lg max-w-none dark:prose-invert font-serif"
                    dangerouslySetInnerHTML={{ __html: processedHtml }}
                  />
                  
                  {/* Post Footer */}
                  <div className="mt-12 pt-8 border-t border-border space-y-8">
                    <PostTags tags={post.tags} />
                    <SocialLinks postPath={slug} postNode={postNode} />
                  </div>
                </article>

                {/* Post Navigation */}
                <PostNavigation 
                  previous={navigation.previous}
                  next={navigation.next}
                  className="mt-12"
                />

                {/* Related Posts */}
                <RelatedPosts 
                  currentPost={currentPost}
                  allPosts={data.allMarkdownRemark.edges}
                  limit={4}
                  className="mt-12"
                />

                {/* Author Info */}
                <div className="mt-12">
                  <UserInfo config={config} />
                </div>
              </div>

              {/* Sidebar */}
              <div className="xl:col-span-1">
                <div className="space-y-8">
                  {/* Table of Contents */}
                  {headings.length > 0 && (
                    <TableOfContents 
                      headings={headings}
                      className="hidden xl:block"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Top Button */}
        <BackToTop />
      </div>
    </Layout>
  );
}

export default PostTemplate;

/* eslint no-undef: "off" */
export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!, $previousSlug: String, $nextSlug: String) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      timeToRead
      excerpt
      frontmatter {
        title
        thumbnail {
          childImageSharp {
            gatsbyImageData(layout: FIXED, width: 150, height: 140)
          }
        }
        slug
        cover
        date
        category
        tags
        time
      }
      fields {
        slug
        date
      }
    }
    allMarkdownRemark(
      limit: 1000
      sort: { fields: { date: DESC } }
      filter: { frontmatter: { type: { eq: "post" } } }
    ) {
      edges {
        node {
          fields {
            slug
            date
          }
          excerpt
          timeToRead
          frontmatter {
            title
            tags
            category
            cover
            date
            thumbnail {
              childImageSharp {
                gatsbyImageData(layout: FIXED, width: 50, height: 50)
              }
            }
          }
        }
      }
    }
    previous: markdownRemark(fields: { slug: { eq: $previousSlug } }) {
      frontmatter {
        title
      }
      fields {
        slug
      }
    }
    next: markdownRemark(fields: { slug: { eq: $nextSlug } }) {
      frontmatter {
        title
      }
      fields {
        slug
      }
    }
  }
`;
