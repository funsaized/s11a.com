import React, { Component } from "react";
import Helmet from "react-helmet";
import { graphql } from "gatsby";
import Layout from "../layout";
import PostListing from "../components/PostListing/PostListing";
import SEO from "../components/SEO/SEO";
import config from "../../data/SiteConfig";

export default class BlogPage extends Component {
  constructor(props) {
    super(props);
    const { data } = props;
    this.state = {
      searchTerm: "",
      currentCategories: [],
      posts: data.posts.edges,
      filteredPosts: data.posts.edges,
    };
  }

  handleChange = (event) => {
    const { name, value } = event.target;

    this.setState({ [name]: value }, () => {
      this.filterPosts();
    });
  };

  filterPosts = () => {
    const { posts, searchTerm, currentCategories } = this.state;

    let filteredPosts = posts.filter((post) =>
      post.node.frontmatter.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
    );

    if (currentCategories.length > 0) {
      filteredPosts = filteredPosts.filter(
        (post) =>
          post.node.frontmatter.categories &&
          currentCategories.every((cat) =>
            post.node.frontmatter.categories.includes(cat),
          ),
      );
    }

    this.setState({ filteredPosts });
  };

  updateCategories = (category) => {
    const { currentCategories } = this.state;

    if (!currentCategories.includes(category)) {
      this.setState((prevState) => ({
        currentCategories: [...prevState.currentCategories, category],
      }));
    } else {
      this.setState((prevState) => ({
        currentCategories: prevState.currentCategories.filter(
          (cat) => category !== cat,
        ),
      }));
    }
  };

  handleCategoryClick = (categoryValue) => {
    this.updateCategories(categoryValue);
    setTimeout(() => {
      this.filterPosts();
    }, 0);
  };

  handleKeyDown = (event, categoryValue) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      this.handleCategoryClick(categoryValue);
    }
  };

  render() {
    const { data } = this.props;
    const { filteredPosts, searchTerm, currentCategories } = this.state;
    const filterCount = filteredPosts.length;
    const categories = data.categories.group;

    return (
      <Layout>
        <Helmet title={`Articles – ${config.siteTitle}`} />
        <SEO />
        <div className="container">
          <h1>Articles</h1>
          <div className="category-container">
            {categories.map((category) => {
              const active = currentCategories.includes(category.fieldValue);

              return (
                <div
                  className={`category-filter ${active ? "active" : ""}`}
                  key={category.fieldValue}
                  role="button"
                  tabIndex={0}
                  onClick={() => this.handleCategoryClick(category.fieldValue)}
                  onKeyDown={(event) =>
                    this.handleKeyDown(event, category.fieldValue)
                  }
                >
                  {category.fieldValue}
                </div>
              );
            })}
          </div>
          <div className="search-container">
            <input
              className="search"
              type="text"
              name="searchTerm"
              value={searchTerm}
              placeholder="Type here to filter posts..."
              onChange={this.handleChange}
            />
            <div className="filter-count">{filterCount}</div>
          </div>
          <PostListing postEdges={filteredPosts} expanded />
        </div>
      </Layout>
    );
  }
}

export const pageQuery = graphql`
  query BlogQuery {
    posts: allMarkdownRemark(
      limit: 2000
      sort: { fields: { date: DESC } }
      filter: { frontmatter: { type: { eq: "post" } } }
    ) {
      edges {
        node {
          fields {
            slug
            date
          }
          excerpt(pruneLength: 180)
          timeToRead
          frontmatter {
            title
            tags
            categories
            thumbnail {
              childImageSharp {
                gatsbyImageData(layout: FIXED, width: 70, height: 70)
              }
            }
            date
          }
        }
      }
    }
    categories: allMarkdownRemark(limit: 2000) {
      group(field: { frontmatter: { categories: SELECT } }) {
        fieldValue
        totalCount
      }
    }
  }
`;
