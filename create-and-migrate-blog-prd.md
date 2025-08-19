# Product Requirements Document (PRD)
## Blog Migration & Modernization: s11a.com

### Executive Summary
This PRD outlines a comprehensive process for creating a modern blog platform based on the existing s11a.com, leveraging the latest web technologies while maintaining content integrity and improving user experience.

---

## 1. Project Overview

### 1.1 Objective
Create a modern, performant blog platform that:
- Preserves all existing content from the current s11a.com
- Implements a contemporary design system using Tailwind CSS v3 and shadcn/ui
- Utilizes the latest Gatsby.js framework capabilities
- Enhances user experience with modern UI/UX patterns
- Maintains SEO optimization and accessibility standards

### 1.2 Core Technologies
- **Framework**: Gatsby.js (latest stable version - v5.x)
- **Styling**: Tailwind CSS v3.x + shadcn/ui components
- **Language**: TypeScript
- **Content**: MDX for enhanced markdown capabilities
- **Deployment**: Netlify (maintaining current hosting)

---

## 2. Information Architecture

### 2.1 Page Structure

```
/
├── Home (index)
├── About (/about)
├── Articles (/articles)
│   ├── Article List with Search & Filters
│   └── Article Detail (/articles/[slug])
├── Projects (/projects) - optional dedicated page
└── RSS Feed (/rss.xml)
```

### 2.2 Content Types

#### Blog Post Schema
```typescript
interface BlogPost {
  // Frontmatter
  title: string
  slug: string
  date: string // ISO format
  category: string
  categories: string[]
  tags: string[]
  thumbnail?: string
  cover?: string
  time: string // reading time
  type: 'post' | 'note'
  
  // Content
  content: MDX
  excerpt: string
  
  // Metadata
  lastModified?: string
  featured?: boolean
}
```

#### Project Schema
```typescript
interface Project {
  title: string
  description: string
  icon: string | React.Component
  github: string
  demo?: string
  technologies: string[]
  featured?: boolean
  status: 'active' | 'archived' | 'in-progress'
  stars?: number
  forks?: number
}
```

---

## 3. Design Requirements

### 3.1 Home Page
Based on the home.png reference:

**Hero Section**
- Clean, minimal introduction with author name
- Professional tagline about expertise
- Brief bio emphasizing healthcare tech and full-stack development
- Social links (GitHub, LinkedIn, Twitter)
- CTA button to view articles or browse projects

**Recent Articles Section**
- Card-based layout showing 3-4 recent posts
- Each card displays:
  - Category icon and label
  - Title (prominent, clickable)
  - Brief excerpt (2-3 lines)
  - Metadata row: reading time, date published
  - Subtle hover effects with scale and shadow
  - Tag badges (limit to 2-3)

**Projects Showcase**
- Grid layout (2-3 columns on desktop, 1 on mobile)
- Each project card includes:
  - Project name with icon
  - Brief description (1-2 lines)
  - Technology stack (small badges)
  - GitHub stats (stars, forks)
  - Two action buttons: "Source" and "Demo"
  - Status indicator (active/archived)

### 3.2 About Page
Based on about.png reference:

**Profile Section**
- Professional headshot or avatar
- Name: Sai Nimmagadda
- Title: Full-Stack Engineer • Healthcare
- Location: NC, USA
- Social media links with icons

**Bio Section**
- Educational background (Duke BSE)
- Professional experience focus
- Current role and interests
- Mission statement about open source

**Skills & Technologies**
- Categorized sections:
  - **Languages**: Node.js, Java, Go, Python, TypeScript
  - **Frontend**: React, Gatsby, Vue, CSS/SCSS
  - **Backend**: Spring, Express, GraphQL
  - **Cloud**: AWS, Azure, GCP, Kubernetes
  - **Databases**: MySQL, PostgreSQL, MongoDB, Cosmos DB

**Current Activities**
- "What I'm up to" section with cards:
  - Learning Golang
  - DS & Algorithms practice
  - Mechanical keyboards (QMK)
  - Current projects with icons

### 3.3 Articles Page
Modern search and filter interface:

**Search Bar**
- Full-width search input with icon
- Placeholder: "Search articles..."
- Real-time filtering as user types
- Clear button when text present
- Result count display

**Filter System**
- Category pills (horizontal scroll on mobile)
  - All, Node.js, Java, Database, Go, Serverless, Tools
  - Active state with different color
  - Count badge per category
- Tag cloud or multi-select dropdown
- Sort dropdown: Latest, Oldest, Most Read, Alphabetical

**Article List**
- List view by default (option for grid)
- Article cards containing:
  - Thumbnail (if available)
  - Title as main link
  - Excerpt (first 150 chars)
  - Category badge with color coding
  - Author • Date • X min read
  - 2-3 main tags as small badges

### 3.4 Article Detail Page
Based on article.png reference:

**Article Header**
- Breadcrumb navigation (Home > Articles > Current)
- Cover image (if available) with caption
- H1 title
- Author avatar and name
- Publication date • Reading time
- Category badge (colored)
- Share buttons (Twitter, LinkedIn, Copy Link)

**Table of Contents (Desktop)**
- Sticky sidebar (right side on desktop)
- Auto-generated from h2, h3 headings
- Current section highlighted
- Smooth scroll on click
- Progress indicator bar
- "Back to top" button

**Table of Contents (Mobile)**
- Collapsible drawer/accordion
- Fixed bottom button to open
- Same functionality as desktop

**Content Area**
- Typography optimized for readability:
  - Font: System font stack
  - Size: 18px body text
  - Line height: 1.7
  - Max width: 720px
  - Paragraph spacing: 1.5rem
- Code blocks with:
  - Syntax highlighting (Prism.js)
  - Language label
  - Copy button
  - Line numbers (optional)
  - Dark theme for code
- Images:
  - Responsive with aspect ratio preserved
  - Lazy loading
  - Click to expand/lightbox
  - Alt text and captions
- Special blocks:
  - Info/Warning/Success callouts
  - Blockquotes with citation
  - Tables with responsive scroll

**Article Footer**
- Author bio box with social links
- Related articles (2-3 suggestions)
- Previous/Next article navigation
- Comment system (optional - Giscus/Disqus)
- "Edit on GitHub" link

---

## 4. Technical Implementation Guide

### 4.1 Project Setup Instructions

```markdown
# LLM Prompt for Initial Setup

Create a new Gatsby.js v5 project with TypeScript and the following configuration:

## Installation Commands:
```bash
# Create new Gatsby site
npm init gatsby -ts

# Navigate to project
cd s11a-blog

# Install Tailwind CSS v3
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Install shadcn/ui dependencies
npm install class-variance-authority clsx tailwind-merge
npm install @radix-ui/react-* (as needed)

# Install MDX and plugins
npm install gatsby-plugin-mdx @mdx-js/react
npm install gatsby-remark-images gatsby-remark-prismjs prismjs

# Additional Gatsby plugins
npm install gatsby-plugin-image gatsby-plugin-sharp gatsby-transformer-sharp
npm install gatsby-plugin-sitemap gatsby-plugin-robots-txt
npm install gatsby-plugin-manifest gatsby-plugin-offline
npm install gatsby-plugin-feed gatsby-plugin-google-gtag
```

## Configuration Files:

### gatsby-config.ts
```typescript
import type { GatsbyConfig } from "gatsby"

const config: GatsbyConfig = {
  siteMetadata: {
    title: `Sai Nimmagadda`,
    siteUrl: `https://s11a.com`,
    description: `Full-stack engineer focused on healthcare, developer experience, and scalable systems.`,
    author: `@FunSaized`,
  },
  plugins: [
    `gatsby-plugin-image`,
    `gatsby-plugin-sharp`,
    `gatsby-transformer-sharp`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `content`,
        path: `${__dirname}/content/`,
      },
    },
    {
      resolve: `gatsby-plugin-mdx`,
      options: {
        extensions: [`.md`, `.mdx`],
        gatsbyRemarkPlugins: [
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 1200,
              quality: 90,
            },
          },
          {
            resolve: `gatsby-remark-prismjs`,
            options: {
              classPrefix: "language-",
              inlineCodeMarker: null,
              aliases: {},
              showLineNumbers: false,
              noInlineHighlight: false,
            },
          },
        ],
      },
    },
    `gatsby-plugin-sitemap`,
    `gatsby-plugin-robots-txt`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `s11a.com - Sai Nimmagadda`,
        short_name: `s11a`,
        start_url: `/`,
        background_color: `#ffffff`,
        theme_color: `#000000`,
        display: `minimal-ui`,
        icon: `src/images/icon.png`,
      },
    },
  ],
}

export default config
```

### tailwind.config.js
```javascript
module.exports = {
  content: [
    "./src/pages/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      typography: (theme) => ({
        DEFAULT: {
          css: {
            maxWidth: '720px',
            color: theme('colors.gray.700'),
            // Custom typography styles
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
}
```
```

### 4.2 Component Architecture

```typescript
// Core Components Structure
src/
├── components/
│   ├── layout/
│   │   ├── Layout.tsx
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Navigation.tsx
│   │   └── SEO.tsx
│   ├── home/
│   │   ├── Hero.tsx
│   │   ├── RecentArticles.tsx
│   │   ├── ArticleCard.tsx
│   │   └── ProjectShowcase.tsx
│   ├── articles/
│   │   ├── ArticleList.tsx
│   │   ├── ArticleCard.tsx
│   │   ├── SearchBar.tsx
│   │   ├── CategoryFilter.tsx
│   │   ├── TagCloud.tsx
│   │   └── SortDropdown.tsx
│   ├── article/
│   │   ├── ArticleHeader.tsx
│   │   ├── ArticleContent.tsx
│   │   ├── TableOfContents.tsx
│   │   ├── AuthorBio.tsx
│   │   ├── RelatedArticles.tsx
│   │   └── ShareButtons.tsx
│   ├── about/
│   │   ├── ProfileSection.tsx
│   │   ├── SkillsGrid.tsx
│   │   ├── CurrentActivities.tsx
│   │   └── Timeline.tsx
│   ├── ui/ (shadcn components)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   └── dropdown-menu.tsx
│   └── mdx/
│       ├── CodeBlock.tsx
│       ├── Callout.tsx
│       ├── Image.tsx
│       └── Table.tsx
├── pages/
│   ├── index.tsx
│   ├── about.tsx
│   ├── articles.tsx
│   └── 404.tsx
├── templates/
│   ├── article.tsx
│   └── tag.tsx
├── hooks/
│   ├── useSearch.ts
│   ├── useTableOfContents.ts
│   └── useTheme.ts
├── utils/
│   ├── cn.ts (className utility)
│   ├── formatDate.ts
│   └── readingTime.ts
└── styles/
    ├── globals.css
    ├── prism-theme.css
    └── mdx.css
```

### 4.3 Migration Process

```markdown
# Step-by-Step Migration Instructions for LLM

## Phase 1: Content Extraction
```javascript
// 1. Create content inventory script
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

function extractContent() {
  const contentDir = './content';
  const articles = [];
  
  // Read all markdown files
  const files = fs.readdirSync(contentDir);
  
  files.forEach(dir => {
    const mdPath = path.join(contentDir, dir, 'index.md');
    if (fs.existsSync(mdPath)) {
      const content = fs.readFileSync(mdPath, 'utf8');
      const { data, content: body } = matter(content);
      
      articles.push({
        ...data,
        body,
        originalPath: mdPath,
        images: extractImages(body)
      });
    }
  });
  
  return articles;
}
```

## Phase 2: Content Transformation
```javascript
// 2. Transform to MDX format
function transformToMDX(article) {
  let content = article.body;
  
  // Update image paths
  content = content.replace(
    /!\[([^\]]*)\]\(\.\.\/images\/([^)]+)\)/g,
    '![](./images/)'
  );
  
  // Add MDX components
  content = addMDXComponents(content);
  
  // Update frontmatter
  const frontmatter = {
    ...article,
    date: new Date(article.date).toISOString(),
    lastModified: new Date().toISOString()
  };
  
  return { frontmatter, content };
}
```

## Phase 3: Asset Migration
```javascript
// 3. Optimize and move images
const sharp = require('sharp');

async function optimizeImages(imagePath) {
  const outputDir = './public/images/optimized';
  
  await sharp(imagePath)
    .resize(1200, null, { withoutEnlargement: true })
    .jpeg({ quality: 90, progressive: true })
    .toFile(path.join(outputDir, filename));
}
```

## Phase 4: Data Integration
```javascript
// 4. Create GraphQL queries
export const query = graphql`
  query ArticleBySlug($slug: String!) {
    mdx(frontmatter: { slug: { eq: $slug } }) {
      body
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
        category
        tags
        thumbnail {
          childImageSharp {
            gatsbyImageData(layout: FULL_WIDTH)
          }
        }
      }
      tableOfContents
      timeToRead
    }
  }
`;
```
```

---

## 5. Feature Specifications

### 5.1 Core Features

**Search Functionality**
```typescript
// Implementation using Fuse.js
import Fuse from 'fuse.js';

const searchOptions = {
  keys: ['title', 'excerpt', 'tags', 'category'],
  threshold: 0.3,
  includeScore: true,
  includeMatches: true
};

function useSearch(articles: Article[]) {
  const [query, setQuery] = useState('');
  const fuse = new Fuse(articles, searchOptions);
  
  const results = query ? fuse.search(query) : articles;
  return { query, setQuery, results };
}
```

**Theme System**
```typescript
// Light/Dark/System theme with persistence
const ThemeContext = createContext<ThemeContextType>();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  
  useEffect(() => {
    const stored = localStorage.getItem('theme');
    if (stored) setTheme(stored);
    
    // Apply theme class to document
    const root = document.documentElement;
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    } else {
      root.classList.toggle('dark', theme === 'dark');
    }
  }, [theme]);
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

**Performance Optimizations**
- Gatsby Image for automatic optimization
- Code splitting with React.lazy()
- Prefetch links with gatsby-plugin-prefetch
- Service worker via gatsby-plugin-offline
- Font optimization with font-display: swap

**SEO & Meta**
```typescript
// SEO Component
export function SEO({ title, description, image, article }) {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:type" content={article ? 'article' : 'website'} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:creator" content="@FunSaized" />
      
      {/* JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
}
```

### 5.2 Interactive Elements

**Dynamic Table of Contents**
```typescript
function TableOfContents({ headings }) {
  const [activeId, setActiveId] = useState('');
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '0px 0px -80% 0px' }
    );
    
    headings.forEach(heading => {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    });
    
    return () => observer.disconnect();
  }, [headings]);
  
  return (
    <nav className="toc">
      <h3>Table of Contents</h3>
      <ul>
        {headings.map(heading => (
          <li key={heading.id} className={activeId === heading.id ? 'active' : ''}>
            <a href={`#${heading.id}`}>{heading.text}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

**Code Block with Copy Button**
```typescript
function CodeBlock({ children, language }) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="code-block">
      <div className="code-header">
        <span className="language">{language}</span>
        <button onClick={handleCopy}>
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className={`language-${language}`}>
        <code>{children}</code>
      </pre>
    </div>
  );
}
```

---

## 6. Development Workflow

### 6.1 LLM Interaction Process

```markdown
## Prompt Sequence for LLM Implementation

### Session 1: Foundation
"Using the provided PRD and existing s11a.com blog codebase as reference, create a new Gatsby v5 project with:
- TypeScript configuration
- Tailwind CSS v3 setup
- shadcn/ui component library integration
- Basic folder structure as specified
Include all configuration files and explain the setup process."

### Session 2: Layout & Navigation
"Create the core layout components:
1. Layout wrapper with consistent header/footer
2. Responsive navigation with mobile menu
3. Theme toggle (light/dark/system)
4. SEO component with meta tags
Reference the existing Navigation and Layout components for functionality."

### Session 3: Home Page
"Build the home page with these sections:
1. Hero section with intro and social links
2. Recent articles grid (3-4 posts)
3. Projects showcase with GitHub stats
Use the design specifications from the PRD and make it responsive."

### Session 4: Articles System
"Implement the articles listing page with:
1. Real-time search using Fuse.js
2. Category and tag filtering
3. Sort options (date, reading time)
4. Responsive article cards
Include pagination or infinite scroll."

### Session 5: Article Detail Template
"Create the article detail page with:
1. Dynamic table of contents
2. Syntax highlighting for code blocks
3. Share buttons and author bio
4. Related articles section
Ensure MDX support and responsive images."

### Session 6: Content Migration
"Write migration scripts to:
1. Extract content from existing markdown files
2. Transform frontmatter to new schema
3. Optimize and relocate images
4. Generate redirect mappings
Test with sample content first."

### Session 7: Performance & SEO
"Optimize the site for performance:
1. Implement lazy loading for images
2. Add progressive web app features
3. Configure sitemap and robots.txt
4. Set up structured data
5. Add analytics integration
Target 95+ Lighthouse scores."

### Session 8: Testing & Deployment
"Prepare for production:
1. Set up Netlify configuration
2. Create build scripts
3. Configure environment variables
4. Test all functionality
5. Set up redirects from old URLs
Provide deployment checklist."
```

### 6.2 Quality Assurance Checklist

**Content Validation**
- [ ] All 74+ articles migrated successfully
- [ ] Images properly optimized and displayed
- [ ] Internal links updated and working
- [ ] Code blocks with syntax highlighting
- [ ] Frontmatter validated against schema

**Functionality Testing**
- [ ] Search returns relevant results
- [ ] Filters work correctly
- [ ] Table of contents tracks scroll position
- [ ] Theme toggle persists preference
- [ ] Share buttons functional
- [ ] RSS feed generates correctly

**Performance Metrics**
- [ ] Lighthouse Performance: 95+
- [ ] Lighthouse Accessibility: 100
- [ ] Lighthouse Best Practices: 100
- [ ] Lighthouse SEO: 100
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3.5s

**Cross-browser Testing**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers

**Responsive Design**
- [ ] Mobile (320px - 768px)
- [ ] Tablet (768px - 1024px)
- [ ] Desktop (1024px+)
- [ ] All images responsive
- [ ] Navigation works on all sizes

---

## 7. Content Migration Strategy

### 7.1 Content Audit Template

```markdown
## Content Inventory

### Articles (74+ posts)
- Technical tutorials: ~40
- Project showcases: ~10
- "Things I Googled": ~15
- Other posts: ~9

### Categories
- Code
- Frontend
- Backend
- Cloud
- Data
- Personal
- ThingsIGoogled

### Static Assets
- Images: ~150 files
- Code snippets: Embedded in markdown
- External links: To be validated

### URL Structure
Current: /[slug]
New: /articles/[slug]
Redirects needed: Yes
```

### 7.2 Migration Script

```typescript
// Complete migration script
import fs from 'fs-extra';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

interface MigrationOptions {
  sourceDir: string;
  targetDir: string;
  imageDir: string;
  redirectsFile: string;
}

class ContentMigrator {
  private redirects: Map<string, string> = new Map();
  
  constructor(private options: MigrationOptions) {}
  
  async migrate() {
    console.log('Starting content migration...');
    
    // 1. Ensure target directories exist
    await this.ensureDirectories();
    
    // 2. Get all content files
    const files = await this.getContentFiles();
    
    // 3. Process each file
    for (const file of files) {
      await this.processFile(file);
    }
    
    // 4. Generate redirects file
    await this.generateRedirects();
    
    console.log(`Migration complete! Processed ${files.length} files.`);
  }
  
  private async processFile(filePath: string) {
    const content = await fs.readFile(filePath, 'utf8');
    const { data: frontmatter, content: body } = matter(content);
    
    // Transform frontmatter
    const newFrontmatter = this.transformFrontmatter(frontmatter);
    
    // Process images
    const processedBody = await this.processImages(body, path.dirname(filePath));
    
    // Create MDX file
    const mdxContent = this.createMDX(newFrontmatter, processedBody);
    
    // Write to target
    const targetPath = this.getTargetPath(frontmatter.slug);
    await fs.writeFile(targetPath, mdxContent);
    
    // Add redirect
    this.redirects.set(
      `/${frontmatter.slug}`,
      `/articles/${frontmatter.slug}`
    );
  }
  
  private transformFrontmatter(old: any) {
    return {
      title: old.title,
      slug: old.slug,
      date: new Date(old.date).toISOString(),
      category: old.category,
      categories: old.categories || [old.category],
      tags: old.tags || [],
      thumbnail: old.thumbnail,
      cover: old.cover,
      time: old.time,
      type: old.type || 'post',
      excerpt: old.excerpt || '',
      featured: false,
      lastModified: new Date().toISOString()
    };
  }
  
  private async processImages(content: string, contentDir: string) {
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    let processed = content;
    
    const matches = content.matchAll(imageRegex);
    for (const match of matches) {
      const [full, alt, src] = match;
      
      if (src.startsWith('../images/')) {
        // Copy and optimize image
        const imageName = path.basename(src);
        const sourcePath = path.join(contentDir, src);
        const targetPath = path.join(this.options.imageDir, imageName);
        
        await this.optimizeImage(sourcePath, targetPath);
        
        // Update path in content
        processed = processed.replace(
          full,
          `![${alt}](/images/${imageName})`
        );
      }
    }
    
    return processed;
  }
  
  private async optimizeImage(source: string, target: string) {
    // Use sharp or similar for optimization
    // For now, just copy
    await fs.copy(source, target);
  }
  
  private createMDX(frontmatter: any, body: string) {
    const yamlFrontmatter = Object.entries(frontmatter)
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
      .join('\n');
    
    return `---
${yamlFrontmatter}
---

${body}`;
  }
  
  private async generateRedirects() {
    const redirectsContent = Array.from(this.redirects.entries())
      .map(([from, to]) => `${from} ${to} 301`)
      .join('\n');
    
    await fs.writeFile(this.options.redirectsFile, redirectsContent);
  }
}

// Usage
const migrator = new ContentMigrator({
  sourceDir: './content',
  targetDir: './new-site/content',
  imageDir: './new-site/static/images',
  redirectsFile: './new-site/static/_redirects'
});

migrator.migrate().catch(console.error);
```

---

## 8. Deployment & Launch

### 8.1 Netlify Configuration

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "public"

[build.environment]
  NODE_VERSION = "18"
  GATSBY_CPU_COUNT = "2"

[[plugins]]
  package = "@netlify/plugin-gatsby"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

# Redirects from old site structure
[[redirects]]
  from = "/old-path"
  to = "/new-path"
  status = 301
```

### 8.2 Environment Variables

```bash
# .env.production
GATSBY_SITE_URL=https://s11a.com
GATSBY_GA_TRACKING_ID=G-XXXXXXXXXX
GATSBY_GITHUB_TOKEN=ghp_xxxxxxxxxxxx
GATSBY_DISQUS_NAME=s11a-com
```

### 8.3 Pre-launch Checklist

**Technical Validation**
- [ ] Build succeeds locally
- [ ] Build succeeds on Netlify
- [ ] All pages load without errors
- [ ] No broken links (use link checker)
- [ ] Images load and are optimized
- [ ] Forms work (if applicable)

**SEO Validation**
- [ ] Meta tags present on all pages
- [ ] Sitemap generates correctly
- [ ] Robots.txt configured
- [ ] Structured data validates
- [ ] Social sharing previews work

**Performance Validation**
- [ ] Run Lighthouse audit
- [ ] Test on slow 3G connection
- [ ] Verify lazy loading works
- [ ] Check bundle sizes
- [ ] Test offline functionality

**Content Validation**
- [ ] All articles migrated
- [ ] Images display correctly
- [ ] Code syntax highlighting works
- [ ] Links are updated
- [ ] Redirects work

### 8.4 Launch Process

```markdown
## Launch Day Checklist

### T-24 Hours
- [ ] Final content freeze on old site
- [ ] Complete backup of old site
- [ ] Test deployment on staging URL
- [ ] Verify all redirects

### T-2 Hours
- [ ] Final build and deploy
- [ ] Test critical user paths
- [ ] Verify analytics tracking
- [ ] Check error monitoring

### T-0 Launch
- [ ] Update DNS records
- [ ] Monitor for 404s
- [ ] Check SSL certificate
- [ ] Verify search console

### T+24 Hours
- [ ] Review analytics data
- [ ] Check for crawl errors
- [ ] Monitor performance metrics
- [ ] Address any user feedback
```

---

## 9. Success Metrics & Monitoring

### 9.1 Key Performance Indicators

**Technical Metrics**
- Page Load Time: < 2 seconds
- Time to Interactive: < 3.5 seconds
- Lighthouse Score: > 95
- Core Web Vitals: All green
- Uptime: > 99.9%

**User Engagement**
- Bounce Rate: < 40%
- Average Session Duration: > 2 minutes
- Pages per Session: > 2
- Return Visitor Rate: > 30%

**Content Metrics**
- Search Success Rate: > 80%
- Article Completion Rate: > 60%
- Share Rate: > 5%
- Comment Engagement: > 2%

### 9.2 Monitoring Setup

```javascript
// Analytics setup
export function initAnalytics() {
  // Google Analytics 4
  if (typeof window !== 'undefined') {
    window.gtag('config', process.env.GATSBY_GA_TRACKING_ID, {
      page_path: window.location.pathname,
    });
  }
  
  // Custom events
  trackEvent('page_view', {
    page_title: document.title,
    page_location: window.location.href,
  });
}

// Error tracking
export function initErrorTracking() {
  window.addEventListener('error', (event) => {
    trackEvent('javascript_error', {
      message: event.message,
      source: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });
}

// Performance monitoring
export function initPerformanceMonitoring() {
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        trackEvent('performance_metric', {
          name: entry.name,
          value: entry.startTime,
          metric_type: entry.entryType,
        });
      }
    });
    
    observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
  }
}
```

---

## 10. Appendix: LLM Implementation Guide

### 10.1 Context Management Strategy

```markdown
## How to Work with LLM for This Project

### Initial Context Setup
Always provide in first prompt:
1. This PRD document
2. Current tech stack details
3. Specific component from old site as reference
4. Clear success criteria

### Progressive Implementation
Break down into focused sessions:
- Session length: 1-2 hours per component
- Always save working code between sessions
- Test each component before moving forward
- Document decisions and rationale

### Example Prompt Structure
```
"I'm migrating my blog s11a.com to a modern stack. 
Current component: [paste existing code]
Requirements: [specific from PRD section]
Tech stack: Gatsby 5, TypeScript, Tailwind CSS v3, shadcn/ui

Please create a modern version that:
1. [Specific requirement 1]
2. [Specific requirement 2]
3. [Specific requirement 3]

Include complete implementation with explanations."
```
```

### 10.2 Common Patterns & Solutions

```typescript
// Utility Functions Library

// Class name utility (cn)
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Date formatting
export function formatDate(date: string | Date) {
  const d = new Date(date);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

// Reading time calculation
export function calculateReadingTime(text: string) {
  const wordsPerMinute = 200;
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
}

// Slug generation
export function generateSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Excerpt generation
export function generateExcerpt(content: string, length = 160) {
  const plainText = content.replace(/(<([^>]+)>)/gi, '');
  return plainText.length > length 
    ? plainText.substring(0, length) + '...'
    : plainText;
}
```

### 10.3 Troubleshooting Guide

```markdown
## Common Issues & Solutions

### Build Errors
**Problem**: "Window is not defined"
**Solution**: Wrap browser-only code in useEffect or check for window
```javascript
if (typeof window !== 'undefined') {
  // Browser-only code
}
```

### Image Optimization
**Problem**: Images not loading after migration
**Solution**: Update paths and use gatsby-plugin-image
```javascript
import { GatsbyImage, getImage } from 'gatsby-plugin-image';

const image = getImage(data.thumbnail);
return <GatsbyImage image={image} alt={alt} />;
```

### MDX Rendering
**Problem**: MDX components not rendering
**Solution**: Provide MDXProvider with components
```javascript
import { MDXProvider } from '@mdx-js/react';
import * as components from './mdx-components';

<MDXProvider components={components}>
  {children}
</MDXProvider>
```

### Theme Flickering
**Problem**: Theme flashes on load
**Solution**: Add theme script to gatsby-ssr.js
```javascript
export const onRenderBody = ({ setPreBodyComponents }) => {
  setPreBodyComponents([
    <script
      key="theme-init"
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            const theme = localStorage.getItem('theme') || 'system';
            if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
              document.documentElement.classList.add('dark');
            }
          })();
        `,
      }}
    />,
  ]);
};
```
```

---

## Conclusion

This PRD provides a comprehensive blueprint for migrating and modernizing s11a.com using modern web technologies. The document serves as both a specification and implementation guide, designed to be used with an LLM for efficient development.

Key success factors:
1. **Incremental Migration**: Move content and features progressively
2. **Testing at Each Step**: Validate functionality before proceeding
3. **Performance First**: Optimize from the beginning
4. **User Experience**: Maintain and improve upon current UX
5. **SEO Preservation**: Ensure no loss in search rankings

The migration should result in a faster, more maintainable, and visually modern blog that preserves all existing content while providing an enhanced experience for readers.

---

*Document Version: 1.0*  
*Last Updated: [Current Date]*  
*Author: System Architect for s11a.com Migration*