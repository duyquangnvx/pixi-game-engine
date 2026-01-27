# Code Standards & Conventions

## Naming Conventions

### Classes & Interfaces

**Pattern:** `PascalCase` for all public types

```typescript
// Components
export class Transform extends Component { }
export class SpriteRenderer extends Component { }

// Managers
export class InputManager { }
export class AudioManager { }
export class SceneManager { }

// Scenes
export class BaseScene extends Phaser.Scene { }
export class LoadingScene extends BaseScene { }

// Interfaces
export interface GameObjectConfig { }
export interface ColliderConfig { }
```

### Variables & Functions

**Pattern:** `camelCase` for all variables, functions, and properties

```typescript
// Properties
localPosition: { x: number; y: number } = { x: 0, y: 0 };
componentList: Component[] = [];

// Methods
addComponent<T extends Component>(component: T): T { }
getComponent<T extends Component>(type: ComponentClass<T>): T | null { }

// Parameters
function loadAsset(asset: AssetManifestItem): void { }
```

### Type Definitions

**Pattern:** `Type` suffix for interfaces/types, descriptive names

```typescript
// Type definitions live in types/ directory
export type ComponentClass<T extends Component = Component> = new () => T;
export type TransitionType = 'fade' | 'fade-scale' | 'scale' | 'slide';
export interface GameObjectConfig { name?: string }
export interface AnimationConfig { key: string; frameRate: number }
```

### Constants

**Pattern:** `UPPER_SNAKE_CASE` for module-level constants

```typescript
export const DEFAULT_TRANSITION_DURATION = 500;
export const MAX_GAMEPAD_BUTTONS = 17;
export const DEFAULT_AUDIO_RATE = 1;
```

### Files

**Pattern:** `kebab-case` matching primary export

```typescript
// File: sprite-renderer.ts
export class SpriteRenderer extends Component { }

// File: pixel-art-builder.ts
export class PixelArtBuilder { }

// File: event.types.ts
export type GameEvents = { /* ... */ };

// File: index.ts
export * from './transform';
export * from './sprite-renderer';
```

## File Structure Patterns

### Component File Structure

**Template:** All components follow this pattern

```typescript
import Phaser from 'phaser';
import { Component } from '../game-objects/component';
import type { SomeType } from '../types/some.types';

/**
 * One-line component description.
 *
 * Multi-line explanation of purpose and usage.
 *
 * @example
 * const entity = new GameObject(scene, 100, 200);
 * const component = entity.addComponent(new MyComponent());
 */
export class MyComponent extends Component {
  /** Configuration or state properties with JSDoc comments */
  priority = 50; // Update priority (higher = earlier)

  /** Optional initialization */
  onAttach(): void {
    // Called when component is attached to GameObject
  }

  /** Main update loop (optional) */
  update(dt: number): void {
    // Called every frame if enabled
  }

  /** Late update pass (optional) */
  lateUpdate(dt: number): void {
    // Called after all primary updates
  }

  /** Cleanup (optional) */
  onDetach(): void {
    // Called when component is detached
  }
}
```

### Manager File Structure

**Template:** All managers are scene-scoped singletons

```typescript
import Phaser from 'phaser';

/**
 * Manager description.
 * Scoped to individual scenes via WeakMap.
 */
export class MyManager {
  private static readonly instances = new WeakMap<Phaser.Scene, MyManager>();

  /** Private constructor - use getInstance() */
  private constructor(private scene: Phaser.Scene) {
    // Initialize
  }

  /** Get or create manager instance for a scene */
  static getInstance(scene: Phaser.Scene): MyManager {
    if (!this.instances.has(scene)) {
      this.instances.set(scene, new MyManager(scene));
    }
    return this.instances.get(scene)!;
  }

  /** Public API methods */
  public someMethod(): void {
    // Implementation
  }
}
```

### Scene File Structure

**Template:** All scenes extend BaseScene

```typescript
import { BaseScene } from '@pge/core';
import type { AssetManifestItem, SceneData } from '@pge/core';

/**
 * Scene description.
 */
export class MyScene extends BaseScene {
  /** Scene identifier - must be unique */
  constructor() {
    super('MyScene');
  }

  /** Define assets to load before onCreate() */
  override getAssets(): AssetManifestItem[] {
    return [
      { key: 'sprite', type: 'image', url: '/assets/sprite.png' },
      { key: 'audio', type: 'audio', url: '/assets/audio.mp3' },
    ];
  }

  /** Custom init logic (receives data from previous scene) */
  protected override onInit(data?: SceneData): void {
    // Store scene data, initialize state
  }

  /** Called after assets loaded, before main scene setup */
  override create(): void {
    // Main scene setup - add game objects, components
  }

  /** Update each frame */
  override update(time: number, delta: number): void {
    // Frame-by-frame logic
  }

  /** Optional: Handle input or other logic */
  private handleInput(): void { }
}
```

### Index Files (Barrel Exports)

**Pattern:** Re-export all public members

```typescript
// components/index.ts
export { Transform } from './transform';
export { SpriteRenderer } from './sprite-renderer';
export { Animator } from './animator';
```

## Component Patterns

### Component Lifecycle

All components follow this lifecycle:

1. **Create:** `new MyComponent()`
2. **Attach:** `gameObject.addComponent(component)` → `onAttach()` called
3. **Update Phase:** `component.update(dt)` each frame (if enabled)
4. **Late Update Phase:** `component.lateUpdate(dt)` each frame (if enabled)
5. **Detach:** `gameObject.removeComponent(ComponentClass)` → `onDetach()` called
6. **Destroy:** `gameObject.destroy()` → all components detached

### Priority System

Components update in order of priority (highest first):

```typescript
export class MyComponent extends Component {
  priority = 100; // 100 = very high priority (update first)
  // Default = 0
  // Common values:
  // 100 = Transform (must update first for hierarchy)
  // 50 = Physics/collision
  // 0 = Default/general logic
  // -50 = UI/rendering
}
```

Update order within same priority is undefined - don't depend on it.

### Component Enable/Disable

```typescript
const component = gameObject.getComponent(MyComponent);
component.enabled = false;  // Skip update/lateUpdate
component.enabled = true;   // Resume updates
```

Disabled components still receive `onAttach()`/`onDetach()` but not update calls.

### Getting Components

```typescript
const go = new GameObject(scene, 100, 200);

// Type-safe lookup
const transform = go.getComponent(Transform); // T | null
if (transform) {
  transform.localPosition.x += 10;
}

// Check existence
if (go.hasComponent(Transform)) {
  // Component exists
}

// Add new component
const animator = go.addComponent(new Animator({
  key: 'walk',
  frameRate: 8,
  frames: [0, 1, 2, 3],
}));
```

## TypeScript Guidelines

### Strict Mode Requirements

All files must compile with `--strict` enabled:

```typescript
// ✓ CORRECT: Type-safe, no implicit any
function addComponent<T extends Component>(comp: T): T {
  return comp;
}

// ✗ WRONG: Avoid implicit any
function addComponent(comp: any): any {
  return comp;
}
```

### Generic Components

Use bounded generics for type safety:

```typescript
// ✓ CORRECT: Bounded generic
export class Container<T extends Component = Component> {
  items: T[] = [];
}

// ✗ WRONG: Unbounded generic
export class Container<T> {
  items: T[] = [];
}
```

### Union Types Over Overloads

Prefer union types for simpler APIs:

```typescript
// ✓ PREFERRED: Single signature with union
function load(key: string | number): void { }

// ✗ AVOID: Multiple overloads for simple cases
function load(key: string): void;
function load(key: number): void;
function load(key: any): void { }
```

### Readonly Where Appropriate

Mark immutable data as readonly:

```typescript
// ✓ GOOD: Signals immutability
export readonly id: string;
export readonly priority: number = 0;

// Properties that won't change
constructor(private readonly scene: Phaser.Scene) { }
```

### Avoid any Type

Never use `any` unless absolutely unavoidable:

```typescript
// ✓ GOOD: Explicit types
function process(config: Record<string, unknown>): void { }
const data: unknown = getSomeData();

// ✗ BAD: Using any
function process(config: any): void { }
```

### Type Inference

Let TypeScript infer simple types:

```typescript
// ✓ OK: Obvious types can be inferred
const count = 0;  // TypeScript knows: number
const enabled = true;  // TypeScript knows: boolean

// ✓ REQUIRED: Complex types must be explicit
const gameObjects: GameObject[] = [];
const managers: Map<string, Manager> = new Map();
```

### Comments Style

Use JSDoc for public APIs, single-line for implementation:

```typescript
/**
 * Add a component to this game object.
 *
 * @param component - Component instance to attach
 * @returns The attached component for chaining
 * @throws Error if component of same type already exists
 */
export function addComponent<T extends Component>(component: T): T {
  // Validate the component isn't already attached
  if (this.components.has(component.constructor as any)) {
    console.warn('Component already exists');
  }

  // Store in map by constructor for type-safe lookup
  this.components.set(component.constructor as any, component);

  return component;
}
```

## Import Guidelines

### Relative vs Absolute Imports

Use relative imports within packages:

```typescript
// In packages/engine/src/components/sprite-renderer.ts
import { Component } from '../game-objects/component';
import type { AnimationConfig } from '../types/animation.types';
import { eventBus } from '../core/event-bus';
```

### Organize Imports

Group imports by category:

```typescript
// 1. External libraries
import Phaser from 'phaser';
import { EventEmitter } from 'eventemitter3';

// 2. Internal modules
import { Component } from '../game-objects/component';
import { eventBus } from '../core/event-bus';

// 3. Type imports
import type { AnimationConfig } from '../types/animation.types';
import type { Phaser } from 'phaser';
```

## Error Handling

### Use Try-Catch for External APIs

```typescript
public loadAudio(key: string, url: string): void {
  try {
    this.scene.load.audio(key, url);
  } catch (error) {
    console.error(`Failed to load audio ${key}:`, error);
  }
}
```

### Validate Constructor Arguments

```typescript
constructor(config: ComponentConfig) {
  if (!config.key || config.key.trim() === '') {
    throw new Error('Component key is required');
  }
  this.key = config.key;
}
```

## Code Quality

### Avoid Magic Numbers

```typescript
// ✗ BAD
const radius = Math.PI / 4;

// ✓ GOOD
const QUARTER_CIRCLE_RADIANS = Math.PI / 4;
const radius = QUARTER_CIRCLE_RADIANS;
```

### Keep Functions Focused

- One component per file
- One manager per file (usually)
- Average file size: 100-150 LOC
- Max file size: 250 LOC (split larger files)

### DRY Principle

Extract repeated patterns into utilities:

```typescript
// ✓ GOOD: Reusable utility
const snapToGrid = (value: number, gridSize: number): number =>
  Math.round(value / gridSize) * gridSize;

// ✓ GOOD: Reusable component
export class GridSnapper extends Component {
  constructor(private gridSize: number = 32) { super(); }
  snap(value: number): number {
    return snapToGrid(value, this.gridSize);
  }
}
```

## Related Documentation

- [Codebase Summary](./codebase-summary.md) - File structure overview
- [System Architecture](./system-architecture.md) - Design patterns
- [Project Overview](./project-overview-pdr.md) - Vision and requirements
