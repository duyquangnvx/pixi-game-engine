# Phase 3: Scene Management

## Context Links
- [Plan Overview](./plan.md)
- [Phase 2](./phase-02-built-in-components.md)

## Overview
- **Priority**: P1 (High)
- **Status**: Pending
- **Est**: 2 days
- **Description**: Scene lifecycle, transitions, asset management

## Key Insights
1. Scenes are self-contained "Game Worlds"
2. Registry for cross-scene communication
3. Shared assets in boot, lazy load scene-specific
4. pause() vs sleep() for different use cases

## Requirements

### Functional
- F1: BaseScene with standardized lifecycle
- F2: Scene transitions with effects
- F3: Asset manifest and loading progress
- F4: Scene data passing

### Non-Functional
- NF1: Clean resource cleanup on shutdown
- NF2: Loading screen customization
- NF3: Scene preloading capability

## Architecture

### BaseScene Lifecycle
```
constructor → init(data) → preload → create → update → shutdown
```

### SceneManager
```typescript
class SceneManager {
  goto(key, data?, transition?): Promise
  push(key, data?): void
  pop(): void
  preload(keys: string[]): Promise
}
```

### Transitions
- Fade in/out
- Slide (left, right, up, down)
- Custom transition support

## Related Code Files

### Create
- `src/scenes/base-scene.ts`
- `src/scenes/scene-manager.ts`
- `src/scenes/transitions.ts`
- `src/scenes/loading-scene.ts`
- `src/scenes/index.ts`
- `src/types/scene.types.ts`

## Implementation Steps

1. Create BaseScene extending Phaser.Scene
2. Create SceneManager wrapper
3. Implement fade transition
4. Implement slide transitions
5. Create LoadingScene template
6. Add scene preloading

## Todo List
- [ ] Create BaseScene
- [ ] Create SceneManager
- [ ] Implement transitions
- [ ] Create LoadingScene
- [ ] Scene preloading
- [ ] Integration tests

## Success Criteria
- Scenes transition smoothly
- Assets load with progress
- No memory leaks on switch
- Scene stack works
