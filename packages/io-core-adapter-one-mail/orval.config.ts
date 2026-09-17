import { defineConfig } from "orval";

export default defineConfig({
  oneMailApi: {
    input: {
      target: "./openapi/consumed/openapi.yaml",
    },
    output: {
      baseUrl: "",
      client: "fetch",
      fileExtension: ".ts",
      mode: "tags-split",
      override: {
        mutator: {
          extension: ".js",
          name: "customFetch",
          path: "./src/fetch.ts",
        },
      },
      schemas: "./src/generated/model",
      target: "./src/generated/endpoints",
    },
  },
});
