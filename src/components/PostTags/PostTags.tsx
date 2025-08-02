import React, { Component } from "react";
import { Link } from "gatsby";
import kebabCase from "lodash.kebabcase";

type Props = {
  tags: string[];
};

// eslint-disable-next-line react/prefer-stateless-function
class PostTags extends Component<Props, {}> {
  render() {
    const { tags } = this.props;
    return (
      <div className="post-tag-container">
        {tags &&
          tags.map((tag) => (
            <Link
              key={tag}
              style={{ textDecoration: "none" }}
              to={`/tags/${kebabCase(tag)}`}
            >
              <button type="button">{tag}</button>
            </Link>
          ))}
      </div>
    );
  }
}

export default PostTags;
