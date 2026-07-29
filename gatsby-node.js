const path = require("path");

exports.onCreateWebpackConfig = ({ actions, getConfig }) => {
  const config = getConfig();
  config.plugins = config.plugins.filter(
    (plugin) => plugin.constructor.name !== "ESLintWebpackPlugin",
  );
  actions.replaceWebpackConfig(config);

  actions.setWebpackConfig({
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
        "@/components": path.resolve(__dirname, "src/components"),
        "@/utils": path.resolve(__dirname, "src/utils"),
        "@/lib": path.resolve(__dirname, "src/lib"),
        "@/hooks": path.resolve(__dirname, "src/hooks"),
      },
    },
  });
};

exports.createPages = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions;

  // Query for all articles
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
    }
  `);

  if (result.errors) {
    reporter.panicOnBuild("Error loading MDX result", result.errors);
  }

  // Create article pages
  const articles = result.data.articles.nodes;

  articles.forEach((article) => {
    const { slug } = article.frontmatter;

    createPage({
      path: `/articles/${slug}`,
      component: `${path.resolve("./src/templates/article.tsx")}?__contentFilePath=${article.internal.contentFilePath}`,
      context: {
        id: article.id,
      },
    });
  });
};
