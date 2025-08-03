import React from "react";
import { Link } from "gatsby";
import kebabCase from "lodash.kebabcase";

interface PostTagsProps {
  tags: string[];
}

function PostTags({ tags }: PostTagsProps): React.ReactElement {
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

export default PostTags;
