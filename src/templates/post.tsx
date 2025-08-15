import React from "react";
import Helmet from "react-helmet";
import { graphql } from "gatsby";
import { GatsbyImage, getImage } from "gatsby-plugin-image";
import Layout from "../layout";
import UserInfo from "../components/UserInfo/UserInfo";
import PostTags from "../components/PostTags/PostTags";
import SocialLinks from "../components/SocialLinks/SocialLinks";
import SEO from "../components/SEO/SEO";
import config from "../../data/SiteConfig";
import { formatDate, editOnGithub } from "../services/appConstants";
import "./post.css";

interface PostTemplateProps {
  data: {
    markdownRemark: {
      html: string;
      frontmatter: {
        title: string;
        date: string;
        tags: string[];
        time: string;
        thumbnail?: any;
        id?: string;
        category_id?: string;
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

  return (
    <Layout>
      <div>
        <Helmet>
          <title>{`${post.title} | ${config.siteTitle}`}</title>
        </Helmet>
        <SEO postPath={slug} postNode={postNode} postSEO />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
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
          <div
            className="prose prose-lg max-w-none dark:prose-invert font-serif"
            dangerouslySetInnerHTML={{ __html: postNode.html }}
          />
          <div className="mt-8 pt-8 border-t border-border">
            <PostTags tags={post.tags} />
            <div className="mt-4">
              <SocialLinks postPath={slug} postNode={postNode} />
            </div>
          </div>
          <UserInfo config={config} />
        </div>
      </div>
    </Layout>
  );
}

export default PostTemplate;

/* eslint no-undef: "off" */
export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
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
  }
`;
