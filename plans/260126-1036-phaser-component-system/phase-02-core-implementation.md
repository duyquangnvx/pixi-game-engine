# Phase 02: Core Implementation

## Context Links
- [Plan Overview](./plan.md)
- [Phase 01: Project Setup](./phase-01-project-setup.md)

## Overview
- **Priority**: Critical
- **Status**: Pending
- **Est**: 2 hours
- **Description**: Implement GameObject, Component, and ComponentManager

## Key Insights

- Phaser Container already has: add/remove children, position/scale/rotation, parent ref
- Scene 'update' event provides time & delta for component updates
- Use Map<Constructor, Component> for O(1) type-based lookup
- Override destroy() to ensure component cleanup

## Requirements

### Functional
- GameObject wraps Phaser.Container with component management
- Component base class with lifecycle hooks
- ComponentManager registers GameObjects to scene update loop
- Type-safe component access via generics

### Non-Functional
- Component lookup O(1)
- Minimal memory overhead per GameObject
- No impact on Phaser's update order

## Architecture

```typescript
// Usage example
class Player extends GameObject {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    this.addComponent(new MovementComponent(200)); // speed
    this.addComponent(new HealthComponent(100));   // hp
  }
}

// In scene
const player = new Player(this, 400, 300);
this.add.existing(player); // Phaser adds to display list
// Components auto-update via scene 'update' event
```

## Related Code Files

### Create
- `src/types/game-object.types.ts` - Type definitions
- `src/game-objects/component.ts` - Component base class
- `src/game-objects/game-object.ts` - GameObject class
- `src/game-objects/component-manager.ts` - Scene-level manager
- `src/game-objects/index.ts` - Public exports

## Implementation Steps

### Step 1: Create Type Definitions

`src/types/game-object.types.ts`:

```typescript
import type { Component } from '@game-objects/component';

/** Constructor type for components */
export type ComponentClass<T extends Component = Component> = new (...args: any[]) => T;

/** GameObject configuration */
export interface GameObjectConfig {
  x?: number;
  y?: number;
  name?: string;
}
```

### Step 2: Create Component Base Class

`src/game-objects/component.ts`:

```typescript
import type { GameObject } from './game-object';

/**
 * Base class for attachable behaviors.
 * Extend this to create custom components.
 */
export abstract class Component {
  /** Reference to owner GameObject (set on attach) */
  owner!: GameObject;

  /** Whether component receives updates */
  enabled = true;

  /**
   * Called when component is attached to GameObject.
   * Override for initialization logic.
   */
  onAttach(): void {}

  /**
   * Called when component is detached from GameObject.
   * Override for cleanup logic.
   */
  onDetach(): void {}

  /**
   * Called every frame when enabled.
   * @param dt Delta time in milliseconds
   */
  update?(dt: number): void;

  /** Convenience: get scene from owner */
  get scene(): Phaser.Scene {
    return this.owner.scene;
  }
}
```

### Step 3: Create GameObject Class

`src/game-objects/game-object.ts`:

```typescript
import Phaser from 'phaser';
import { Component } from './component';
import { ComponentManager } from './component-manager';
import type { ComponentClass, GameObjectConfig } from '@types/game-object.types';

/**
 * Extended Container with component system.
 * Use as base class for game entities.
 */
export class GameObject extends Phaser.GameObjects.Container {
  private components = new Map<ComponentClass, Component>();
  private static idCounter = 0;

  /** Unique identifier */
  readonly id: string;

  constructor(scene: Phaser.Scene, x = 0, y = 0, config?: GameObjectConfig) {
    super(scene, x, y);
    this.id = `go_${++GameObject.idCounter}`;

    if (config?.name) {
      this.name = config.name;
    }

    // Register with ComponentManager for updates
    ComponentManager.register(scene, this);
  }

  /**
   * Attach a component to this GameObject.
   * @returns The attached component for chaining
   */
  addComponent<T extends Component>(component: T): T {
    const ctor = component.constructor as ComponentClass<T>;

    if (this.components.has(ctor)) {
      console.warn(`Component ${ctor.name} already exists on ${this.id}`);
      return this.components.get(ctor) as T;
    }

    component.owner = this;
    this.components.set(ctor, component);
    component.onAttach();

    return component;
  }

  /**
   * Get component by type.
   * @returns Component instance or null if not found
   */
  getComponent<T extends Component>(type: ComponentClass<T>): T | null {
    return (this.components.get(type) as T) ?? null;
  }

  /**
   * Check if component exists.
   */
  hasComponent(type: ComponentClass): boolean {
    return this.components.has(type);
  }

  /**
   * Remove component by type.
   */
  removeComponent(type: ComponentClass): void {
    const component = this.components.get(type);
    if (component) {
      component.onDetach();
      this.components.delete(type);
    }
  }

  /**
   * Called by ComponentManager each frame.
   * Updates all enabled components.
   */
  updateComponents(dt: number): void {
    for (const component of this.components.values()) {
      if (component.enabled && component.update) {
        component.update(dt);
      }
    }
  }

  /**
   * Override destroy to cleanup components.
   */
  destroy(fromScene?: boolean): void {
    // Detach all components
    for (const component of this.components.values()) {
      component.onDetach();
    }
    this.components.clear();

    // Unregister from ComponentManager
    ComponentManager.unregister(this.scene, this);

    super.destroy(fromScene);
  }
}
```

### Step 4: Create ComponentManager

`src/game-objects/component-manager.ts`:

```typescript
import type { GameObject } from './game-object';

/**
 * Manages GameObject updates per scene.
 * Hooks into Phaser's scene update event.
 */
export class ComponentManager {
  private static sceneMap = new WeakMap<Phaser.Scene, Set<GameObject>>();
  private static listenerMap = new WeakMap<Phaser.Scene, boolean>();

  /**
   * Register GameObject for updates in scene.
   */
  static register(scene: Phaser.Scene, gameObject: GameObject): void {
    // Get or create set for this scene
    let objects = this.sceneMap.get(scene);
    if (!objects) {
      objects = new Set();
      this.sceneMap.set(scene, objects);
    }
    objects.add(gameObject);

    // Setup scene update listener (once per scene)
    if (!this.listenerMap.get(scene)) {
      scene.events.on('update', (time: number, delta: number) => {
        this.updateScene(scene, delta);
      });

      // Cleanup on scene shutdown
      scene.events.once('shutdown', () => {
        this.sceneMap.delete(scene);
        this.listenerMap.delete(scene);
      });

      this.listenerMap.set(scene, true);
    }
  }

  /**
   * Unregister GameObject from scene updates.
   */
  static unregister(scene: Phaser.Scene, gameObject: GameObject): void {
    const objects = this.sceneMap.get(scene);
    if (objects) {
      objects.delete(gameObject);
    }
  }

  /**
   * Update all GameObjects in scene.
   */
  private static updateScene(scene: Phaser.Scene, delta: number): void {
    const objects = this.sceneMap.get(scene);
    if (objects) {
      for (const obj of objects) {
        if (obj.active) {
          obj.updateComponents(delta);
        }
      }
    }
  }
}
```

### Step 5: Create Public Exports

`src/game-objects/index.ts`:

```typescript
export { GameObject } from './game-object';
export { Component } from './component';
export { ComponentManager } from './component-manager';
export type { ComponentClass, GameObjectConfig } from '@types/game-object.types';
```

`src/index.ts`:

```typescript
export * from './game-objects';
```

## Todo List

- [ ] Create game-object.types.ts
- [ ] Create component.ts
- [ ] Create game-object.ts
- [ ] Create component-manager.ts
- [ ] Create index.ts exports
- [ ] TypeScript compiles without errors
- [ ] Manual test: create GameObject, add component

## Success Criteria

- `tsc --noEmit` passes
- GameObject extends Phaser.Container (instanceof check works)
- addComponent/getComponent type inference works
- Components receive update calls with delta time
- destroy() cleans up all components

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Circular import | High | Use type-only imports where possible |
| Update order | Medium | Document; components update in insertion order |

## Next Steps

- Proceed to Phase 03: Demo & Validation
