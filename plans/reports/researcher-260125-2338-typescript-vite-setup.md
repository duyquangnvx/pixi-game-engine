# Research Report: TypeScript + Vite Setup for PixiJS Game Development

**Date**: 2026-01-25
**Focus**: Vite configuration, TypeScript best practices, project structure, build optimization, HMR workflow, and testing setup

---

## 1. Vite Configuration for PixiJS Projects

### Quick Start
PixiJS now provides an official CLI tool for scaffolding projects:
```bash
npm create pixi.js@latest
# For Vite template specifically:
npm create pixi.js@latest pixi-project -- --template bundler-vite
```

### Critical Configuration Note
**Top-level await issue**: Vite ≤6.0.6 has known issues with top-level await when building for production. Wrap PixiJS initialization code in async functions.

### Recommended vite.config.ts
```typescript
import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // For relative paths in production
  build: {
    target: 'esnext', // Modern browsers for games
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          pixi: ['pixi.js'], // Separate vendor chunk
        },
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
```

**Sources**: [PixiJS Quick Start](https://pixijs.com/8.x/guides/getting-started/quick-start), [PixiJS Create CLI](https://pixijs.io/create-pixi/docs/guide/installation/), [Mr Linxed Tutorial](https://mrlinxed.com/blog/pixijs-setup-with-vite-and-typescript)

---

## 2. TypeScript Configuration Best Practices

### 2026 Updates
- TypeScript 5.9 introduced revamped `tsc --init` with minimal best-practice defaults
- Import Defer Support (Stage 3) for performance optimization
- Improved `--module node20` support

### Recommended tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ESNext", "DOM", "DOM.Iterable"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@core/*": ["src/core/*"],
      "@systems/*": ["src/systems/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Key Principles
- **Strict mode by default**: Catches subtle bugs, reduces runtime errors
- **Pin dependencies**: Prevent automatic major version upgrades
- **Runtime validation**: Integrate Zod or io-ts for runtime type safety

**Sources**: [TypeScript Game Development Guide 2025](https://generalistprogrammer.com/tutorials/typescript-game-development-complete-guide-2025), [TypeScript Best Practices 2026](https://johal.in/typescript-best-practices-for-large-scale-web-applications-in-2026/), [State of TypeScript 2026](https://devnewsletter.com/p/state-of-typescript-2026)

---

## 3. Project Structure for Game Engines

### Recommended Structure
```
src/
├── core/           # Engine core systems
│   ├── Application.ts
│   ├── Scene.ts
│   └── GameLoop.ts
├── systems/        # ECS systems
│   ├── RenderSystem.ts
│   └── PhysicsSystem.ts
├── components/     # ECS components
│   ├── Transform.ts
│   └── Sprite.ts
├── entities/       # Game entities
│   └── Player.ts
├── utils/          # Utility functions
│   └── math.ts
├── types/          # Shared type definitions
│   └── index.ts
├── assets/         # Asset management
│   └── AssetLoader.ts
└── main.ts         # Entry point

tests/              # Test files mirror src structure
assets/             # Game assets (images, audio, etc.)
public/             # Static files
docs/               # Documentation
```

### Organization Approaches
1. **Component-based**: Files grouped by feature/component (better reusability)
2. **Type-based**: Types organized by nature (enums, interfaces, types)
3. **Global-based**: Centralized `types.ts` for shared definitions

**Sources**: [Building Game Engine with TypeScript](https://medium.com/@ringtved/building-a-game-engine-with-typescript-part-1-getting-started-a2876438a752), [TypeScript Project Structure Guide](https://plainenglish.io/blog/typescript-project-directory-structure-module-resolution-and-related-configuration-options), [Organizing TypeScript](https://gist.github.com/coltenkrauter/870b2654520a5366b072e4c460686efa)

---

## 4. Build Optimization for Production

### Bundle Analysis
```bash
npm install -D rollup-plugin-visualizer
```

Add to vite.config.ts:
```typescript
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [visualizer({ open: true })],
});
```

### Optimization Techniques
1. **Code Splitting**: Dynamic imports for on-demand loading
2. **Manual Chunks**: Separate vendor libraries
3. **Tree Shaking**: Remove unused code automatically
4. **Minification**: esbuild for fast compression
5. **Image Optimization**: vite-plugin-imagemin for asset compression
6. **Target Modern Browsers**: Reduces legacy polyfills

### Example Optimization Config
```typescript
build: {
  target: 'esnext',
  minify: 'esbuild',
  rollupOptions: {
    output: {
      manualChunks: (id) => {
        if (id.includes('node_modules')) {
          return 'vendor';
        }
      },
    },
  },
  chunkSizeWarningLimit: 1000,
}
```

**Sources**: [Vite Bundle Optimization](https://medium.com/@contact.francescodone/vite-bundle-optimization-f200a8e475be), [Analyzing Vite Bundle Size](https://dt.in.th/ViteBundleSize), [Reduce Phaser Game Bundle Size](https://phaser.discourse.group/t/reduce-the-bundle-size-of-a-game-using-vite-and-typescript/14046)

---

## 5. Development Workflow with HMR

Vite provides fast HMR out-of-the-box. For PixiJS games:

- **Preserve game state**: Use Vite's `import.meta.hot` API
- **Asset reloading**: PixiJS AssetPack integration for hot asset updates
- **Fast refresh**: Vite's ESM-based dev server enables sub-100ms updates

---

## 6. Testing Setup with Vitest

### Installation
```bash
npm install -D vitest jsdom @vitest/ui
```

### vitest.config.ts
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
});
```

### Benefits (2026)
- **10-20x faster** than Jest on large codebases
- **Native ESM support**: No configuration needed
- **Browser Mode**: Stable and production-ready
- **TypeScript out-of-the-box**: No additional setup

### Test Structure
Mirror src structure in tests folder:
```
tests/
├── core/
│   └── Application.test.ts
└── systems/
    └── RenderSystem.test.ts
```

**Sources**: [Vitest Documentation](https://vitest.dev/guide/), [Vitest vs Jest 2026](https://dev.to/dataformathub/vitest-vs-jest-30-why-2026-is-the-year-of-browser-native-testing-2fgb), [Testing in 2026](https://www.nucamp.co/blog/testing-in-2026-jest-react-testing-library-and-full-stack-testing-strategies)

---

## Summary

**Key Recommendations**:
1. Use PixiJS Create CLI for quick scaffolding
2. Enable TypeScript strict mode with ESNext target
3. Organize code using ECS-inspired structure (core/systems/components)
4. Implement code splitting and manual chunks for optimization
5. Use Vitest for 10-20x faster testing than Jest
6. Wrap async code to avoid top-level await issues in Vite ≤6.0.6

**Next Steps**: Implement base configuration, scaffold project structure, configure build pipeline.
