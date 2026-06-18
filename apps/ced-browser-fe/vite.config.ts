import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom', '@mui/material', '@mui/system'],
  },
  server: {
    proxy: {
      //TODO since authorize does not have the **api** prefix i put this proxy rule to make it work without changes in baseApi
      '/api/authorize': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/authorize/, '/authorize'),
      },
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
    },
  },
});
