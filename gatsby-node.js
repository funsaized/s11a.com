const path = require("path");

exports.createPages = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions;

  // Query for all MDX content (articles and notes)
  const result = await graphql(`
    query {
      articles: allMdx(
        filter: {
          internal: { contentFilePath: { regex: "/content/articles/" } }
        }
      ) {
        nodes {
          id
          frontmatter {
            slug
          }
          internal {
            contentFilePath
          }
        }
      }
      notes: allMdx(
        filter: {
          internal: { contentFilePath: { regex: "/content/notes/" } }
        }
      ) {
        nodes {
          id
          frontmatter {
            slug
            title
          }
          internal {
            contentFilePath
          }
        }
      }
    }
  `);

  if (result.errors) {
    reporter.panicOnBuild("Error loading MDX result", result.errors);
  }

  // Create article pages
  const articles = result.data.articles.nodes;

  articles.forEach((article) => {
    const slug = article.frontmatter.slug;

    createPage({
      path: `/articles/${slug}`,
      component: `${path.resolve("./src/templates/article.tsx")}?__contentFilePath=${article.internal.contentFilePath}`,
      context: {
        id: article.id,
      },
    });
  });

  // Create note pages
  const notes = result.data.notes.nodes;

  notes.forEach((note) => {
    // Generate slug from title if not provided, or from file path
    const slug = note.frontmatter.slug || 
                 note.frontmatter.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') ||
                 path.basename(note.internal.contentFilePath, '.mdx').toLowerCase();

    createPage({
      path: `/notes/${slug}`,
      component: `${path.resolve("./src/templates/note.tsx")}?__contentFilePath=${note.internal.contentFilePath}`,
      context: {
        id: note.id,
      },
    });
  });
};
