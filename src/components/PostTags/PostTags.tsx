import React from "react";
import { Link } from "gatsby";
import kebabCase from "lodash.kebabcase";
import { Badge } from "@/components/ui/badge";

interface PostTagsProps {
  tags: string[];
}

function PostTags({ tags }: PostTagsProps): React.ReactElement {
  return (
    <div className="flex flex-wrap gap-1.5 sm:gap-2">
      {tags &&
        tags.map((tag) => (
          <Link
            key={tag}
            to={`/tags/${kebabCase(tag)}`}
            className="no-underline"
          >
            <Badge
              variant="secondary"
              className="hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
            >
              {tag}
            </Badge>
          </Link>
        ))}
    </div>
  );
}

export default PostTags;
