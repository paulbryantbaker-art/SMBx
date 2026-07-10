// ONE-OFF single-file preview build for the artifact preview (not committed,
// not part of the app). Inlines all dynamic imports into one bundle and stubs
// the auth-gated shells that a logged-out preview can never reach.
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const STUB = '/tmp/claude-0/-home-user-SMBx/76752821-4b39-5cbd-b981-5799c5073e8b/scratchpad/preview-stub.tsx';

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
