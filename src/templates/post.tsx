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

function PostTemplate({ data, pageContext }: PostTemplateProps): React.ReactElement {
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
        <div className="container">
          <header
            className={`single-header ${!thumbnail ? "no-thumbnail" : ""}`}
          >
            {thumbnail ? <GatsbyImage image={thumbnail} alt="" /> : null}
            <div>
              <h1>{post.title}</h1>
              <div className="post-meta">
                <time className="date">
                  By <strong>Sai Nimmagadda</strong> on {date}
                </time>
                <span>| {post.time} |</span>
                <a
                  className="github-link"
                  href={githubLink}
                  target="_blank"
                  rel="noreferrer"
                >
                  Edit on Github ✍️
                </a>
              </div>

              <PostTags tags={post.tags} />
            </div>
          </header>
          <div
            className="post-content"
            dangerouslySetInnerHTML={{ __html: postNode.html }}
          />
          <div className="post-meta">
            <PostTags tags={post.tags} />
            <SocialLinks postPath={slug} postNode={postNode} />
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
