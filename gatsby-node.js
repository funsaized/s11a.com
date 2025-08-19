const path = require('path');

exports.createPages = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions;

  // Query for all MDX articles
  const result = await graphql(`
    query {
      allMdx(
        filter: { internal: { contentFilePath: { regex: "/content/articles/" } } }
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
    }
  `);

  if (result.errors) {
    reporter.panicOnBuild('Error loading MDX result', result.errors);
  }

  // Create article pages
  const articles = result.data.allMdx.nodes;
  
  articles.forEach((article) => {
    const slug = article.frontmatter.slug;
    
    createPage({
      path: `/articles/${slug}`,
      component: `${path.resolve('./src/templates/article.tsx')}?__contentFilePath=${article.internal.contentFilePath}`,
      context: {
        id: article.id,
      },
    });
  });
};