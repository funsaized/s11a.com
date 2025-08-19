# s11a.com - Personal Blog

Modern Gatsby v5 blog built with TypeScript, Tailwind CSS v3, and shadcn/ui components. Features technical articles, project showcases, and optimized performance.

## 🚀 Features

- **Modern Stack**: Gatsby v5, TypeScript, Tailwind CSS v3, shadcn/ui
- **Content Management**: MDX support with syntax highlighting and table of contents
- **Performance Optimized**: Lighthouse scores >90, image optimization, code splitting
- **SEO Ready**: Structured data, Open Graph, Twitter Cards, sitemap
- **Dark/Light Theme**: System preference aware theme switching
- **Responsive Design**: Mobile-first approach with beautiful UI components

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui base components
│   ├── layout/         # Layout components (Header, Footer, SEO)
│   ├── home/           # Home page specific components
│   ├── articles/       # Article-related components
│   └── mdx/           # MDX custom components
├── content/            # MDX content files
│   └── articles/       # Blog articles
├── pages/              # Gatsby pages
├── templates/          # Page templates
├── styles/             # Global styles and themes
└── utils/              # Utility functions
```

## 🛠️ Development

### Prerequisites

- Node.js 18+
- npm 9+

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run develop

# Build for production
npm run build

# Serve production build
npm run serve
```

### Available Scripts

```bash
npm run develop        # Start development server
npm run build         # Build for production
npm run serve         # Serve production build
npm run clean         # Clean Gatsby cache
npm run typecheck     # Run TypeScript checks
npm run lighthouse    # Run Lighthouse performance tests
npm run lighthouse:ci # Build and test performance
npm run analyze       # Analyze bundle size
npm run perf          # Full performance testing suite
```

## 📝 Content Management

### Adding Articles

1. Create a new MDX file in `src/content/articles/`
2. Add frontmatter with required fields:

```yaml
---
title: 'Your Article Title'
slug: your-article-slug
excerpt: 'Brief description of the article'
date: '2024-01-01'
category: 'Technology'
tags: ['React', 'TypeScript']
readingTime: '5 min read'
featured: false
author: 'Sai Nimmagadda'
---
```

3. Write your content using MDX syntax
4. The article will automatically appear on the articles page

### Supported Categories

- Backend
- Frontend
- Healthcare
- Architecture
- DevOps
- Database
- Cloud
- Security

## 🎨 Customization

### Theming

The site uses CSS custom properties for theming. Modify `src/styles/globals.css` to customize:

- Colors
- Typography
- Spacing
- Border radius
- Animations

### Components

All UI components are built with shadcn/ui and can be customized in `src/components/ui/`.

## 📊 Performance

The site is optimized for performance with:

- **Lighthouse Scores**: >90 for all metrics
- **Core Web Vitals**: Optimized LCP, FID, CLS
- **Image Optimization**: gatsby-plugin-image with WebP
- **Code Splitting**: Automatic route-based splitting
- **Caching**: Optimized cache headers
- **Bundle Analysis**: webpack-bundle-analyzer integration

### Performance Testing

```bash
# Run full performance test suite
npm run perf

# Individual tests
npm run lighthouse    # Lighthouse audit
npm run analyze      # Bundle analysis
```

## 🔍 SEO Features

- **Structured Data**: JSON-LD for articles and author
- **Meta Tags**: Complete Open Graph and Twitter Card support
- **Sitemap**: Automatically generated
- **Robots.txt**: SEO-friendly configuration
- **Canonical URLs**: Prevent duplicate content issues
- **Performance**: Fast loading times improve SEO rankings

## 🚀 Deployment

### Netlify (Recommended)

1. **Connect Repository**: Link your GitHub repository to Netlify
2. **Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `public`
   - Node version: `18`

3. **Environment Variables** (Optional):
   ```
   GA_MEASUREMENT_ID=your-google-analytics-id
   ```

4. **Deploy**: Push to your main branch

### Manual Deployment

```bash
# Run deployment script
./scripts/deploy/deploy.sh

# Or manually
npm run build
# Upload 'public' directory to your server
```

### Performance Monitoring

Set up monitoring for:
- Core Web Vitals
- Lighthouse CI
- Bundle size tracking
- Error tracking

## 📈 Analytics

### Google Analytics 4

1. Create a GA4 property
2. Update `gatsby-config.ts` with your Measurement ID:
   ```typescript
   trackingIds: ["G-XXXXXXXXXX"]
   ```

### Performance Monitoring

The site includes performance monitoring setup for:
- Real User Monitoring (RUM)
- Core Web Vitals tracking
- Error boundary reporting

## 🔧 Configuration

### Key Configuration Files

- `gatsby-config.ts` - Gatsby configuration and plugins
- `tailwind.config.js` - Tailwind CSS configuration
- `netlify.toml` - Netlify deployment configuration
- `tsconfig.json` - TypeScript configuration

### Environment Variables

Create a `.env` file for local development:

```env
# Optional: Google Analytics
GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Optional: Site URL (for sitemap)
GATSBY_SITE_URL=https://s11a.com
```

## 🧪 Testing

### Performance Testing

```bash
# Full performance audit
npm run lighthouse:ci

# Individual page testing
npm run lighthouse
```

### Type Checking

```bash
npm run typecheck
```

## 📦 Technology Stack

- **Framework**: Gatsby v5
- **Language**: TypeScript
- **Styling**: Tailwind CSS v3
- **UI Components**: shadcn/ui (Radix UI + Tailwind)
- **Content**: MDX with remark/rehype plugins
- **Icons**: Lucide React
- **Deployment**: Netlify
- **Analytics**: Google Analytics 4
- **Performance**: Lighthouse CI

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and type checking
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Links

- **Live Site**: [s11a.com](https://s11a.com)
- **GitHub**: [Repository](https://github.com/funsaized/s11a.com)
- **Author**: [Sai Nimmagadda](https://github.com/funsaized)

---

Built with ❤️ by [Sai Nimmagadda](https://s11a.com/about)
