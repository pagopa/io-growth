import { defineConfig } from "orval";

export default defineConfig({
  cedCardRequestBe: {
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
