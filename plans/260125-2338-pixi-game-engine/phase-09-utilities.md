# Phase 09: Utilities

## Context Links
- [Plan Overview](./plan.md)
- [PixiJS Ecosystem Libraries](../reports/researcher-260125-2338-pixi-ecosystem-libs.md)

## Overview
- **Priority**: Medium
- **Status**: Pending
- **Description**: Create utility classes for events, pooling, and math

## Key Insights
- PixiJS uses eventemitter3 internally
- We can use EventEmitter from PIXI.utils
- Object pooling prevents GC hitches
- Math utilities are used everywhere

## Requirements

### Functional
- EventBus: emit, on, once, off (using eventemitter3)
- ObjectPool: acquire, release, prewarm
- Math: clamp, lerp, random, distance, normalize

### Non-Functional
- EventBus uses PIXI.utils.EventEmitter
- ObjectPool acquire O(1)
- Math functions simple and fast

## Architecture

```typescript
EventBus (wraps PIXI.utils.EventEmitter)
├── emit(event, data)
├── on(event, callback)
├── once(event, callback)
└── off(event, callback?)

ObjectPool<T>
├── pool: T[]
├── factory: () => T
├── acquire(): T
├── release(obj: T)
└── prewarm(count)

MathUtils (namespace)
├── clamp, lerp, inverseLerp
├── randomRange, randomInt
├── degToRad, radToDeg
└── distance, normalize
```

## Related Code Files

### Create
- `src/utils/event-bus.ts` - EventEmitter wrapper (~50 lines)
- `src/utils/object-pool.ts` - Generic object pool (~60 lines)
- `src/utils/math.ts` - Math utilities (~70 lines)

## Implementation Steps

1. Create `src/utils/event-bus.ts`:
   - Use PIXI.utils.EventEmitter (eventemitter3 under hood)
   - Singleton pattern
   - getInstance(): EventBus
   - emit<T>(event, data?): void
   - on<T>(event, callback): void
   - once<T>(event, callback): void
   - off(event, callback?): void
   - clear(): void

2. Create `src/utils/object-pool.ts`:
   - Generic ObjectPool<T> class
   - constructor(factory, initialSize?, reset?)
   - acquire(): T
   - release(obj): void
   - prewarm(count): void
   - clear(): void
   - size: number

3. Create `src/utils/math.ts`:
   - MathUtils namespace
   - clamp(value, min, max): number
   - lerp(start, end, t): number
   - inverseLerp(start, end, value): number
   - randomRange(min, max): number
   - randomInt(min, max): number
   - degToRad(degrees): number
   - radToDeg(radians): number
   - distance(x1, y1, x2, y2): number
   - normalize(x, y): {x, y}

4. Export from utils/index.ts

## Todo List

- [ ] Create event-bus.ts using PIXI.utils.EventEmitter
- [ ] Create object-pool.ts
- [ ] Create math.ts
- [ ] Create utils/index.ts exports
- [ ] Test EventBus
- [ ] Test ObjectPool
- [ ] Test MathUtils

## Success Criteria

- EventBus emits to all listeners
- ObjectPool reuses objects correctly
- Math functions return correct values
- No memory leaks

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Event listener leaks | Medium | Provide clear() method |
| Pool exhaustion | Low | Fall back to factory |

## Next Steps

- Proceed to Phase 10: Demo Example
