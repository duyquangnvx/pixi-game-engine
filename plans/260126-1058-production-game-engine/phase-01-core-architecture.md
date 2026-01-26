# Phase 1: Core Architecture

## Context Links
- [Plan Overview](./plan.md)
- [Research: Architecture](../reports/researcher-260126-1058-game-engine-architecture.md)

## Overview
- **Priority**: P0 (Critical)
- **Status**: Pending
- **Est**: 2 days
- **Description**: EventBus, ObjectPool, enhanced Component lifecycle

## Key Insights
1. Use `eventemitter3` instead of custom EventBus (~1KB, battle-tested)
2. Pre-allocated pools prevent GC pauses
3. Composition-based design is Phaser 4 ECS-ready

## Requirements

### Functional
- F1: Global EventBus with typed events
- F2: ObjectPool for reusable GameObjects
- F3: Component priority for update order
- F4: Lifecycle hooks: onEnable, onDisable, lateUpdate

### Non-Functional
- NF1: Zero allocations in update loop
- NF2: Type-safe event definitions
- NF3: Under 5KB gzipped

## Architecture

### EventBus (using eventemitter3)
```typescript
import { EventEmitter } from 'eventemitter3';

// Typed events wrapper
interface GameEvents {
  'player:damaged': { damage: number; source: string };
  'enemy:killed': { enemy: GameObject };
  'scene:ready': void;
}

// Singleton instance with typed events
const eventBus = new EventEmitter<GameEvents>();
export { eventBus };
```

### ObjectPool
```typescript
class ObjectPool<T extends GameObject> {
  pool: T[]
  active: Set<T>
  factory: () => T

  acquire(): T
  release(obj: T): void
  prewarm(count: number): void
}
```

## Related Code Files

### Create
- `src/core/event-bus.ts`
- `src/core/object-pool.ts`
- `src/core/index.ts`
- `src/types/event.types.ts`

### Modify
- `src/game-objects/component.ts` - add priority, lifecycle
- `src/game-objects/game-object.ts` - add event shortcuts
- `src/game-objects/component-manager.ts` - priority sorting

## Implementation Steps

1. Install `eventemitter3` package
2. Create typed EventBus wrapper with GameEvents interface
3. Create ObjectPool with acquire/release/prewarm
4. Add `priority: number` to Component
5. Add `onEnable()`, `onDisable()` hooks
6. Add optional `lateUpdate(dt)` method
7. Sort components by priority in ComponentManager

## Todo List
- [ ] Install eventemitter3 package
- [ ] Create typed EventBus wrapper
- [ ] Create ObjectPool generic class
- [ ] Add component priority
- [ ] Add onEnable/onDisable hooks
- [ ] Add lateUpdate lifecycle
- [ ] Update ComponentManager for priority
- [ ] Write unit tests
- [ ] Update exports

## Success Criteria
- EventBus passes type-safety tests
- ObjectPool handles 1000 objects without GC
- Component priority affects update order
- Existing demo code unchanged

## Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking existing API | High | Backwards-compatible only |
| Pool exhaustion | Low | Auto-expand with warning |

## Dependencies
- `eventemitter3` - lightweight event emitter (~1KB gzipped)
