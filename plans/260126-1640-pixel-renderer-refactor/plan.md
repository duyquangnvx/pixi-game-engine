---
title: "PixelRenderer Refactor - Phaser textures.generate() API"
description: "Refactor PixelRenderer to use Phaser's native texture generation for crisp pixel art"
status: pending
priority: P1
effort: 1d
branch: engine
tags: [pixel-art, refactor, phaser, textures]
created: 2026-01-26
---

# PixelRenderer Refactor

## Problem
Current PixelRenderer uses manual canvas + `putImageData()` causing:
- Blurry rendering (WebGL NEAREST filter resets on refresh)
- Complex code for simple pixel art rendering

## Solution
Use Phaser's native `textures.generate()` API which handles pixel art correctly.

## Reference
https://phaser.io/examples/v3.85.0/textures/view/generate-texture

## Data Flow
```
PixelSpriteData (indexed Uint8Array)
    ↓ convert
String[] + Phaser Palette
    ↓ textures.generate()
Phaser Texture (crisp pixels)
    ↓
Sprite display
```

## Phases

| # | Phase | Priority | Status | Est |
|---|-------|----------|--------|-----|
| 1 | [Game Config](phase-01-game-config.md) | P0 | Pending | 0.5h |
| 2 | [Format Conversion](phase-02-format-conversion.md) | P0 | Pending | 2h |
| 3 | [Core Refactor](phase-03-core-refactor.md) | P0 | Pending | 4h |
| 4 | [Validation](phase-04-validation.md) | P1 | Pending | 1h |

**Total**: ~1 day

## Files to Modify
- `packages/engine/src/pixel-art/pixel-renderer.ts` - Major refactor
- `packages/demo-game/src/game-config.ts` - Add pixelArt config

## Keep Unchanged
- `pixel-sprite.types.ts` - Types are good
- `pixel-art-builder.ts` - API is good

## Constraints
- Max 16 colors per palette (Phaser hex char limit: 0-F)
- Must maintain all existing public API
