import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'MixpanelLib',
      fileName: (format) => `mixpanel-lib.${format}.js`,
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      external: ['mixpanel-browser'], // non bundle di mixpanel
      output: {
        globals: {
          'mixpanel-browser': 'mixpanel',
        },
      },
    },
  },
});
