import { defineConfig } from 'orval';

export default defineConfig({
  cedPortalBe: {
    input: {
      target: '../ced-portal-be/openapi/exposed/openapi.yaml',
    },
    output: {
      client: 'fetch',
      mode: 'tags-split',
      target: './src/api/generated/endpoints',
      schemas: './src/api/generated/model',
      fileExtension: '.ts',
    },
  },
});
