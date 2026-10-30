import { defineConfig } from 'orval';

export default defineConfig({
  cedBrowserBe: {
    input: {
      target:
        'https://raw.githubusercontent.com/pagopa/io-growth/ced-browser-be@0.3.1/apps/ced-browser-be/openapi/exposed/openapi.yaml',
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
