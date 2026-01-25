# Phase 02: Core Engine

## Context Links
- [Plan Overview](./plan.md)
- [PixiJS Architecture Research](../reports/researcher-260125-2338-pixijs-architecture.md)
- [GSAP Integration Research](../reports/researcher-260125-2338-gsap-integration.md)

## Overview
- **Priority**: Critical
- **Status**: Pending
- **Description**: Create main Game class, Application wrapper, and GSAP-based game loop

## Key Insights
- GSAP ticker should be master clock (stop PixiJS ticker)
- Singleton pattern for Game class enables global access
- Application wrapper abstracts PixiJS setup complexity
- deltaTime in seconds is more intuitive than frames

## Requirements

### Functional
- Game class initializes all systems
- Application wrapper creates PixiJS canvas
- Game loop updates at consistent rate
- Pause/resume functionality works

### Non-Functional
- Game loop runs at 60fps
- Initialization < 500ms
- Memory footprint < 10MB base

## Architecture

```typescript
// Flow
Game.initialize(config)
  → GameApplication.create(config)
    → PIXI.Application setup
  → GameLoop.start()
    → GSAP ticker drives updates
  → Systems initialize (input, audio, etc.)
```

## Related Code Files

### Create
- `src/core/game.ts` - Main Game class (~100 lines)
- `src/core/application.ts` - PixiJS Application wrapper (~80 lines)
- `src/core/game-loop.ts` - GSAP-based game loop (~60 lines)
- `src/types/engine.types.ts` - Engine type definitions (~40 lines)

## Implementation Steps

1. Create `src/types/engine.types.ts`:
   - GameConfig interface (width, height, backgroundColor, etc.)
   - UpdateCallback type
   - GameState enum

2. Create `src/core/application.ts`:
   - GameApplication class wrapping PIXI.Application
   - Async initialization method
   - Canvas mounting to DOM
   - Resize handling
   - Destroy cleanup

3. Create `src/core/game-loop.ts`:
   - GameLoop class using GSAP ticker
   - Stop PixiJS ticker on start
   - Add/remove update callbacks
   - Pause/resume methods
   - Delta time conversion (ms to seconds)

4. Create `src/core/game.ts`:
   - Singleton pattern
   - Initialize method (async)
   - System accessors (scenes, input, assets, audio)
   - Start/pause/resume/destroy methods
   - Register with game loop

5. Update `src/main.ts`:
   - Import and initialize Game
   - Basic test to verify setup

## Todo List

- [ ] Create engine.types.ts
- [ ] Create application.ts
- [ ] Create game-loop.ts
- [ ] Create game.ts
- [ ] Update main.ts with test
- [ ] Verify game loop runs
- [ ] Verify pause/resume works
- [ ] Test memory cleanup on destroy

## Success Criteria

- Game.getInstance() returns singleton
- Game.initialize() creates PixiJS canvas
- Game loop fires update callbacks at ~60fps
- Delta time is in seconds (0.016 at 60fps)
- Pause stops updates, resume continues
- Destroy cleans up all resources

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| GSAP/PixiJS ticker conflict | High | Fully stop PixiJS ticker |
| Memory leak on destroy | High | Proper cleanup sequence |
| Delta time spikes | Medium | Cap max deltaTime to 0.25s |

## Security Considerations
- No user input handling yet
- No network requests

## Next Steps

- Proceed to Phase 03: Scene System
- SceneManager will integrate with Game and GameLoop
