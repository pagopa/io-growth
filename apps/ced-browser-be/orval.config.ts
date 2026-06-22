import { defineConfig } from "orval";

export default defineConfig({
  cedBrowserBe: {
    input: {
      target: "./openapi/exposed/openapi.yaml",
    },
    output: {
      client: "zod",
      mode: "tags-split",
      target: "./src/adapters/inbound/fastify/contracts",
    },
  },
});
