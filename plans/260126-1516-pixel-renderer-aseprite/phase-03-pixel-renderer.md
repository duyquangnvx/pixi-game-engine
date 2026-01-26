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
`packages/engine/src/components/pixel-renderer.ts` (~150 lines)

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
1. Update currentPalette
2. Re-render current frame
3. Emit paletteChange event

## Phaser Integration
- Use `DynamicTexture` for efficient pixel updates
- Set `FilterMode.NEAREST` for pixel-perfect scaling
- Add sprite to owner container

## Todo
- [ ] Create pixel-renderer.ts
- [ ] Implement constructor and config handling
- [ ] Implement onAttach (create texture, sprite)
- [ ] Implement renderFrame (indexed → RGBA)
- [ ] Implement animation update loop
- [ ] Implement play/stop/pause/resume
- [ ] Implement setPalette
- [ ] Implement setSpriteData
- [ ] Implement property getters/setters
- [ ] Implement onDetach (cleanup)
- [ ] Export from components/index.ts

## Success Criteria
- Renders pixel art from PixelSpriteData
- Animations play with correct timing
- Palette swap updates display instantly
- Events fire correctly
- Proper cleanup on detach
