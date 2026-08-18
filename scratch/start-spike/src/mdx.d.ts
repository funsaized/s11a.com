declare module '*.mdx' {
  import type { Element, MDXProps } from 'mdx/types'

  const MDXContent: (props: MDXProps) => Element

  export default MDXContent
  export const frontmatter: Record<string, unknown>
}
