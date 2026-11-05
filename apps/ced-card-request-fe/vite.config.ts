import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// Mixpanel initialised with an empty token crashes the app in production (ENGQATM-1083).
const requireAnalyticsToken = (): Plugin => ({
  name: 'require-analytics-token',
  apply: 'build',
  configResolved({ env }) {
    if (env.VITE_ANALYTICS_ENABLE === 'true' && !env.VITE_ANALYTICS_TOKEN) {
      throw new Error(
        'VITE_ANALYTICS_ENABLE is true but VITE_ANALYTICS_TOKEN is empty',
      );
    }
  },
});

export default defineConfig({
  plugins: [react(), requireAnalyticsToken()],
  resolve: {
    dedupe: ['react', 'react-dom', '@mui/material', '@mui/system'],
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
