import { defineConfig } from 'orval';

export default defineConfig({
  cedPortalBe: {
    input: {
      // TODO: this should be replaced with a tag url IEG-2924
      target: '../ced-portal-be/openapi/exposed/openapi.yaml',
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
