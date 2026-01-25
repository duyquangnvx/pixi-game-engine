# Phase 03: Scene System

## Context Links
- [Plan Overview](./plan.md)
- [Game Engine Patterns Research](../reports/researcher-260125-2338-game-engine-patterns.md)

## Overview
- **Priority**: Critical
- **Status**: Pending
- **Description**: Create stack-based SceneManager with Scene base class

## Key Insights
- Stack-based approach enables pause/resume naturally
- Lifecycle methods (enter/exit/pause/resume) provide clear hooks
- Only top scene receives updates by default
- **Paused scenes remain visible but don't receive updates** (good for pause overlays)
- Scene transitions can be async for loading

## Requirements

### Functional
- Push scene pauses current, activates new
- Pop scene destroys current, resumes previous
- Replace combines pop + push
- Scenes have lifecycle methods
- Scene containers auto-added/removed from stage

### Non-Functional
- Scene switch < 100ms (excluding load)
- No memory leaks on scene changes
- Clean separation of scene logic

## Architecture

```typescript
// Stack behavior
[MenuScene] ← current
push(GameScene) → [MenuScene, GameScene] ← current (Menu paused)
push(PauseScene) → [MenuScene, GameScene, PauseScene] ← current
pop() → [MenuScene, GameScene] ← current (GameScene resumed)
```

## Related Code Files

### Create
- `src/scenes/scene.ts` - Abstract Scene base class (~60 lines)
- `src/scenes/scene-manager.ts` - Stack-based manager (~120 lines)
- `src/types/scene.types.ts` - Scene type definitions (~30 lines)

## Implementation Steps

1. Create `src/types/scene.types.ts`:
   - SceneState enum (Inactive, Active, Paused)
   - SceneTransition type
   - SceneEvents type

2. Create `src/scenes/scene.ts`:
   - Abstract class with PIXI.Container
   - Reference to Game instance
   - Protected state property
   - Abstract methods: onEnter(), onUpdate(dt), onExit()
   - Optional methods: onPause(), onResume()
   - Helper: addChild(), removeChild()

3. Create `src/scenes/scene-manager.ts`:
   - Private scene stack array
   - Reference to stage container
   - push(scene): pause current, add new, call onEnter
   - pop(): call onExit, remove, resume previous
   - replace(scene): pop then push
   - clear(): pop all scenes
   - update(dt): update top scene
   - Getters: current, stack, isEmpty

4. Integrate with Game class:
   - Add SceneManager instance
   - Add scenes getter
   - Pass game reference to scenes

5. Update game-loop.ts:
   - SceneManager.update() called in loop

## Todo List

- [ ] Create scene.types.ts
- [ ] Create scene.ts base class
- [ ] Create scene-manager.ts
- [ ] Integrate with Game class
- [ ] Update game loop integration
- [ ] Test push/pop behavior
- [ ] Test pause/resume callbacks
- [ ] Verify container cleanup

## Success Criteria

- Push adds scene to stack and stage
- Pop removes scene and calls onExit
- Paused scenes don't receive updates
- Resumed scenes continue from where they left off
- Replace works atomically
- Clear empties entire stack
- No orphaned containers after scene changes

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Scene reference leaks | High | Explicit destroy in onExit |
| Async scene loading race | Medium | Queue transitions |
| Stack underflow on pop | Low | Check isEmpty before pop |

## Security Considerations
- Scenes may load external assets (handled in Phase 5)

## Next Steps

- Proceed to Phase 04: Input System
- Input will be scene-context aware
