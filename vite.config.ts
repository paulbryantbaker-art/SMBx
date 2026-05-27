// Build: 2026-02-22T20:00
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: 'client',
  envDir: '..',
  cacheDir: '/tmp/.vite',
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, 'shared'),
    },
  },
  build: {
    outDir: '../dist/client',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;

          if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/scheduler/') || id.includes('/wouter/')) {
            return 'vendor-react';
          }
          if (id.includes('/@tiptap/') || id.includes('/prosemirror-')) {
            return 'vendor-tiptap';
          }
          if (id.includes('/chart.js/') || id.includes('/react-chartjs-2/')) {
            return 'vendor-charts';
          }
          if (
            id.includes('/lucide-react/')
            || id.includes('/@radix-ui/')
            || id.includes('/vaul/')
            || id.includes('/framer-motion/')
            || id.includes('/react-markdown/')
            || id.includes('/marked/')
            || id.includes('/turndown/')
            || id.includes('/unified/')
            || id.includes('/remark-')
            || id.includes('/rehype-')
            || id.includes('/micromark')
            || id.includes('/mdast')
            || id.includes('/hast')
            || id.includes('/unist')
          ) {
            return 'vendor-content';
          }

          return undefined;
        },
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/.well-known': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/definitive': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/mcp': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/oauth': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/server.json': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
