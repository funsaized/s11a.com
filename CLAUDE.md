# CLAUDE.md - Personal Blog Project Rules

## Project Overview
This is a personal blog built with Gatsby, React, and TypeScript, hosted on Netlify. The site features blog posts, project listings, and notes, with a focus on clean code architecture and modern web development practices.

## Technology Stack
- **Frontend Framework**: Gatsby 5.x with React 18
- **Language**: TypeScript + JavaScript (mixed)
- **Styling**: SCSS with custom component architecture
- **Content**: Markdown with frontmatter
- **Build Tool**: Gatsby CLI
- **Hosting**: Netlify
- **Package Manager**: npm/yarn

## Code Quality & Standards

### TypeScript Guidelines
- **Prefer TypeScript** for new components and utilities
- Use proper interface definitions for all props and data structures
- Leverage Gatsby's built-in TypeScript support
- Example interface pattern:
```typescript
interface PostEdge {
  node: {
    fields: { slug: string; date: string };
    frontmatter: { title: string; tags: string[] };
  };
}
```

### React Component Patterns
- **Functional components with hooks** for new components
- Use React.memo() for performance optimization when appropriate
- Prefer destructuring props in function signatures
- Use proper TypeScript prop interfaces
- Example pattern:
```typescript
interface ComponentProps {
  data: PostData;
  expanded?: boolean;
}

function Component({ data, expanded = false }: ComponentProps): React.ReactElement {
  // Component logic
}
```

### File Organization
```
src/
├── components/          # Reusable UI components
│   ├── ComponentName/
│   │   ├── ComponentName.tsx
│   │   └── ComponentName.css (if needed)
├── layout/             # Layout components
├── pages/              # Gatsby pages
├── templates/          # Gatsby templates
├── styles/             # Global SCSS
│   ├── base/           # Variables, mixins, reset
│   ├── components/     # Component-specific styles
│   └── main.scss       # Main stylesheet
├── services/           # Utility functions
└── models/             # TypeScript interfaces
```

## Gatsby-Specific Patterns

### GraphQL Queries
- Use **page queries** for page-level data fetching
- Use **static queries** (useStaticQuery) for component-level data
- Always type GraphQL results with proper interfaces
- Example pattern:
```typescript
export const pageQuery = graphql`
  query BlogQuery {
    posts: allMarkdownRemark(
      sort: { fields: { date: DESC } }
      filter: { frontmatter: { type: { eq: "post" } } }
    ) {
      edges {
        node {
          fields { slug }
          frontmatter { title }
        }
      }
    }
  }
`;
```

### Content Management
- **Frontmatter schema** must include: title, date, slug, tags, category
- Use consistent date format: MM/DD/YYYY
- Content structure: `content/MM-DD-YYYY/index.md`
- Always include thumbnail images in appropriate sizes

### SEO & Performance
- Use gatsby-plugin-image for all images
- Implement proper SEO component with structured data
- Use Helmet for meta tags
- Optimize for Core Web Vitals

## Styling Guidelines

### SCSS Architecture
- Follow **component-based styling** approach
- Use variables from `src/styles/base/_variables.scss`
- Implement responsive design with mixins
- Example responsive pattern:
```scss
.component {
  // Mobile-first base styles
  
  @include small-breakpoint {
    // Tablet styles
  }
  
  @include large-breakpoint {
    // Desktop styles
  }
}
```

### Component Styling
- **CSS Modules or styled-components** for component isolation
- Use semantic class names
- Follow BEM methodology when applicable
- Maintain consistent spacing using defined variables

## Performance & Optimization

### Image Optimization
- Use **gatsby-plugin-image** for all images
- Implement proper alt text for accessibility
- Use appropriate image formats (WebP when possible)
- Example pattern:
```typescript
import { StaticImage, GatsbyImage, getImage } from "gatsby-plugin-image";

// For static images
<StaticImage src="path/to/image.jpg" alt="Description" />

// For dynamic images from GraphQL
const image = getImage(data.thumbnail);
{image && <GatsbyImage image={image} alt="Description" />}
```

### Code Splitting
- Leverage Gatsby's automatic code splitting
- Use dynamic imports for heavy components when appropriate
- Optimize bundle size with proper tree shaking

## Content Guidelines

### Blog Posts
- **Required frontmatter fields**:
```yaml
---
title: "Post Title"
slug: "post-slug"
date: "MM/DD/YYYY"
category: "Category"
categories: ["Category1", "Category2"]
tags: ["tag1", "tag2"]
thumbnail: "../thumbnails/image.png"
time: "X min"
type: "post"
---
```

### Markdown Best Practices
- Use proper heading hierarchy (h2, h3, etc.)
- Include code syntax highlighting with language specification
- Use responsive images with proper paths
- Link to external resources appropriately

## Development Workflow

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Serve production build
npm run serve
```

### Code Quality Checks
```bash
# ESLint with TypeScript support
npm run lint:js

# Fix linting issues
npm run lint:js:fix

# Format code with Prettier
npm run format:js
```

### Git Workflow
- Use conventional commit messages
- Test builds before pushing
- Verify Netlify preview deploys

## Deployment (Netlify)

### Build Configuration
- Build command: `npm run build`
- Publish directory: `public`
- Node version: `v22.4.1` (specified in .nvmrc)

### Environment Variables
- Set any required environment variables in Netlify dashboard
- Use gatsby-config.js for environment-specific configurations

## Common Patterns & Examples

### Creating New Blog Posts
1. Create new directory: `content/MM-DD-YYYY/`
2. Add `index.md` with proper frontmatter
3. Include images in same directory
4. Reference images with relative paths: `../images/image.png`

### Adding New Components
1. Create TypeScript component in `src/components/`
2. Define proper prop interfaces
3. Include CSS file if component-specific styles needed
4. Export from appropriate index file

### GraphQL Query Patterns
```typescript
// Page query for multiple posts
allMarkdownRemark(
  sort: { fields: { date: DESC } }
  filter: { frontmatter: { type: { eq: "post" } } }
) {
  edges {
    node {
      fields { slug, date }
      frontmatter { title, tags }
      excerpt
    }
  }
}
```

## Error Handling & Debugging

### Common Issues
- **Build failures**: Check markdown frontmatter syntax
- **GraphQL errors**: Verify field names and types
- **Image loading**: Ensure proper paths and formats
- **TypeScript errors**: Add proper type definitions

### Debugging Tools
- Gatsby's GraphQL explorer: `http://localhost:8000/___graphql`
- Browser DevTools for performance analysis
- Lighthouse for performance auditing

## Security Considerations
- Sanitize any user-generated content
- Use HTTPS for all external links
- Implement proper CSP headers via Netlify
- Regular dependency updates for security patches

## Accessibility Standards
- Use semantic HTML elements
- Implement proper ARIA labels
- Ensure keyboard navigation support
- Maintain color contrast ratios
- Test with screen readers

## Performance Targets
- **Lighthouse Score**: 90+ in all categories
- **Core Web Vitals**: LCP < 2.5s, FID < 100ms, CLS < 0.1
- **Bundle Size**: Keep JavaScript bundles under reasonable limits
- **Image Optimization**: Use appropriate formats and sizes

## Migration Guidelines
- When upgrading Gatsby: Follow official migration guides
- When adding new dependencies: Verify compatibility
- When refactoring: Maintain backward compatibility for content
- Always test builds after major changes