// Import necessary modules for ESLint's flat configuration system.
// `globals` provides a list of predefined global variables for different environments.
// `@eslint/js` contains the recommended rules from core ESLint.
// `typescript-eslint` provides the parser and rules for TypeScript.
import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  // Top-level ignores for files and directories that should not be linted.
  {
    ignores: [
      "src/utils/jwt.ts",
      "**/*.js",
      "*.mjs",
      "dist/**",
      "node_modules/**",
      "src/database/generated/**",
      "prisma/migrations/**",
      "prisma.config.ts", // Prisma config file is not in tsconfig.json
    ],
  },

  // Base configuration for TypeScript files in the project.
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      parser: tseslint.parser,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // Recommended rule sets from core ESLint and TypeScript ESLint.
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,

  // Custom rules for code style, best practices, and security.
  {
    rules: {
      // === 📌 BEST PRACTICES & SECURITY ===
      "no-console": "warn",
      "no-debugger": "error",
      "no-process-env": "off",
      "no-sync": "warn",
      eqeqeq: ["error", "always"],
      curly: ["error", "all"],
      "no-var": "error",
      "prefer-const": "error",
      "no-multiple-empty-lines": ["error", { max: 1 }],
      "space-before-blocks": ["error", "always"],
      semi: ["error", "always"],
      "no-empty-function": "error",

      // === 📌 TYPESCRIPT RULES ===
      "@typescript-eslint/indent": "off", // You can turn this rule off, or remove it entirely. The base `indent` rule often conflicts with TypeScript.
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrors: "none",
        },
      ],
      "@typescript-eslint/explicit-function-return-type": [
        "error",
        { allowExpressions: true },
      ],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
      "@typescript-eslint/typedef": [
        "error",
        {
          arrayDestructuring: true,
          arrowParameter: true,
          memberVariableDeclaration: true,
          objectDestructuring: true,
          parameter: true,
          propertyDeclaration: true,
          variableDeclaration: true,
          variableDeclarationIgnoreFunction: true,
        },
      ],
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/await-thenable": "error",

      // === 📌 ADDITIONAL RULES ===
      "prefer-arrow-callback": "error",
      "no-template-curly-in-string": "error",
      "no-await-in-loop": "warn",
      "prefer-destructuring": "off",
    },
  },
];
