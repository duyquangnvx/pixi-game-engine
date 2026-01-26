---
phase: 4
title: "Exports & Packaging"
status: pending
priority: P0
effort: 0.25d
---

# Phase 4: Exports & Packaging

## Context
- Parent: [plan.md](plan.md)
- Depends on: All previous phases

## Overview
Create module index and update main exports with browser compatibility.

## Files to Create/Modify

### 1. packages/engine/src/pixel-art/index.ts (NEW)
Module barrel export:
```typescript
// Types
export type {
  RGBAColor,
  PixelPalette,
  PixelFrame,
  AnimationTag,
  PixelSpriteData,
  PixelRendererConfig,
  PixelRendererEvents,
} from './pixel-sprite.types';

export type { PixelArtConfig } from './pixel-art-builder';

// Classes
export { AsepriteLoader } from './aseprite-loader';
export { PixelArtBuilder } from './pixel-art-builder';
export { PixelRenderer } from './pixel-renderer';
```

### 2. packages/engine/src/index.ts
Add re-export from pixel-art module:
```typescript
// Pixel Art module
export * from './pixel-art';
```

### 3. packages/engine/package.json
Add dependencies:
```json
"dependencies": {
  "ase-parser": "^1.1.0",
  "buffer": "^6.0.3"
}
```

### 4. packages/engine/vite.config.ts
Add Buffer polyfill for browser compatibility:
```typescript
import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: {
      buffer: 'buffer/',
    },
  },
  define: {
    'global.Buffer': 'Buffer',
  },
  optimizeDeps: {
    include: ['buffer'],
  },
  // ... existing config
});
```

## Todo
- [ ] Create pixel-art/index.ts barrel export
- [ ] Add re-export to main index.ts
- [ ] Add ase-parser and buffer to package.json
- [ ] Add Buffer polyfill to vite.config.ts
- [ ] Run pnpm install
- [ ] Run pnpm typecheck
- [ ] Run pnpm build
- [ ] Test in browser environment

## Success Criteria
- All exports accessible from '@pge/core'
- Sub-path import works: `import { PixelRenderer } from '@pge/core/pixel-art'`
- TypeScript compilation passes
- Build succeeds without errors
- Buffer polyfill works in browser (no "Buffer is not defined" error)
