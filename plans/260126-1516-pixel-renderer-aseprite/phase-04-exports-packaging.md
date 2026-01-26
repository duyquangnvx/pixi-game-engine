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
Update export files and package.json to expose new components.

## Files to Modify

### 1. packages/engine/package.json
Add dependency:
```json
"dependencies": {
  "ase-parser": "^1.1.0"
}
```

### 2. packages/engine/src/types/index.ts
Add export:
```typescript
export * from './pixel-sprite.types';
```

### 3. packages/engine/src/components/index.ts
Add exports:
```typescript
export { PixelRenderer } from './pixel-renderer';
```

### 4. packages/engine/src/utils/index.ts
Add export:
```typescript
export { AsepriteLoader } from './aseprite-loader';
```

### 5. packages/engine/src/index.ts
Add to main exports:
```typescript
// Components
export { PixelRenderer } from './components/pixel-renderer';

// Utils
export { AsepriteLoader } from './utils/aseprite-loader';

// Types
export type {
  PixelSpriteData,
  PixelFrame,
  AnimationTag,
  PixelPalette,
  RGBAColor,
  PixelRendererConfig,
  PixelRendererEvents,
} from './types/pixel-sprite.types';
```

## Todo
- [ ] Add ase-parser to package.json
- [ ] Update types/index.ts
- [ ] Update components/index.ts
- [ ] Update utils/index.ts
- [ ] Update main index.ts
- [ ] Run pnpm install
- [ ] Run pnpm typecheck
- [ ] Run pnpm build

## Success Criteria
- All exports accessible from '@pge/core'
- TypeScript compilation passes
- Build succeeds without errors
