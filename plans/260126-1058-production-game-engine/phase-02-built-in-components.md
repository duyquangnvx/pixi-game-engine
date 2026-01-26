# Phase 2: Built-in Components

## Context Links
- [Plan Overview](./plan.md)
- [Phase 1](./phase-01-core-architecture.md)

## Overview
- **Priority**: P0 (Critical)
- **Status**: Pending
- **Est**: 3 days
- **Description**: Essential components for 2D game development

## Key Insights
1. Transform centralizes position/rotation/scale
2. SpriteRenderer decouples visual from logic
3. Animator handles sprite sheet animations
4. Collider wraps Arcade Physics bodies
5. Spine 3.7 support via `phaser-spine` plugin for skeletal animations

## Requirements

### Functional
- F1: Transform with local/world coordinates
- F2: SpriteRenderer with texture/tint/flip
- F3: Animator with state machine
- F4: Collider with Arcade Physics
- F5: RigidBody for physics movement
- F6: SpineRenderer for Spine 3.7 skeletal animations

### Non-Functional
- NF1: Components work independently
- NF2: Hot-swappable at runtime
- NF3: Minimal boilerplate

## Architecture

### Component Hierarchy
```
Component (abstract)
├── Transform
├── SpriteRenderer (requires Transform)
├── Animator (requires SpriteRenderer)
├── SpineRenderer (requires Transform) ← Spine 3.7 support
├── Collider (requires Transform)
└── RigidBody (requires Collider)
```

### Transform
```typescript
class Transform extends Component {
  localPosition: Vector2
  localRotation: number
  localScale: Vector2
  parent: Transform | null

  get position(): Vector2  // world
  get rotation(): number   // world
  setParent(parent): void
}
```

## Related Code Files

> **Note**: All paths relative to `packages/engine/` (after Phase 0)

### Create
- `src/components/transform.ts`
- `src/components/sprite-renderer.ts`
- `src/components/animator.ts`
- `src/components/spine-renderer.ts` ← Spine 3.7
- `src/components/collider.ts`
- `src/components/rigid-body.ts`
- `src/components/index.ts`
- `src/types/animation.types.ts`
- `src/types/spine.types.ts`

## Implementation Steps

1. Create Transform with parent hierarchy
2. Create SpriteRenderer with texture management
3. Create Animator with state machine
4. **Create SpineRenderer wrapping phaser-spine plugin**
   - Load .json + .atlas + .png assets
   - Play/pause/stop animations
   - Animation events (start, complete, event)
   - Skin switching
   - Mix animations
5. Create Collider wrapping Arcade body
6. Create RigidBody for physics
7. Add dependency validation

## Todo List
- [ ] Create Transform
- [ ] Create SpriteRenderer
- [ ] Create Animator
- [ ] Create SpineRenderer (Spine 3.7)
- [ ] Create Collider
- [ ] Create RigidBody
- [ ] Component dependency validation
- [ ] Unit tests
- [ ] Demo scene with Spine character

## Success Criteria
- Transform hierarchy works
- SpriteRenderer displays textures
- Animator plays animations
- **SpineRenderer plays Spine 3.7 animations**
- Collider detects collisions
- RigidBody responds to physics

## Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|------------|
| Arcade Physics limits | Medium | Document features |
| Many colliders perf | Medium | Collision layers |
| Spine 3.7 only | Low | Document version, team uses 3.7 |

## Dependencies
- `phaser-spine` - Spine runtime for Phaser (compatible with Spine 3.7)
