import pagopa from "@pagopa/eslint-config";
import globals from "globals";

export default [
  ...pagopa,
  {
    ignores: ["src/*/index.ts"],
  },
  {
    files: ["scripts/**/*.mjs"],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ["src/*/applier.template.ts"],
    rules: {
      // Template parameters are intentionally interpolated into the
      // generated HTML output rather than used directly in TS code.
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
];
