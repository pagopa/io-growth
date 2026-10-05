import pagopa from "@pagopa/eslint-config";
import globals from "globals";

export default [
  ...pagopa,
  {
    files: ["scripts/**/*.mjs"],
    languageOptions: {
      globals: globals.node,
    },
  },
];
