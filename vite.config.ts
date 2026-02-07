import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'PixiGameEngine',
            fileName: 'index',
            formats: ['es', 'cjs'],
        },
        rollupOptions: {
            external: [
                'pixi.js',
                '@pixi/sound',
                '@pixi/particle-emitter',
                '@pixi/ui',
                'pixi-spine',
                'gsap',
                'gsap/PixiPlugin',
            ],
            output: {
                globals: {
                    'pixi.js': 'PIXI',
                },
            },
        },
        sourcemap: true,
    },
    plugins: [
        dts({
            rollupTypes: false,
            include: ['src'],
        }),
    ],
});
