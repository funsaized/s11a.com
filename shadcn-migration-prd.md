# Migration Plan PRD: Shadcn/UI Integration for s11a.com Blog

## Executive Summary

This PRD outlines a comprehensive migration strategy to integrate shadcn/ui into the existing s11a.com Gatsby blog, replacing the current Primitive UI-based styling system with Tailwind CSS and shadcn/ui components using the Amber palette.

## 1. Current State Analysis

### 1.1 Existing Style Architecture

#### **Core Styling System**
- **Base Framework**: Primitive UI (Tania Rascia's toolkit)
- **Preprocessor**: Sass/SCSS with CSS Modules
- **Theme System**: Custom CSS custom properties with dark/light/system modes
- **Component Structure**: 
  ```
  src/styles/
  ├── base/          # Variables, mixins, themes, fonts
  ├── components/    # Individual component styles
  └── main.scss      # Main entry point
  ```

#### **Component Inventory**
| Component | Current Implementation | Shadcn Equivalent |
|-----------|----------------------|-------------------|
| Buttons | Custom SCSS with variants | Button component |
| Forms | Custom form controls | Form, Input, Select |
| Navigation | Custom navbar with scroll effects | Navigation Menu |
| Theme Toggle | Custom React component | Mode Toggle |
| Grid/Layout | Flexbox-based custom grid | Built-in Tailwind grid |
| Cards | Project/Post cards | Card component |
| Tables | Basic SCSS tables | Table component |
| GitHubButton | Custom component | Button with icon |
| PostTags | Custom tags | Badge component |

### 1.2 Files to Be Replaced/Removed
```
src/styles/              # Entire directory will be replaced
src/context/ThemeContext.tsx  # Simplified for Tailwind dark mode
src/components/ThemeToggle/    # Replaced with shadcn components
gatsby-browser.js        # Remove theme provider wrapper
gatsby-ssr.js           # Remove theme injection script
```

## 2. Migration Strategy

### 2.1 Phased Approach

#### **Phase 1: Foundation Setup (Day 1-2)**
- Install Tailwind CSS via Gatsby plugin
- Configure PostCSS and Tailwind
- Set up shadcn/ui with Amber palette
- Create new global styles

#### **Phase 2: Component Migration (Day 3-5)**
- Install shadcn components progressively
- Migrate atomic components (buttons, inputs)
- Update composite components (navbar, cards)
- Replace theme system with Tailwind dark mode

#### **Phase 3: Cleanup & Optimization (Day 6)**
- Remove all SCSS files and dependencies
- Delete legacy theme context
- Optimize Tailwind configuration
- Update imports across all components

## 3. Technical Implementation

### 3.1 Initial Setup (Following Gatsby + Tailwind Docs)

#### **Step 1: Install Dependencies**
```bash
# Install Tailwind CSS and Gatsby plugin
npm install -D tailwindcss postcss autoprefixer gatsby-plugin-postcss

# Create PostCSS config
touch postcss.config.js

# Initialize Tailwind
npx tailwindcss init -p

# Install shadcn/ui dependencies
npm install -D tailwindcss-animate class-variance-authority clsx tailwind-merge lucide-react

# Install Radix UI primitives (for shadcn components)
npm install @radix-ui/react-slot
```

#### **Step 2: Configure Gatsby**
```typescript
// gatsby-config.ts
module.exports = {
  // ... existing config
  plugins: [
    // ... other plugins
    `gatsby-plugin-postcss`, // Add this
    // Remove or comment out: gatsby-plugin-sass
  ],
}
```

#### **Step 3: PostCSS Configuration**
```javascript
// postcss.config.js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### 3.2 Tailwind Configuration with Amber Palette

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
    "./src/templates/**/*.{js,jsx,ts,tsx}",
    "./src/layout/**/*.{js,jsx,ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      screens: {
        'xs': '480px',
        'sm': '600px',
        'md': '800px',
        'lg': '1000px',
        'xl': '1200px',
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: ["Menlo", "Monaco", "Consolas", "Liberation Mono", "Courier New", "monospace"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

### 3.3 Create Global CSS File

```css
/* src/styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 20 14.3% 4.1%;
    --card: 0 0% 100%;
    --card-foreground: 20 14.3% 4.1%;
    --popover: 0 0% 100%;
    --popover-foreground: 20 14.3% 4.1%;
    --primary: 24.6 95% 53.1%;
    --primary-foreground: 60 9.1% 97.8%;
    --secondary: 60 4.8% 95.9%;
    --secondary-foreground: 24 9.8% 10%;
    --muted: 60 4.8% 95.9%;
    --muted-foreground: 25 5.3% 44.7%;
    --accent: 60 4.8% 95.9%;
    --accent-foreground: 24 9.8% 10%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 60 9.1% 97.8%;
    --border: 20 5.9% 90%;
    --input: 20 5.9% 90%;
    --ring: 24.6 95% 53.1%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 20 14.3% 4.1%;
    --foreground: 60 9.1% 97.8%;
    --card: 20 14.3% 4.1%;
    --card-foreground: 60 9.1% 97.8%;
    --popover: 20 14.3% 4.1%;
    --popover-foreground: 60 9.1% 97.8%;
    --primary: 20.5 90.2% 48.2%;
    --primary-foreground: 60 9.1% 97.8%;
    --secondary: 12 6.5% 15.1%;
    --secondary-foreground: 60 9.1% 97.8%;
    --muted: 12 6.5% 15.1%;
    --muted-foreground: 24 5.4% 63.9%;
    --accent: 12 6.5% 15.1%;
    --accent-foreground: 60 9.1% 97.8%;
    --destructive: 0 72.2% 50.6%;
    --destructive-foreground: 60 9.1% 97.8%;
    --border: 12 6.5% 15.1%;
    --input: 12 6.5% 15.1%;
    --ring: 20.5 90.2% 48.2%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}

/* Custom utility classes for compatibility during migration */
@layer utilities {
  .container-custom {
    @apply mx-auto max-w-4xl px-6 lg:px-8;
  }
  
  /* Preserve some existing utility classes */
  .lead {
    @apply text-xl font-medium leading-relaxed text-muted-foreground;
  }
  
  /* Navigation styles */
  .nav-scroll {
    @apply shadow-md transition-shadow duration-300;
  }
}

/* Syntax highlighting for code blocks */
@layer components {
  pre[class*="language-"] {
    @apply rounded-lg bg-muted p-4 overflow-x-auto;
  }
  
  code:not(pre code) {
    @apply bg-muted px-1 py-0.5 rounded text-sm;
  }
}
```

### 3.4 Update Layout to Import CSS

```typescript
// src/layout/index.tsx
import React from "react";
import Helmet from "react-helmet";
import config from "../../data/SiteConfig";
import "../styles/globals.css"; // Replace main.scss with globals.css
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";

function MainLayout({ children }: MainLayoutProps): React.ReactElement {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <meta name="description" content={config.siteDescription} />
        <html lang="en" />
      </Helmet>
      <a href="#main-content" className="sr-only focus:not-sr-only">
        Skip to main content
      </a>
      <Navbar menuLinks={config.menuLinks} />
      <main id="main-content" className="pt-16">{children}</main>
      <Footer />
    </div>
  );
}

export default MainLayout;
```

### 3.5 Shadcn/UI Setup (Following Gatsby Installation Guide)

#### **Step 1: Setup Path Aliases**
```json
// tsconfig.json
{
  "compilerOptions": {
    // ... existing options
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

#### **Step 2: Configure Gatsby for Path Resolution**
```javascript
// gatsby-node.ts
import path from "path";

export const onCreateWebpackConfig = ({ actions }) => {
  actions.setWebpackConfig({
    resolve: {
      alias: {
        "@/components": path.resolve(__dirname, "src/components"),
        "@/lib": path.resolve(__dirname, "src/lib"),
        "@/styles": path.resolve(__dirname, "src/styles"),
      },
    },
  });
};
```

#### **Step 3: Create Utils File**
```typescript
// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

#### **Step 4: Initialize Shadcn/UI**
```bash
# Manual setup since Gatsby isn't officially supported by the CLI
# Create components.json manually
```

```json
// components.json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/styles/globals.css",
    "baseColor": "amber",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

## 4. Component Migration Examples

### 4.1 Button Component (Manual Installation)

```typescript
// src/components/ui/button.tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

### 4.2 Simplified Theme Toggle (No localStorage)

```typescript
// src/components/ThemeToggle/ThemeToggle.tsx
import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const [theme, setTheme] = React.useState<"light" | "dark">("light")

  React.useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(theme)
  }, [theme])

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
```

### 4.3 Navbar with Tailwind

```typescript
// src/components/Navbar/Navbar.tsx
import React, { useState, useEffect } from "react";
import { Link } from "gatsby";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "../ThemeToggle/ThemeToggle";
import { MenuLink } from "../../models";

interface NavbarProps {
  menuLinks: MenuLink[];
}

function Navbar({ menuLinks }: NavbarProps): React.ReactElement {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 bg-background border-b transition-all",
        scrolled && "shadow-md"
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">Sai Nimmagadda</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            {menuLinks.map((link) => (
              <Link
                key={link.name}
                to={link.link}
                className="text-sm font-medium transition-colors hover:text-primary"
                activeClassName="text-primary"
              >
                {link.name}
              </Link>
            ))}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
```

### 4.4 Card Component for Posts

```typescript
// src/components/ui/card.tsx
import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

export { Card, CardHeader, CardTitle, CardDescription, CardContent }
```

### 4.5 Updated PostListing with Cards

```typescript
// src/components/PostListing/PostListing.tsx
import React, { useMemo } from "react";
import { Link } from "gatsby";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function PostListing({ postEdges }: PostListingProps): React.ReactElement {
  const postList = useMemo(
    () =>
      postEdges.map((postEdge) => ({
        path: postEdge.node.fields.slug,
        tags: postEdge.node.frontmatter.tags,
        title: postEdge.node.frontmatter.title,
        date: postEdge.node.fields.date,
        excerpt: postEdge.node.excerpt,
        timeToRead: postEdge.node.timeToRead,
      })),
    [postEdges],
  );

  return (
    <div className="space-y-4">
      {postList.map((post) => (
        <Link to={post.path} key={post.title} className="block">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>{post.title}</CardTitle>
              <CardDescription>{post.excerpt}</CardDescription>
              <div className="flex gap-2 mt-2">
                {post.tags?.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardHeader>
          </Card>
        </Link>
      ))}
    </div>
  );
}

export default PostListing;
```

### 4.6 Badge Component for Tags

```typescript
// src/components/ui/badge.tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
```

## 5. Simplified Migration Checklist

### 5.1 Setup Phase (Day 1)
- [ ] Install Tailwind CSS via `npm install -D tailwindcss postcss autoprefixer gatsby-plugin-postcss`
- [ ] Add `gatsby-plugin-postcss` to gatsby-config.ts
- [ ] Create postcss.config.js
- [ ] Run `npx tailwindcss init -p`
- [ ] Configure tailwind.config.js with Amber palette
- [ ] Create src/styles/globals.css
- [ ] Update src/layout/index.tsx to import globals.css
- [ ] Install shadcn dependencies
- [ ] Create src/lib/utils.ts
- [ ] Update gatsby-node.ts with path aliases

### 5.2 Component Migration (Day 2-4)
- [ ] Create src/components/ui/ directory
- [ ] Add Button component
- [ ] Add Card components
- [ ] Add Badge component
- [ ] Add Input/Form components as needed
- [ ] Update Navbar with Tailwind classes
- [ ] Replace ThemeToggle with simplified version
- [ ] Update PostListing to use Cards
- [ ] Update ProjectListing with Tailwind
- [ ] Convert Footer to Tailwind

### 5.3 Page Updates (Day 5)
- [ ] Update index.tsx with Tailwind classes
- [ ] Update blog.tsx with Tailwind classes
- [ ] Update about.tsx with Tailwind classes
- [ ] Update post template with Tailwind
- [ ] Update tag/category templates

### 5.4 Cleanup (Day 6)
- [ ] Remove src/styles/base/
- [ ] Remove src/styles/components/
- [ ] Remove src/context/ThemeContext.tsx
- [ ] Remove gatsby-plugin-sass from package.json and gatsby-config
- [ ] Uninstall sass: `npm uninstall sass gatsby-plugin-sass`
- [ ] Clean up gatsby-browser.js (remove theme provider)
- [ ] Clean up gatsby-ssr.js (remove theme injection)
- [ ] Update all component imports
- [ ] Remove ./index.css import from layout

## 6. Files to Delete After Migration

```bash
# Remove SCSS/Sass files
rm -rf src/styles/base/
rm -rf src/styles/components/
rm src/styles/main.scss

# Remove old theme implementation
rm -rf src/context/ThemeContext.tsx
rm -rf src/components/ThemeToggle/ThemeToggle.scss

# Clean up CSS imports
rm src/layout/index.css
```

## 7. Updated Package.json Scripts

```json
{
  "scripts": {
    "develop": "gatsby develop",
    "build": "gatsby build",
    "serve": "gatsby serve",
    "clean": "gatsby clean",
    "format": "prettier --write \"**/*.{js,jsx,ts,tsx,json,md}\"",
    "lint": "eslint --ext .js,.jsx,.ts,.tsx ."
  }
}
```

## 8. Performance Considerations

### 8.1 Tailwind Optimization
- **JIT Mode**: Enabled by default in Tailwind v3
- **PurgeCSS**: Automatically handled by Tailwind
- **Content Paths**: Properly configured in tailwind.config.js

### 8.2 Bundle Size Expectations
| Metric | Before | After (Estimated) |
|--------|--------|------------------|
| CSS Bundle | 45kb | 32kb |
| Build Time | ~30s | ~35s |
| Dev Start Time | ~10s | ~12s |

## 9. Common Gotchas & Solutions

### 9.1 Gatsby-Specific Issues
| Issue | Solution |
|-------|----------|
| PostCSS not processing | Ensure gatsby-plugin-postcss is listed in plugins |
| Tailwind styles not applying | Check content paths in tailwind.config.js |
| Build errors with imports | Update path aliases in gatsby-node.ts |
| Hot reload not working | Clear .cache and public directories |

### 9.2 Migration Tips
1. **Keep both systems during migration**: Don't delete SCSS until fully migrated
2. **Use cn() utility**: Always use cn() for conditional classes
3. **Tailwind IntelliSense**: Install VS Code extension for better DX
4. **Component by component**: Migrate one component at a time
5. **Test in both themes**: Always check light and dark modes

## 10. Quick Reference Commands

```bash
# Development
gatsby develop

# Clear cache if styles aren't updating
gatsby clean && gatsby develop

# Build for production
gatsby build

# Test production build locally
gatsby serve

# Add shadcn components manually (since CLI doesn't support Gatsby)
# Copy component code from https://ui.shadcn.com/docs/components/[component-name]
```

## 11. Resources

- [Gatsby + Tailwind Official Guide](https://www.gatsbyjs.com/docs/how-to/styling/tailwind-css/)
- [Tailwind CSS v3 Docs](https://v3.tailwindcss.com/docs/guides/gatsby)
- [Shadcn/UI Components](https://ui.shadcn.com/docs/components/accordion)
- [Shadcn/UI Gatsby Installation](https://ui.shadcn.com/docs/installation/gatsby)
- [Amber Theme Preview](https://ui.shadcn.com/themes)

## Appendix: Manual Component Installation Template

Since shadcn/ui CLI doesn't support Gatsby, use this template for adding components:

```bash
# 1. Create component file
touch src/components/ui/[component-name].tsx

# 2. Copy component code from shadcn/ui docs
# 3. Install any required Radix dependencies
npm install @radix-ui/react-[component-name]

# 4. Update imports to use @/ aliases
# 5. Test component in isolation before using
```

This simplified PRD removes theme persistence complexity and testing requirements while focusing on a clean, straightforward migration path using the official Gatsby documentation approaches.