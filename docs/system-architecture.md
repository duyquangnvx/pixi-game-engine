# System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      PGE Game Engine                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────┐         ┌─────────────────────────┐    │
│  │  Game Loop      │         │  Scene Management       │    │
│  │  (Phaser Core)  │────────▶│  • BaseScene lifecycle  │    │
│  │                 │         │  • SceneManager         │    │
│  └────────┬────────┘         │  • Transitions          │    │
│           │                  └─────────────────────────┘    │
│           │                                                   │
│           ▼                                                   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │           Component Update System                   │    │
│  │  ┌──────────────────────────────────────────────┐   │    │
│  │  │ GameObject + Component Manager              │   │    │
│  │  │ • Priority-based update ordering            │   │    │
│  │  │ • Lifecycle: onAttach → update → onDetach   │   │    │
│  │  └──────────────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────┘    │
│           ▲                    ▲             ▲                │
│           │                    │             │                │
│  ┌────────┴──────┐  ┌─────────┴────┐  ┌────┴──────────┐    │
│  │ Built-in      │  │ Utilities    │  │ Debug Tools  │    │
│  │ Components    │  │              │  │              │    │
│  │ • Transform   │  │ • Input Mgr  │  │ • Profiler   │    │
│  │ • Sprites     │  │ • Audio Mgr  │  │ • Overlay    │    │
│  │ • Animator    │  │ • Storage Mgr│  │ • Logger     │    │
│  │ • Physics     │  └──────────────┘  └──────────────┘    │
│  │ • Spine       │                                          │
│  │ • Collider    │                                          │
│  └───────────────┘                                          │
│           │                                                  │
│           ▼                                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │         Event Bus (EventEmitter3)                  │    │
│  │  • Decoupled component communication              │    │
│  │  • Scene-wide and global events                   │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌──────────────────────┐         ┌──────────────────┐      │
│  │ Pixel Art System     │         │ Phaser Integration   │  │
│  │ • PixelRenderer      │         │ • Physics          │  │
│  │ • Aseprite Loader    │         │ • Display objects  │  │
│  │ • Palette support    │         │ • Input events     │  │
│  └──────────────────────┘         └──────────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Core System: Entity-Component System (ECS-Lite)

### Design Pattern: Composition Over Inheritance

Instead of creating deep class hierarchies, entities (GameObjects) gain functionality by attaching components:

```
┌─────────────────────────────────────┐
│         GameObject                  │
│  (Phaser.GameObjects.Container)     │
├─────────────────────────────────────┤
│ Attached Components:                │
│                                     │
│ ┌─────────────────┐                │
│ │ Transform       │ (priority: 100)│
│ │ • position      │                │
│ │ • rotation      │                │
│ │ • scale         │                │
│ └─────────────────┘                │
│                                     │
│ ┌─────────────────┐                │
│ │ SpriteRenderer  │ (priority: 0)  │
│ │ • sprite        │                │
│ │ • animations    │                │
│ └─────────────────┘                │
│                                     │
│ ┌─────────────────┐                │
│ │ Collider        │ (priority: 50) │
│ │ • physics body  │                │
│ │• collision info │                │
│ └─────────────────┘                │
└─────────────────────────────────────┘
```

### Component Lifecycle

```
┌──────────────────┐
│  Component() ctor│
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────┐
│ gameObject.addComponent(comp)    │
│ → Sets owner                     │
│ → Calls onAttach()               │
└────────┬─────────────────────────┘
         │
         ├─── enabled = true ───┐
         │                       │
         ▼                       ▼
┌──────────────────────┐  ┌──────────────────┐
│ Each Frame           │  │ enabled = false  │
│ • update(dt)         │  │ Skip updates     │
│ • lateUpdate(dt)     │  │                  │
└────────┬─────────────┘  └──────────────────┘
         │                       │
         └───────────┬───────────┘
                     │
                     ▼
         ┌──────────────────────────┐
         │ removeComponent() or     │
         │ gameObject.destroy()     │
         │ → Calls onDetach()       │
         │ → Cleanup                │
         └──────────────────────────┘
```

### Component Type Lookup

Components are stored in a `Map<ComponentClass, Component>` for type-safe retrieval:

```typescript
// Get Transform component (type-safe)
const transform = gameObject.getComponent(Transform);
// Returns Transform | null

// Check if component exists
if (gameObject.hasComponent(Transform)) {
  const transform = gameObject.getComponent(Transform)!;
}

// Add component (returns the component)
const animator = gameObject.addComponent(new Animator(config));
```

### Priority-Based Update Ordering

Components update in priority order (highest first), then by insertion:

```
Priority: 100 │ Transform        (must update first for hierarchy)
Priority: 50  │ Collider, RigidBody (physics)
Priority: 0   │ Animator, SpriteRenderer (default)
Priority: -50 │ Custom logic

All updates happen in one ComponentManager pass per frame.
```

## Scene System

### Scene Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                   Phaser Scene Lifecycle                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Scene.init(data)                                           │
│  ▼                                                            │
│  BaseScene.onInit(data)  ← Custom hook                      │
│  ▼                                                            │
│  Scene.preload()         ← Asset loading                    │
│  ▼                                                            │
│  Scene.create()          ← Setup game objects               │
│  ▼                                                            │
│  Scene.update(time, delta) ← Frame loop                     │
│  │                                                           │
│  └─▶ ComponentManager.updateAll()                          │
│      ├─▶ gameObject.updateComponents(dt) [priority order]  │
│      └─▶ gameObject.lateUpdateComponents(dt) [priority]    │
│  ▼                                                            │
│  Scene.shutdown() / Scene.sleep()  ← Scene stops            │
│  ▼                                                            │
│  Scene.wake() / Scene.resume()  ← Scene restarts            │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### BaseScene Structure

```typescript
// Extend BaseScene for any game scene
class GameScene extends BaseScene {
  // 1. Define assets to preload
  override getAssets(): AssetManifestItem[] {
    return [
      { key: 'sprite', type: 'image', url: '/sprites/player.png' }
    ];
  }

  // 2. Receive data from previous scene
  protected override onInit(data?: SceneData): void {
    console.log('Scene data:', data);
  }

  // 3. Create game objects after assets loaded
  override create(): void {
    const player = new GameObject(this, 100, 100);
    player.addComponent(new Transform());
    player.addComponent(new SpriteRenderer({ key: 'sprite' }));
  }

  // 4. Run each frame
  override update(time: number, delta: number): void {
    // ComponentManager auto-updates all components
  }
}
```

### Scene Transitions

Scenes change via `SceneManager.switchScene()`:

```
Current Scene          Transition Effect        New Scene
    │                        │                      │
    ├─ preShutdown ◀────── fade/scale ────────┐    │
    │                        │                 │    │
    ├─ shutdown ◀──────── [effect running] ───┤    │
    │                        │                 │    │
    └─ sleep/stop           │                  │    │
                             │                  │    │
                        preload + create ◀─────┘    │
                             │                      │
                             └──────▶ resume + preload
                                       │
                                       ▼
                                  update loop
```

## Event System

### EventBus Pattern

Events enable decoupled communication between systems:

```typescript
// Any component can emit events
eventBus.emit('enemy:died', { x: 100, y: 200, drops: ['coin'] });

// Other components listen
eventBus.on('enemy:died', (data) => {
  this.collectReward(data.drops);
});

// Listen once then auto-remove
eventBus.once('scene:transition-complete', () => {
  console.log('Ready for gameplay');
});
```

### Built-in Events

| Event | When | Data |
|-------|------|------|
| `gameobject:created` | GameObject instantiated | GameObject |
| `gameobject:destroyed` | GameObject destroyed | GameObject |
| `component:attached` | Component attached | { component, gameObject } |
| `component:detached` | Component detached | { component, gameObject } |
| `scene:loading` | Scene preload starts | { scene, assets } |
| `scene:loaded` | Scene preload complete | { scene } |
| `scene:transition-start` | Scene transition begins | { from, to } |
| `scene:transition-complete` | Scene transition finished | { from, to } |
| `input:action-triggered` | Input action fires | { action, state } |
| `audio:play` | Audio starts | { key, volume } |
| `audio:stop` | Audio stops | { key } |

### Custom Events

Define scene-specific events in `EventBus`:

```typescript
// In a component
eventBus.emit('player:damaged', { amount: 10, by: 'enemy' });

// In another component
eventBus.on('player:damaged', (data) => {
  this.takeDamage(data.amount);
  this.showHitEffect();
});
```

## Input System Architecture

```
┌──────────────────────────────────────────────┐
│        InputManager (Scene-Scoped)           │
│                                              │
│ ┌────────────┐      ┌──────────────────┐   │
│ │ Keyboard   │      │ Gamepad          │   │
│ │ Events     │──────│ Polling (60Hz)   │   │
│ └────────────┘      └──────────────────┘   │
│                                              │
│ ┌──────────────────────────────────────┐   │
│ │ Action Bindings                      │   │
│ │ • 'move-left' → [A, ArrowLeft]       │   │
│ │ • 'jump' → [Space, Gamepad-Button-0] │  │
│ └──────────────────────────────────────┘   │
│                                              │
│ ┌──────────────────────────────────────┐   │
│ │ ActionState Tracking                 │   │
│ │ • held: boolean                      │   │
│ │ • just-pressed: boolean              │   │
│ │ • just-released: boolean             │   │
│ └──────────────────────────────────────┘   │
│                                              │
│ ┌──────────────────────────────────────┐   │
│ │ Components Query State                │   │
│ │ const moved = input.isActionHeld(    │   │
│ │   'move-left'                        │   │
│ │ );                                   │   │
│ └──────────────────────────────────────┘   │
└──────────────────────────────────────────────┘
```

## Pixel Art System

### Aseprite → Runtime Flow

```
Aseprite File (ase)
       │
       ▼
┌──────────────────────┐
│ AsepriteLoader       │
│ • Parse .ase format  │
│ • Extract frames     │
│ • Extract layers     │
│ • Extract metadata   │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ PixelArtBuilder      │
│ • Create sprite sheet│
│ • Register frames    │
│ • Setup animations   │
│ • Store palette data │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ PixelRenderer        │
│ • Render frames      │
│ • Apply palettes     │
│ • Handle scale/filters
└──────────────────────┘
       │
       ▼
┌──────────────────────┐
│ SpriteRenderer       │
│ Component attaches   │
│ Displays on scene    │
└──────────────────────┘
```

### Pixel Sprite with Palettes

```typescript
const builder = new PixelArtBuilder('creatures.ase');
const texture = builder.build();

const sprite = new GameObject(scene, 0, 0);
const renderer = sprite.addComponent(
  new SpriteRenderer({ texture })
);

// Switch palette at runtime
if (renderer instanceof SpriteRenderer) {
  const paletteName = 'ice-variant';
  // Apply palette color mapping
  applyPalette(renderer, paletteName);
}
```

## Physics Integration

### Arcade Physics Integration

```
┌────────────────────────────────┐
│   RigidBody Component          │
│   (Configuration)              │
│                                │
│ • mass                         │
│ • friction                     │
│ • restitution                  │
│ • linear/angular velocity      │
└────────────────┬───────────────┘
                 │
                 ▼
┌────────────────────────────────┐
│   Collider Component           │
│   (Detection & Response)       │
│                                │
│ • shape (circle/rect)          │
│ • collision groups             │
│ • overlap detection            │
│ • collision callbacks          │
└────────────────┬───────────────┘
                 │
                 ▼
         ┌──────────────┐
         │ Phaser Physics
         │ (Arcade)
         └──────────────┘
                 │
                 ▼
         ┌──────────────┐
         │ Collision    │
         │ Events       │
         │ (EventBus)   │
         └──────────────┘
```

### Collision Events

```typescript
const collider = gameObject.getComponent(Collider);

collider.on('collision-start', (other: GameObject) => {
  console.log('Hit:', other.name);
});

collider.on('collision-end', (other: GameObject) => {
  console.log('Left:', other.name);
});
```

## Manager Scope & Lifecycle

Managers are scene-scoped singletons via WeakMap:

```
┌──────────────────────────────────────┐
│ Scene A                              │
│                                      │
│ InputManager (A) ──── Unique to A   │
│ AudioManager (A) ──── Unique to A   │
│ StorageManager (A) ── Unique to A   │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ Scene B                              │
│                                      │
│ InputManager (B) ──── Unique to B   │
│ AudioManager (B) ──── Unique to B   │
│ StorageManager (B) ── Unique to B   │
└──────────────────────────────────────┘

// Get manager for scene
const input = InputManager.getInstance(scene);
// Returns same instance if called again with same scene
// Different instance if called with different scene
```

When a scene shuts down, its managers are garbage collected (WeakMap automatically cleans up).

## Data Flow Example: Player Jump

```
User presses SPACE key
         │
         ▼
┌─────────────────────────────┐
│ InputManager detects press  │
│ 'jump' action triggered     │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│ eventBus.emit('input:      │
│ action-triggered',          │
│ { action: 'jump' })         │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│ PlayerController listens    │
│ Applies upward velocity     │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│ RigidBody.update(dt)        │
│ Applies velocity to physics │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│ Phaser Physics Engine       │
│ Calculates new position     │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│ Transform.update(dt)        │
│ Syncs to display            │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│ SpriteRenderer.update(dt)   │
│ Shows jump animation        │
└─────────────────────────────┘
```

## Related Documentation

- [Code Standards](./code-standards.md) - Implementation patterns
- [Codebase Summary](./codebase-summary.md) - File organization
- [Project Overview](./project-overview-pdr.md) - Vision and requirements
