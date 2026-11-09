// ESLint flat config. Strict by design: recommended rules + extra correctness/consistency rules
// + eslint-plugin-unicorn (modern-JS best practices). Formatting is left to Prettier.
import js from "@eslint/js";
import unicorn from "eslint-plugin-unicorn";
import globals from "globals";

export default [
  {
    ignores: ["node_modules/", "web-ext-artifacts/"],
  },

  js.configs.recommended,
  unicorn.configs.recommended,

  // Shared rules for all JS.
  {
    linterOptions: {
      reportUnusedDisableDirectives: "error",
      reportUnusedInlineConfigs: "error",
    },
    rules: {
      // Correctness
      "array-callback-return": ["error", { checkForEach: true }],
      "consistent-return": "error",
      "default-case-last": "error",
      eqeqeq: ["error", "always", { null: "ignore" }],
      "no-await-in-loop": "error",
      "no-constructor-return": "error",
      "no-implicit-coercion": "error",
      "no-promise-executor-return": "error",
      "no-self-compare": "error",
      "no-template-curly-in-string": "error",
      "no-unmodified-loop-condition": "error",
      "no-unreachable-loop": "error",
      "no-use-before-define": ["error", { functions: false }],
      "require-atomic-updates": "error",
      "require-await": "error",

      // Clarity / maintainability
      complexity: ["error", 15],
      curly: ["error", "multi-line"],
      "max-depth": ["error", 4],
      "max-params": ["error", 4],
      "no-console": ["error", { allow: ["warn", "error"] }],
      "no-else-return": ["error", { allowElseIf: false }],
      "no-lonely-if": "error",
      "no-nested-ternary": "error",
      "no-param-reassign": "error",
      "no-shadow": ["error", { builtinGlobals: false, hoist: "all" }],
      "no-unneeded-ternary": "error",
      "no-unused-vars": ["error", { args: "all", caughtErrors: "all", argsIgnorePattern: "^_" }],
      "no-useless-concat": "error",
      "no-useless-rename": "error",
      "no-useless-return": "error",
      "no-var": "error",
      "object-shorthand": "error",
      "prefer-arrow-callback": "error",
      "prefer-const": "error",
      "prefer-object-spread": "error",
      "prefer-template": "error",

      // unicorn: keep strict, but drop rules that fight this codebase's constraints.
      // Short conventional names (el, url, ctx) are clearer than forced long ones; it also demands
      // renaming files that tools look up by name (web-ext-config.mjs).
      "unicorn/name-replacements": "off",
      // DOM APIs and adapter contracts use null for "not found".
      "unicorn/no-null": "off",
      // Content scripts can't be ES modules (MV3 limitation), so classic scripts + IIFEs are required,
      // and classic scripts can't use top-level await.
      "unicorn/prefer-module": "off",
      "unicorn/prefer-top-level-await": "off",
    },
  },

  // Extension code: classic browser scripts sharing the CPF namespace (see src/core/namespace.js).
  {
    files: ["src/**/*.js"],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "script",
      globals: {
        ...globals.browser,
        ...globals.webextensions,
        CPF: "readonly",
      },
    },
    rules: {
      strict: ["error", "never"],
      "no-implicit-globals": "error",
    },
  },

  // Tooling config files (Node, ES modules).
  {
    files: ["*.js", "*.mjs"],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "module",
      globals: globals.node,
    },
  },
];
