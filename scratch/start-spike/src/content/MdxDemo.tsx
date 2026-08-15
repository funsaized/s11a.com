import Post, { frontmatter } from './post.mdx'
import { mdxModuleShape } from '../mdx-glob'

console.log('MDX frontmatter:', frontmatter)

export function MdxDemo() {
  return (
    <section className="island-shell mt-8 rounded-2xl p-6">
      <p className="island-kicker mb-2">MDX smoke test</p>
      <Post />
      <details className="mt-6">
        <summary className="cursor-pointer font-semibold text-[var(--sea-ink)]">
          Imported metadata
        </summary>
        <pre className="mt-3 overflow-x-auto rounded-xl bg-black/5 p-4 text-xs text-[var(--sea-ink-soft)]">
          {JSON.stringify({ frontmatter, mdxModuleShape }, null, 2)}
        </pre>
      </details>
    </section>
  )
}
