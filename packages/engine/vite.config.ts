import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      include: ['src/**/*'],
      outDir: 'dist',
    }),
  ],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        'components/index': resolve(__dirname, 'src/components/index.ts'),
        'scenes/index': resolve(__dirname, 'src/scenes/index.ts'),
        'utils/index': resolve(__dirname, 'src/utils/index.ts'),
        'debug/index': resolve(__dirname, 'src/debug/index.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: ['phaser', 'eventemitter3'],
      output: {
        preserveModules: false,
        entryFileNames: '[name].js',
      },
    },
    sourcemap: true,
    minify: false,
  },
});
