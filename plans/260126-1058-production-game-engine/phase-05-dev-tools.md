# Phase 5: Developer Tools

## Context Links
- [Plan Overview](./plan.md)
- [Phase 4](./phase-04-utilities.md)

## Overview
- **Priority**: P2 (Medium)
- **Status**: Pending
- **Est**: 1 day
- **Description**: Debug overlay, profiler, dev aids

## Key Insights
1. FPS counter essential for monitoring
2. Toggle via keyboard (F3 typical)
3. Minimal impact when disabled
4. Tree-shake in production

## Requirements

### Functional
- F1: Debug overlay (FPS, memory, object count)
- F2: Performance profiler (frame time)
- F3: Collider visualization
- F4: Console logging levels

## Architecture

### DebugOverlay
```typescript
class DebugOverlay {
  visible: boolean

  toggle(): void
  addPanel(panel): void
}
```

### Profiler
```typescript
class Profiler {
  frameTime: number
  updateTime: number
  renderTime: number

  beginFrame(): void
  endUpdate(): void
  endFrame(): void
}
```

## Related Code Files

### Create
- `src/debug/debug-overlay.ts`
- `src/debug/profiler.ts`
- `src/debug/collider-debug.ts`
- `src/debug/logger.ts`
- `src/debug/index.ts`

## Implementation Steps

1. Create DebugOverlay with FPS
2. Add memory + object count
3. Create Profiler
4. Create ColliderDebug visualization
5. Create Logger with levels
6. Add F3 toggle

## Todo List
- [ ] Create DebugOverlay
- [ ] Create Profiler
- [ ] Create ColliderDebug
- [ ] Create Logger
- [ ] F3 toggle
- [ ] Tree-shake in prod

## Success Criteria
- Overlay shows accurate FPS
- Profiler identifies spikes
- Colliders visible in debug
- Logger respects prod mode
