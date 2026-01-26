---
title: "PixelRenderer Component with Aseprite Support"
description: "Indexed palette pixel art renderer with runtime palette swap and Aseprite file loading"
status: complete
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
| 1 | [Type Definitions](phase-01-type-definitions.md) | P0 | Complete | 0.25d |
| 2 | [Aseprite Loader](phase-02-aseprite-loader.md) | P0 | Complete | 0.5d |
| 2b | [PixelArt Builder](phase-02b-pixel-art-builder.md) | P0 | Complete | 0.25d |
| 3 | [PixelRenderer Component](phase-03-pixel-renderer.md) | P0 | Complete | 1d |
| 4 | [Exports & Packaging](phase-04-exports-packaging.md) | P0 | Complete | 0.25d |

**Total Est**: ~2.25 days

## File Structure (Isolated Module)

```
packages/engine/src/
├── pixel-art/                    # ← Self-contained module
│   ├── pixel-sprite.types.ts     # Type definitions
│   ├── aseprite-loader.ts        # Binary Aseprite parser
│   ├── pixel-art-builder.ts      # LLM-friendly string format builder
│   ├── pixel-renderer.ts         # Main component
│   └── index.ts                  # Module exports
└── index.ts                      # Re-export from pixel-art/
```

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

### Option A: From Aseprite File (Artists)
```typescript
const buffer = await fetch('/hero.aseprite').then(r => r.arrayBuffer());
const spriteData = AsepriteLoader.parse(buffer, 'hero.aseprite');
```

### Option B: From ASCII String (LLM-friendly)
```typescript
const spriteData = PixelArtBuilder.fromString({
  frames: [`
    ..XX..
    .XSSX.
    XSBBSX
  `],
  colorMap: { '.': null, 'X': '#1a1a2e', 'S': '#8a8aaa', 'B': '#f0d0a0' },
});
```

### Usage
```typescript
const renderer = obj.addComponent(new PixelRenderer({
  spriteData,
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

## Validation Summary

**Validated:** 2026-01-26
**Questions asked:** 7

### Confirmed Decisions

| Decision | Choice |
|----------|--------|
| Buffer compatibility | Add buffer polyfill to Vite config |
| RGBA mode handling | Auto-generate palette from unique colors |
| No tags in file | Auto-create 'default' tag with all frames |
| Inline pixel data | Support both Aseprite files AND code-defined data |
| Palette validation | Strict match - error if palette size differs |
| Texture caching | No cache, per-instance textures |
| Animation speed | Add timeScale property for speed control |

### Action Items (Plan Updates Completed)
- [x] Phase 1: Add timeScale to PixelRendererConfig interface
- [x] Phase 2: Implement RGBA→Indexed auto-conversion in AsepriteLoader
- [x] Phase 2: Add 'default' tag creation when no tags present
- [x] Phase 3: Add timeScale property and validation in setPalette()
- [x] Phase 4: Add buffer polyfill to Vite config
