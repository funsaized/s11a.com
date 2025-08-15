import { PostEdge, RelatedPost } from "../models";

/**
 * Calculate similarity between two posts based on tags and category
 */
function calculateSimilarity(
  currentTags: string[],
  currentCategory: string | undefined,
  otherTags: string[],
  otherCategory: string | undefined
): number {
  let score = 0;

  // Tag similarity (weighted at 70%)
  if (currentTags.length > 0 && otherTags.length > 0) {
    const currentTagSet = new Set(currentTags.map(tag => tag.toLowerCase()));
    const otherTagSet = new Set(otherTags.map(tag => tag.toLowerCase()));
    
    const intersection = new Set([...currentTagSet].filter(tag => otherTagSet.has(tag)));
    const union = new Set([...currentTagSet, ...otherTagSet]);
    
    const jaccardSimilarity = intersection.size / union.size;
    score += jaccardSimilarity * 0.7;
  }

  // Category similarity (weighted at 30%)
  if (currentCategory && otherCategory) {
    if (currentCategory.toLowerCase() === otherCategory.toLowerCase()) {
      score += 0.3;
    }
  }

  return score;
}

/**
 * Find related posts based on tag and category similarity
 */
export function findRelatedPosts(
  currentPost: {
    slug: string;
    tags: string[];
    category?: string;
  },
  allPosts: PostEdge[],
  limit: number = 4
): RelatedPost[] {
  // Filter out the current post and calculate similarity scores
  const relatedPosts = allPosts
    .filter((edge) => edge.node.fields.slug !== currentPost.slug)
    .map((edge) => {
      const similarity = calculateSimilarity(
        currentPost.tags,
        currentPost.category,
        edge.node.frontmatter.tags,
        edge.node.frontmatter.category
      );

      return {
        slug: edge.node.fields.slug,
        title: edge.node.frontmatter.title,
        excerpt: edge.node.excerpt,
        thumbnail: edge.node.frontmatter.thumbnail?.childImageSharp?.gatsbyImageData,
        tags: edge.node.frontmatter.tags,
        timeToRead: edge.node.timeToRead,
        date: edge.node.fields.date,
        similarity,
      };
    })
    .filter((post) => post.similarity > 0) // Only include posts with some similarity
    .sort((a, b) => b.similarity - a.similarity) // Sort by similarity (highest first)
    .slice(0, limit);

  // If we don't have enough related posts, fill with recent posts
  if (relatedPosts.length < limit) {
    const recentPosts = allPosts
      .filter((edge) => edge.node.fields.slug !== currentPost.slug)
      .filter((edge) => !relatedPosts.some(rp => rp.slug === edge.node.fields.slug))
      .sort((a, b) => new Date(b.node.fields.date).getTime() - new Date(a.node.fields.date).getTime())
      .slice(0, limit - relatedPosts.length)
      .map((edge) => ({
        slug: edge.node.fields.slug,
        title: edge.node.frontmatter.title,
        excerpt: edge.node.excerpt,
        thumbnail: edge.node.frontmatter.thumbnail?.childImageSharp?.gatsbyImageData,
        tags: edge.node.frontmatter.tags,
        timeToRead: edge.node.timeToRead,
        date: edge.node.fields.date,
        similarity: 0,
      }));

    relatedPosts.push(...recentPosts);
  }

  return relatedPosts;
}

/**
 * Format reading time for display
 */
export function formatReadingTime(timeToRead: number): string {
  return timeToRead === 1 ? "1 min read" : `${timeToRead} min read`;
}

/**
 * Format date for display
 */
export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return "Today";
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}