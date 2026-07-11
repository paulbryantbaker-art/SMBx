// Single-file preview build for design review (`npm run preview:build`).
// Produces dist-preview/ (gitignored): one JS bundle + one CSS file that the
// artifact-preview packaging inlines into a self-contained page. Inlines all
// dynamic imports and stubs the auth-gated shells a logged-out preview can
// never reach. NOT the production build — vite.config.ts is untouched.
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const STUB = path.resolve(__dirname, 'client/src/preview-stub.tsx');

export default defineConfig({
  plugins: [react()],
  root: 'client',
  envDir: '..',
  cacheDir: '/tmp/.vite-preview',
  resolve: {
    alias: [
      { find: '@shared', replacement: path.resolve(__dirname, 'shared') },
      { find: /^.*components\/v6\/V6App$/, replacement: STUB },
      { find: /^.*pages\/admin\/AdminDashboard$/, replacement: STUB },
      // swap the entry: mount App on a memory router pinned to "/"
      { find: /\/src\/main\.tsx$/, replacement: path.resolve(__dirname, 'client/src/preview-main.tsx') },
    ],
  },
  build: {
    outDir: '../dist-preview',
    emptyOutDir: true,
    rollupOptions: {
      output: { inlineDynamicImports: true, manualChunks: undefined },
    },
  },
});
