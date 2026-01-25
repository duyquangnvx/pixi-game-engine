# Phase 08: Game Objects

## Context Links
- [Plan Overview](./plan.md)
- [Game Engine Patterns Research](../reports/researcher-260125-2338-game-engine-patterns.md)

## Overview
- **Priority**: High
- **Status**: Pending
- **Description**: Create GameObject base class with hybrid OOP + Component system

## Key Insights
- OOP for clear organization and encapsulation
- Components for flexible behavior composition
- Hybrid approach balances simplicity and flexibility
- Transform shortcuts improve DX
- Proper destroy prevents memory leaks

## Requirements

### Functional
- GameObject wraps PIXI.Container
- Transform shortcuts (position, scale, rotation)
- Add/remove/get components
- Parent-child hierarchy
- Update propagation to components
- Clean destruction

### Non-Functional
- Component lookup O(1) via Map
- Minimal overhead per object
- Type-safe component access

## Architecture

```typescript
GameObject
├── id: string                          ─── Unique identifier
├── container: PIXI.Container           ─── Visual representation
├── components: Map<string, Component>  ─── Attached behaviors
├── children: Set<GameObject>           ─── Child objects
├── parent: GameObject | null           ─── Parent reference
└── update(dt) → components.forEach(c => c.update(dt))

Component
├── owner: GameObject                   ─── Back-reference
├── enabled: boolean                    ─── Active state
├── onAttach() / onDetach()             ─── Lifecycle
└── update?(dt)                         ─── Optional per-frame
```

## Related Code Files

### Create
- `src/objects/game-object.ts` - Base GameObject class (~120 lines)
- `src/objects/component.ts` - Component base class (~60 lines)
- `src/types/object.types.ts` - Object type definitions (~40 lines)

## Implementation Steps

1. Create `src/types/object.types.ts`:
   - ComponentClass type (constructor signature)
   - GameObjectConfig interface
   - TransformData interface

2. Create `src/objects/component.ts`:
   - Abstract Component class
   - owner: GameObject property
   - enabled: boolean (default true)
   - Abstract onAttach(): void
   - Abstract onDetach(): void
   - Optional update(dt: number): void
   - Helper methods if needed

3. Create `src/objects/game-object.ts`:
   - Static id counter for unique ids
   - Constructor creates PIXI.Container
   - Transform getters/setters:
     - position (x, y)
     - scale (scaleX, scaleY)
     - rotation
     - alpha
   - Component methods:
     - addComponent<T>(component: T): T
     - getComponent<T>(type: ComponentClass<T>): T | null
     - removeComponent(type: ComponentClass): void
     - hasComponent(type: ComponentClass): boolean
   - Hierarchy methods:
     - addChild(child: GameObject): void
     - removeChild(child: GameObject): void
     - getChildren(): GameObject[]
   - Lifecycle:
     - update(dt): update all enabled components
     - destroy(): remove from parent, destroy children, detach components

4. Create example components:
   - Simple movement component (for testing)

5. Integrate considerations:
   - Scenes can manage GameObjects
   - Objects can be pooled via ObjectPool

## Todo List

- [ ] Create object.types.ts
- [ ] Create component.ts base class
- [ ] Create game-object.ts
- [ ] Implement transform shortcuts
- [ ] Implement component management
- [ ] Implement hierarchy
- [ ] Implement update propagation
- [ ] Implement destroy cleanup
- [ ] Create test component
- [ ] Test component lifecycle
- [ ] Test hierarchy
- [ ] Test destroy cleanup

## Success Criteria

- GameObject creates with PIXI.Container
- Transform shortcuts work correctly
- Components attach and receive updates
- Hierarchy add/remove works
- Destroy cleans up everything
- No memory leaks after destroy
- Type-safe component access

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Circular references | High | Weak refs or explicit cleanup |
| Component order dependency | Medium | Document update order |
| Deep hierarchy performance | Low | Limit nesting depth |

## Security Considerations
- No user data in game objects

## Next Steps

- Proceed to Phase 09: Utilities
- EventBus and ObjectPool support GameObjects
