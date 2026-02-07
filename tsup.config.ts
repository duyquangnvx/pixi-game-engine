import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    external: [
        'pixi.js',
        '@pixi/sound',
        '@pixi/particle-emitter',
        '@pixi/ui',
        'pixi-spine',
        'gsap',
        'gsap/PixiPlugin',
    ],
});
