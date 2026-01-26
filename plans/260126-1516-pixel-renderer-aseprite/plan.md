---
title: "PixelRenderer Component with Aseprite Support"
description: "Indexed palette pixel art renderer with runtime palette swap and Aseprite file loading"
status: pending
priority: P1
effort: 2d
branch: engine
tags: [pixel-art, aseprite, palette-swap, component]
created: 2026-01-26
---

# PixelRenderer Component with Aseprite Support

## Overview
PixelRenderer component renders pixel art from indexed palette data using Phaser DynamicTexture. Features frame-based animation with tags, runtime palette swapping for skin/upgrade systems.

## Data Flow
```
Aseprite File → AsepriteLoader.parse() → PixelSpriteData → PixelRenderer → Phaser DynamicTexture
```

## Phases

| # | Phase | Priority | Status | Est |
|---|-------|----------|--------|-----|
| 1 | [Type Definitions](phase-01-type-definitions.md) | P0 | Pending | 0.25d |
| 2 | [Aseprite Loader](phase-02-aseprite-loader.md) | P0 | Pending | 0.5d |
| 3 | [PixelRenderer Component](phase-03-pixel-renderer.md) | P0 | Pending | 1d |
| 4 | [Exports & Packaging](phase-04-exports-packaging.md) | P0 | Pending | 0.25d |

**Total Est**: ~2 days

## Architecture

```
┌─────────────────────────────────────────┐
│           PixelRenderer                 │
│  ┌─────────────────────────────────┐   │
│  │  spriteData: PixelSpriteData    │   │
│  │  currentPalette: PixelPalette   │   │
│  │  dynamicTexture: DynamicTexture │   │
│  └─────────────────────────────────┘   │
│  play() | stop() | setPalette()        │
│  setSpriteData() | events              │
└─────────────────────────────────────────┘
              ↑
┌─────────────────────────────────────────┐
│         AsepriteLoader.parse()          │
│  .ase/.aseprite → PixelSpriteData      │
└─────────────────────────────────────────┘
```

## API Preview

```typescript
const renderer = obj.addComponent(new PixelRenderer({
  spriteData: loadedData,
  scale: 4,
  defaultAnimation: 'idle',
}));

renderer.play('walk');
renderer.setPalette(FIRE_SKIN_PALETTE);
renderer.events.on('animationComplete', (tag) => { ... });
```

## Dependencies
- ase-parser: ^1.1.0 (Aseprite file parsing)
- eventemitter3: ^5.0.4 (already in project)

## Risk Assessment
- ase-parser may need Buffer polyfill for browser
- Handle both RGBA and Indexed Aseprite color modes
