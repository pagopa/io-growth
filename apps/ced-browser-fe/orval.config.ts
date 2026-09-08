import { defineConfig } from 'orval';

export default defineConfig({
  cedBrowserBe: {
    input: {
      target:
        'https://raw.githubusercontent.com/pagopa/io-growth/ced-browser-be@0.1.14/apps/ced-browser-be/openapi/exposed/openapi.yaml',
    },
    output: {
      client: 'fetch',
      mode: 'tags-split',
      target: './src/core/api/generated/endpoints',
      schemas: './src/core/api/generated/model',
      fileExtension: '.ts',
    },
  },
});
