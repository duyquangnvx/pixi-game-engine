---
phase: 3
title: "PixelRenderer Component"
status: pending
priority: P0
effort: 1d
---

# Phase 3: PixelRenderer Component

## Context
- Parent: [plan.md](plan.md)
- Depends on: [Phase 1](phase-01-type-definitions.md), [Phase 2](phase-02-aseprite-loader.md)
- Pattern: `packages/engine/src/components/sprite-renderer.ts`, `animator.ts`

## Overview
Main component for rendering indexed palette pixel art with animation and runtime palette swapping.

## File to Create
`packages/engine/src/pixel-art/pixel-renderer.ts` (~150 lines)

## API Design

```typescript
class PixelRenderer extends Component {
  priority = 0;
  events: EventEmitter<PixelRendererEvents>;

  constructor(config: PixelRendererConfig);

  // Lifecycle
  onAttach(): void;
  onDetach(): void;
  update(dt: number): void;

  // Animation
  play(tagName: string, restart?: boolean): void;
  stop(): void;
  pause(): void;
  resume(): void;
  setFrame(index: number): void;

  // Appearance
  setPalette(palette: PixelPalette): void;
  setSpriteData(data: PixelSpriteData): void;

  // Properties
  get current(): string | null;
  get frameIndex(): number;
  get/set scale: number;
  get/set flipX: boolean;
  get/set flipY: boolean;
  get/set timeScale: number; // Animation speed (0.5 = slow, 2 = fast)
}
```

## Internal State
```typescript
private spriteData: PixelSpriteData;
private currentPalette: PixelPalette;
private dynamicTexture: Phaser.Textures.DynamicTexture | null;
private sprite: Phaser.GameObjects.Sprite | null;
private currentTag: AnimationTag | null;
private currentFrameIndex: number;
private frameTimer: number;
private isPlaying: boolean;
private _timeScale: number = 1; // Animation speed multiplier
```

## Key Methods

### renderFrame(frameIndex)
1. Get frame data (indexedData)
2. Convert indexed → RGBA using currentPalette
3. Create ImageData
4. dynamicTexture.putData()

### update(dt)
1. If not playing, return
2. frameTimer += dt
3. If frameTimer >= frame.duration → advanceFrame()

### advanceFrame()
1. Handle direction (forward/reverse/pingpong)
2. Handle looping (repeat)
3. Emit events (frameChange, animationComplete)

### setPalette(palette)
1. **Validate palette size** - Must match original palette length
   ```typescript
   if (palette.colors.length !== this.spriteData.palette.colors.length) {
     throw new Error(`Palette size mismatch: expected ${this.spriteData.palette.colors.length}, got ${palette.colors.length}`);
   }
   ```
2. Update currentPalette
3. Re-render current frame
4. Emit paletteChange event

### update(dt) - with timeScale
```typescript
update(dt: number): void {
  if (!this.isPlaying || !this.currentTag) return;

  const frame = this.spriteData.frames[this.currentFrameIndex];
  this.frameTimer += dt * this._timeScale; // Apply timeScale

  if (this.frameTimer >= frame.duration) {
    this.frameTimer -= frame.duration;
    this.advanceFrame();
  }
}
```

## Phaser Integration
- Use `DynamicTexture` for efficient pixel updates
- Set `FilterMode.NEAREST` for pixel-perfect scaling
- Add sprite to owner container

## Todo
- [ ] Create pixel-renderer.ts in pixel-art/
- [ ] Implement constructor and config handling
- [ ] Implement onAttach (create texture, sprite)
- [ ] Implement renderFrame (indexed → RGBA)
- [ ] Implement animation update loop with timeScale
- [ ] Implement play/stop/pause/resume
- [ ] Implement setPalette with size validation
- [ ] Implement setSpriteData
- [ ] Implement property getters/setters (including timeScale)
- [ ] Implement onDetach (cleanup)

## Success Criteria
- Renders pixel art from PixelSpriteData
- Animations play with correct timing
- timeScale affects animation speed correctly
- Palette swap updates display instantly
- Palette validation throws error on size mismatch
- Events fire correctly
- Proper cleanup on detach
