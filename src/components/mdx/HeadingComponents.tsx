import React from "react";

// Utility function to create URL-friendly slugs from heading text
function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .trim()
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

interface HeadingProps {
  children: React.ReactNode;
  id?: string;
}

const createHeadingComponent = (
  Tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6",
) => {
  return function HeadingComponent({
    children,
    id,
    ...props
  }: HeadingProps & React.HTMLAttributes<HTMLHeadingElement>) {
    // Generate ID from text content if not provided
    const textContent = typeof children === "string" ? children : "";
    const headingId = id || createSlug(textContent);

    return (
      <Tag id={headingId} {...props}>
        {children}
      </Tag>
    );
  };
};

// Export heading components
export const H1 = createHeadingComponent("h1");
export const H2 = createHeadingComponent("h2");
export const H3 = createHeadingComponent("h3");
export const H4 = createHeadingComponent("h4");
export const H5 = createHeadingComponent("h5");
export const H6 = createHeadingComponent("h6");

// Component map for MDXProvider
export const headingComponents = {
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
  h5: H5,
  h6: H6,
};
