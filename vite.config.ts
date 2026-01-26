import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@game-objects': resolve(__dirname, 'src/game-objects'),
      '@types': resolve(__dirname, 'src/types'),
    },
  },
});
