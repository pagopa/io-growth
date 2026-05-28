import { defineConfig } from "orval";

export default defineConfig({
  arApi: {
    input: {
      target: "./openapi/consumed/ar.yaml",
    },
    output: {
      baseUrl: "",
      client: "fetch",
      fileExtension: ".ts",
      mode: "tags-split",
      override: {
        mutator: {
          name: "customFetch",
          path: "./src/client.ts",
        },
      },
      schemas: "./src/generated/model",
      target: "./src/generated/endpoints",
    },
  },
});
