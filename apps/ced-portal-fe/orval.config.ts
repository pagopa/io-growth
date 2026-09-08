import { defineConfig } from 'orval';

export default defineConfig({
  cedPortalBe: {
    input: {
      target:
        'https://raw.githubusercontent.com/pagopa/io-growth/ced-portal-be@0.3.1/apps/ced-portal-be/openapi/exposed/openapi.yaml',
    },
    output: {
      client: 'fetch',
      mode: 'tags-split',
      target: './src/generated/endpoints',
      schemas: './src/generated/model',
      fileExtension: '.ts',
    },
  },
});
