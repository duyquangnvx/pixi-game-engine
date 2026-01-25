# PixiJS v7 Game Engine Architecture Research Report

**Date:** 2026-01-25
**Focus:** Architecture patterns, best practices, and API wrapper design for PixiJS v7

---

## 1. PixiJS v7 Core APIs & Features

### Application
The `PIXI.Application` class simplifies setup by creating the renderer, stage, and ticker automatically.

```javascript
const app = new PIXI.Application({
  width: 640,
  height: 360,
  backgroundColor: 0x1099bb
});
document.body.appendChild(app.view);
```

**Key Properties:**
- `app.view` - Canvas element to add to DOM
- `app.stage` - Root Container (scene graph root)
- `app.ticker` - Update loop manager
- `app.renderer` - WebGL/Canvas renderer instance

### Container & Scene Graph
Containers form hierarchical tree structures where transformations cascade to children.

```javascript
const container = new PIXI.Container();
container.addChild(sprite);
app.stage.addChild(container);
```

### Ticker (Game Loop)
Executes callbacks per frame with delta time for frame-independent animations.

```javascript
app.ticker.add((delta) => {
  // delta = elapsed frames (typically 1 at 60fps)
  sprite.rotation += 0.01 * delta;
});
```

### V7-Specific Features
- **eventMode** property replaces deprecated `interactive` for better event handling
- **Font support** as first-class citizens (ttf, otf, woff, woff2) without plugins
- **Performance improvements** in rendering pipeline and memory management
- **Modern architecture** with cleaner, more maintainable codebase

---

## 2. Scene Management Patterns

PixiJS is a rendering engine, not a full game framework—scene management must be implemented.

### Coordinator Pattern (Recommended)
```javascript
class Scene {
  async onStart(container) { /* Setup */ }
  onUpdate(delta) { /* Per-frame logic */ }
  onFinish() { /* Cleanup */ }
}

class SceneCoordinator {
  constructor(app) {
    this.app = app;
    this.currentScene = null;
  }

  async gotoScene(newScene) {
    if (this.currentScene) {
      this.currentScene.onFinish();
      this.app.stage.removeChildren();
    }

    this.currentScene = newScene;
    await this.currentScene.onStart(this.app.stage);

    this.app.ticker.add((delta) => {
      this.currentScene.onUpdate(delta);
    });
  }
}
```

**Benefits:**
- Clear lifecycle (start → update → finish)
- Centralized scene transitions
- Clean resource management

### Alternative Libraries
- **pixi-scenes** - Multi-scene manager with transitions
- **pixi-scenegraph** - Scene switching for PIXI v8
- **pixi-engine** - Minimal engine structure

---

## 3. Code Organization Best Practices

### Recommended Directory Structure
```
src/
├── engine/           # Reusable engine code
│   ├── Application.ts
│   ├── Scene.ts
│   ├── AssetManager.ts
│   └── InputManager.ts
├── game/            # Game-specific code
│   ├── scenes/
│   │   ├── MenuScene.ts
│   │   └── GameScene.ts
│   ├── entities/
│   │   ├── Player.ts
│   │   └── Enemy.ts
│   └── systems/
│       └── CollisionSystem.ts
├── assets/          # Textures, sounds, fonts
└── main.ts          # Entry point
```

### Architectural Patterns

**1. Singleton for Global Access**
```typescript
class GameApp {
  private static instance: PIXI.Application;

  static getInstance() {
    if (!this.instance) {
      this.instance = new PIXI.Application({...});
    }
    return this.instance;
  }
}
```

**2. State Management**
Use state machines for game progression:
```typescript
enum GameState { MENU, PLAYING, PAUSED, GAME_OVER }

class StateManager {
  private state: GameState;

  setState(newState: GameState) {
    this.exitState(this.state);
    this.state = newState;
    this.enterState(newState);
  }
}
```

**3. Event System**
Decouple components with event emitters:
```typescript
class EventBus extends PIXI.utils.EventEmitter {
  static instance = new EventBus();
}

// Usage
EventBus.instance.emit('player:death', { score: 1000 });
EventBus.instance.on('player:death', (data) => {...});
```

**4. Entity-Component System (ECS)**
For large-scale games, consider ECS architecture for better performance and maintainability.

---

## 4. Performance Considerations & Common Pitfalls

### Memory Management

**Critical: Always Destroy Unused Objects**
```javascript
// BAD - memory leak
sprite.visible = false;

// GOOD - releases GPU resources
sprite.destroy({ children: true, texture: false, baseTexture: false });
```

**Texture Management:**
- Use texture atlases (spritesheets) to reduce draw calls
- Share textures across sprites
- Call `texture.unload()` for manual cleanup
- Limit to 16 textures per batch

**Object Pooling:**
```javascript
class SpritePool {
  pool = [];

  acquire() {
    return this.pool.pop() || new PIXI.Sprite();
  }

  release(sprite) {
    sprite.visible = false;
    this.pool.push(sprite);
  }
}
```

### Rendering Optimization

**Use ParticleContainer for Many Sprites:**
```javascript
const particles = new PIXI.ParticleContainer(10000, {
  scale: true,
  position: true,
  rotation: true
});
```

**Cache Static Content:**
```javascript
// For non-animated containers
container.cacheAsBitmap = true; // Use sparingly - trades memory for speed
```

**Minimize Filters & Masks:**
- Filters are expensive (GPU operations)
- Use `container.filterArea` to optimize filter bounds
- Rectangle masks (fastest) > Graphics masks > Sprite masks
- Avoid 100+ masks simultaneously

### Common Pitfalls

1. **Changing Text Every Frame** - Use BitmapText for dynamic text
2. **Not Setting `interactiveChildren = false`** - Slows event system on non-interactive objects
3. **Excessive Bounds Calculations** - Cache width/height for complex objects
4. **Missing Event Listener Cleanup** - Causes memory leaks
5. **No Window Resize Handling** - Must manually call `renderer.resize()`
6. **Destroying Many Objects at Once** - Stagger destruction with random delays

---

## 5. API Wrapper Design Patterns

### Clean Abstraction Layer

**Goals:**
- Hide PixiJS complexity from game code
- Provide type-safe, developer-friendly API
- Enable easy migration if underlying renderer changes
- Maintain performance (minimal overhead)

### Proposed Structure

```typescript
// High-level wrapper
class GameEngine {
  private app: PIXI.Application;
  private sceneManager: SceneManager;
  private assetLoader: AssetLoader;

  async initialize(config: EngineConfig) {
    this.app = new PIXI.Application(config);
    await this.assetLoader.preload(config.assets);
  }

  start(initialScene: Scene) {
    this.sceneManager.load(initialScene);
    this.app.ticker.add((delta) => this.update(delta));
  }

  private update(delta: number) {
    this.sceneManager.update(delta);
  }
}

// Scene abstraction
abstract class Scene {
  abstract async load(): Promise<void>;
  abstract update(delta: number): void;
  abstract unload(): void;
}

// Entity abstraction
class GameObject {
  sprite: PIXI.Sprite;

  setPosition(x: number, y: number) {
    this.sprite.x = x;
    this.sprite.y = y;
    return this; // Method chaining
  }

  destroy() {
    this.sprite.destroy({ children: true });
  }
}
```

### Key Design Principles

1. **Composition over Inheritance** - Favor components over deep class hierarchies
2. **Fluent Interfaces** - Enable method chaining for cleaner code
3. **Async Asset Loading** - Use Promises for resource management
4. **Resource Lifecycle** - Automatic cleanup via wrapper methods
5. **Type Safety** - Leverage TypeScript for API contracts

---

## Sources

- [PixiJS v7 Getting Started Guide](https://pixijs.com/7.x/guides/basics/getting-started)
- [PixiJS v7 API Documentation](https://pixijs.download/v7.x/docs/index.html)
- [Create a Scene System for PixiJS](https://coderevue.net/posts/create-scene-system-pixijs/)
- [PixiJS Performance Tips](https://pixijs.com/8.x/guides/concepts/performance-tips)
- [PixiJS Garbage Collection](https://pixijs.com/8.x/guides/concepts/garbage-collection)
- [Maximising Performance: A Deep Dive into PixiJS Optimization](https://medium.com/@turkmergin/maximising-performance-a-deep-dive-into-pixijs-optimization-6689688ead93)
- [PixiJS: Implementing Core Gaming Concepts](https://dev.to/rubemfsv/pixijs-implementing-core-gaming-concepts-438j)
- [PixiJS TypeScript Game Development Rules](https://cursor.directory/pixijs-typescript-game-development-rules)
- [v4 Performance Tips Wiki](https://github.com/pixijs/pixijs/wiki/v4-Performance-Tips)
- [Learning PixiJS Tutorial](https://github.com/kittykatattack/learningPixi)
