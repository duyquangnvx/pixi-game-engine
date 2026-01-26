import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@pge/core': resolve(__dirname, '../engine/src/index.ts'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
