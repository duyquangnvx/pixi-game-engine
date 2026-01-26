---
phase: 1
title: "Type Definitions"
status: pending
priority: P0
effort: 0.25d
---

# Phase 1: Type Definitions

## Context
- Parent: [plan.md](plan.md)
- Pattern reference: `packages/engine/src/types/animation.types.ts`

## Overview
Define TypeScript interfaces for PixelSpriteData, frames, animation tags, and component config.

## File to Create
`packages/engine/src/pixel-art/pixel-sprite.types.ts` (~30 lines)

## Implementation

```typescript
/**
 * RGBA color tuple [r, g, b, a] where each value is 0-255
 */
export type RGBAColor = [number, number, number, number];

/**
 * Indexed color palette for pixel art
 */
export interface PixelPalette {
  colors: RGBAColor[];
}

/**
 * Single frame of pixel art animation
 */
export interface PixelFrame {
  index: number;
  duration: number;
  width: number;
  height: number;
  indexedData: Uint8Array;
}

/**
 * Animation tag defining a named sequence
 */
export interface AnimationTag {
  name: string;
  from: number;
  to: number;
  direction: 'forward' | 'reverse' | 'pingpong';
  repeat: number;
}

/**
 * Complete pixel sprite data structure
 */
export interface PixelSpriteData {
  width: number;
  height: number;
  frames: PixelFrame[];
  palette: PixelPalette;
  tags: AnimationTag[];
}

/**
 * Configuration for PixelRenderer component
 */
export interface PixelRendererConfig {
  spriteData: PixelSpriteData;
  scale?: number;
  defaultAnimation?: string;
  autoPlay?: boolean;
  /** Animation speed multiplier (default: 1). Use 0.5 for slow-mo, 2 for fast */
  timeScale?: number;
}

/**
 * Events emitted by PixelRenderer
 */
export interface PixelRendererEvents {
  animationComplete: (tag: string) => void;
  frameChange: (frameIndex: number, tag: string) => void;
  paletteChange: (palette: PixelPalette) => void;
}
```

## Todo
- [ ] Create pixel-art/ folder
- [ ] Create pixel-sprite.types.ts file

## Success Criteria
- All interfaces defined with proper JSDoc
- Types exported and accessible
