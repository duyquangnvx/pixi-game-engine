---
phase: 3
title: "PixelRenderer Core Refactor"
status: pending
priority: P0
effort: 4h
---

# Phase 3: Core Refactor

## Context
- [Parent Plan](plan.md)
- [Phase 2: Format Conversion](phase-02-format-conversion.md)

## Overview
Replace canvas-based rendering with Phaser's `textures.generate()` API.

## Requirements
- Remove all off-screen canvas code
- Use `textures.generate()` for texture creation
- Regenerate texture on frame change and palette swap
- Maintain all existing public API

## Architecture

### Remove (Current Code)
```typescript
// DELETE these properties
private offscreenCanvas: HTMLCanvasElement | null = null;
private offscreenCtx: CanvasRenderingContext2D | null = null;

// DELETE these methods
private createOffscreenCanvas(): void { ... }
private createTexture(): void { ... }  // old canvas-based
private renderCurrentFrame(): void { ... }  // old putImageData
```

### Add (New Code)
```typescript
// NEW method using Phaser API
private generateTexture(): void {
  const frame = this.spriteData.frames[this.currentFrameIndex];
  if (!frame) return;

  // Remove old texture if exists
  if (this.scene.textures.exists(this.textureKey)) {
    this.scene.textures.remove(this.textureKey);
  }

  // Convert to Phaser format
  const data = this.frameToStringData(frame);
  const palette = this.paletteToPhaserFormat(this.currentPalette);

  // Generate texture using Phaser API
  this.scene.textures.generate(this.textureKey, {
    data,
    pixelWidth: 1,
    pixelHeight: 1,
    palette,
  });

  // Update sprite texture
  if (this.sprite) {
    this.sprite.setTexture(this.textureKey);
  }
}
```

### Method Updates
| Method | Change |
|--------|--------|
| `onAttach()` | Remove createOffscreenCanvas, use generateTexture |
| `renderCurrentFrame()` | Rename to generateTexture, use new logic |
| `setPalette()` | Call generateTexture after palette change |
| `setSpriteData()` | Remove canvas resize, call generateTexture |
| `onDetach()` | Remove canvas cleanup, keep texture removal |

## Related Files
- `packages/engine/src/pixel-art/pixel-renderer.ts`

## Implementation Steps

1. Add conversion helper methods (from Phase 2)
2. Remove offscreenCanvas and offscreenCtx properties
3. Remove createOffscreenCanvas() method
4. Replace createTexture() with new implementation using textures.generate()
5. Replace renderCurrentFrame() with generateTexture()
6. Update onAttach():
   - Remove createOffscreenCanvas() call
   - Call generateTexture() instead of renderCurrentFrame()
7. Update setPalette() to call generateTexture()
8. Update setSpriteData() to call generateTexture()
9. Update setFrameInternal() to call generateTexture()
10. Clean up onDetach() - remove canvas references

## Todo
- [ ] Add conversion helpers (Phase 2)
- [ ] Remove canvas properties
- [ ] Remove createOffscreenCanvas
- [ ] Implement generateTexture using textures.generate()
- [ ] Update onAttach
- [ ] Update setPalette
- [ ] Update setSpriteData
- [ ] Update setFrameInternal
- [ ] Clean up onDetach
- [ ] Build and verify no TS errors

## Success Criteria
- TypeScript compiles without errors
- Pixel art renders crisply (no blur)
- Animation plays correctly
- Palette swap works
- All events fire correctly

## Risk Assessment
- High - Major code change, must maintain feature parity
- Test thoroughly with demo-game

## Next Steps
Proceed to Phase 4: Validation
