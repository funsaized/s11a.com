// Content discovery interfaces

export interface PostNode {
  fields: {
    slug: string;
    date: string;
  };
  frontmatter: {
    title: string;
    tags: string[];
    category?: string;
    cover?: string;
    date: string;
    thumbnail?: {
      childImageSharp: {
        gatsbyImageData: any;
      };
    };
  };
  excerpt: string;
  timeToRead: number;
  html?: string;
}

export interface PostEdge {
  node: PostNode;
}

export interface RelatedPost {
  slug: string;
  title: string;
  excerpt: string;
  thumbnail?: any;
  tags: string[];
  timeToRead: number;
  date: string;
  similarity: number; // 0-1 score for relevance
}

export interface TableOfContentsHeading {
  id: string;
  title: string;
  level: number; // h1=1, h2=2, h3=3, etc.
  children?: TableOfContentsHeading[];
}

export interface TableOfContentsProps {
  headings: TableOfContentsHeading[];
  activeId?: string;
  className?: string;
}

export interface ReadingProgressProps {
  target?: string; // CSS selector for content element
  className?: string;
}

export interface RelatedPostsProps {
  currentPost: {
    slug: string;
    tags: string[];
    category?: string;
  };
  allPosts: PostEdge[];
  limit?: number;
  className?: string;
}

export interface BackToTopProps {
  threshold?: number; // Scroll threshold to show button
  className?: string;
}

export interface PostNavigationProps {
  previous?: {
    slug: string;
    title: string;
  };
  next?: {
    slug: string;
    title: string;
  };
  className?: string;
}

export interface EnhancedPostListingProps {
  postEdges: PostEdge[];
  expanded?: boolean;
  simple?: boolean;
  showExcerpt?: boolean;
  showTags?: boolean;
  showReadingTime?: boolean;
  className?: string;
}

export interface ContentDiscoveryConfig {
  relatedPostsLimit: number;
  tocDepth: number; // Maximum heading level to include
  progressTarget: string; // CSS selector for content
  backToTopThreshold: number;
  smoothScrollDuration: number;
}
