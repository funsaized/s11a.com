import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import netlify from '@netlify/vite-plugin-tanstack-start'
import mdx from '@mdx-js/rollup'
import remarkFrontmatter from 'remark-frontmatter'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'

const config = defineConfig({
  // DEV only tailscail + caddy
  server: {
    allowedHosts: ['blog-new.dev.s11a.com'],
  },
  resolve: { tsconfigPaths: true },
  plugins: [
    devtools(),
    netlify(),
    tailwindcss(),
    tanstackStart({
      pages: [{ path: '/posts/explicit-check' }],
      prerender: {
        enabled: true,
        crawlLinks: true,
      },
    }),
    mdx({ remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter] }),
    viteReact(),
  ],
})

export default config
