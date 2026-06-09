import js from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintReactPlugin from "@eslint-react/eslint-plugin";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import importXPlugin from "eslint-plugin-import-x";
import eslintConfigPrettier from "eslint-config-prettier";
import globals from "globals";

export default [
  // ── Global ignores ────────────────────────────────────────────
  {
    ignores: [
      "public/**",
      "static/**",
      ".cache/**",
      "src/content/**",
      "src/components/ui/**",
      "scripts/**",
      "gatsby-node.js",
      "gatsby-ssr.js",
      "tailwind.config.js",
      "postcss.config.js",
    ],
  },

  // ── Base recommended rules ────────────────────────────────────
  js.configs.recommended,

  // ── TypeScript recommended ────────────────────────────────────
  ...tseslint.configs.recommended,

  // ── JSX Accessibility ─────────────────────────────────────────
  jsxA11y.flatConfigs.recommended,

  // ── All source files ──────────────────────────────────────────
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      ...eslintReactPlugin.configs.recommended.plugins,
      "react-hooks": reactHooksPlugin,
      "import-x": importXPlugin,
    },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      // React
      ...eslintReactPlugin.configs.recommended.rules,
      "@eslint-react/dom-no-dangerously-set-innerhtml": "off",
      "@eslint-react/dom-no-missing-button-type": "off",
      "@eslint-react/exhaustive-deps": "off",
      "@eslint-react/no-array-index-key": "warn",
      "@eslint-react/rules-of-hooks": "off",
      "@eslint-react/set-state-in-effect": "off",

      // React Hooks
      ...reactHooksPlugin.configs.recommended.rules,
      // Disable React 19 Compiler rules — not applicable to React 18 / Gatsby
      "react-hooks/refs": "off",
      "react-hooks/set-state-in-effect": "off",

      // Imports
      "import-x/no-duplicates": "error",

      // A11y — Gatsby Link integration
      "jsx-a11y/anchor-is-valid": [
        "error",
        {
          components: ["Link"],
          specialLink: ["hrefLeft", "hrefRight", "to"],
          aspects: ["noHref", "invalidHref", "preferButton"],
        },
      ],

      // General
      "no-nested-ternary": "off",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "arrow-body-style": "off",
      "spaced-comment": [
        "error",
        "always",
        { markers: ["/"], exceptions: ["*"] },
      ],
    },
  },

  // ── TypeScript-specific overrides ─────────────────────────────
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Swap base rules for TS-aware versions
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "no-use-before-define": "off",
      "@typescript-eslint/no-use-before-define": "error",
      "no-shadow": "off",
      "@typescript-eslint/no-shadow": "error",
    },
  },

  // ── Prettier (must be last — disables conflicting rules) ──────
  eslintConfigPrettier,
];
