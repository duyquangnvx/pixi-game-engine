# Research Report: 2D Game Engine Design Patterns & Clean Architecture

**Date**: 2026-01-25
**Focus**: Game loop, scene management, input handling, asset loading, audio, hybrid OOP+Component architecture

---

## 1. Game Loop Patterns

### Fixed Timestep (Recommended for Physics)
The gold standard approach based on Glenn Fiedler's "Fix Your Timestep!" article.

**Core Implementation**:
```typescript
class GameLoop {
  private accumulator = 0;
  private readonly dt = 1/60; // 16.67ms fixed timestep
  private currentTime = performance.now();

  tick() {
    const newTime = performance.now();
    const frameTime = Math.min((newTime - this.currentTime) / 1000, 0.25); // Cap at 250ms
    this.currentTime = newTime;
    this.accumulator += frameTime;

    // Fixed updates for physics
    while (this.accumulator >= this.dt) {
      this.fixedUpdate(this.dt);
      this.accumulator -= this.dt;
    }

    // Variable rendering with interpolation
    const alpha = this.accumulator / this.dt;
    this.render(alpha);
  }
}
```

**Benefits**: Deterministic physics, consistent behavior across framerates, prevents "spiral of death"
**Trade-offs**: Requires interpolation for smooth rendering, more complex than variable timestep

### Hybrid Approach
Combines fixed physics updates with variable rendering for optimal performance.

**Sources**:
- [Fix Your Timestep! | Gaffer On Games](https://gafferongames.com/post/fix_your_timestep/)
- [Game Loop Pattern | Game Programming Patterns](https://gameprogrammingpatterns.com/game-loop.html)
- [GitHub: gameloop - Fixed timestep with variable rendering](https://github.com/atamocius/gameloop)

---

## 2. Scene/State Management Patterns

### Stack-Based State Manager (Recommended)
Pushdown automaton approach maintaining state history for pause/resume functionality.

**Architecture**:
```typescript
class SceneManager {
  private stack: Scene[] = [];

  push(scene: Scene) {
    this.stack[this.stack.length - 1]?.pause();
    this.stack.push(scene);
    scene.enter();
  }

  pop() {
    const scene = this.stack.pop();
    scene?.exit();
    this.stack[this.stack.length - 1]?.resume();
  }

  update(dt: number) {
    // Update only top scene or all if transparent
    this.stack[this.stack.length - 1]?.update(dt);
  }
}
```

### Hierarchical FSM
For complex game states with nested states (e.g., InGame > Combat > PlayerTurn).

**Pattern**: State design pattern with enter/exit/update lifecycle methods per state.

**Sources**:
- [State Pattern | Game Programming Patterns](https://gameprogrammingpatterns.com/state.html)
- [FSM state management with push/pop](https://gist.github.com/1bardesign/8d21b626af888a73fcac79d6a62394c1)
- [Finite State Machines in Game Development](https://gamedevelopertips.com/finite-state-machine-game-developers/)

---

## 3. Input Handling Abstraction

### Command Pattern
Decouples input devices from game actions, enabling rebinding and replay systems.

**Implementation**:
```typescript
interface Command {
  execute(entity: Entity): void;
  undo?(): void;
}

class InputMapper {
  private bindings = new Map<string, Command>();

  bind(key: string, command: Command) {
    this.bindings.set(key, command);
  }

  handleInput(key: string, entity: Entity) {
    this.bindings.get(key)?.execute(entity);
  }
}

// Usage
inputMapper.bind('Space', new JumpCommand());
inputMapper.bind('MouseLeft', new JumpCommand()); // Same action, different input
```

### Context-Based Input
Chain of Responsibility pattern for handling input based on current game context (menu vs gameplay).

**Sources**:
- [Command Pattern | Game Programming Patterns](https://gameprogrammingpatterns.com/command.html)
- [Designing Robust Input Handling Systems](https://www.gamedev.net/blogs/entry/2250186-designing-a-robust-input-handling-system-for-games/)

---

## 4. Asset Loading & Management

### Store-Proxy-Cache-Loader Pattern
Four-layer architecture for efficient resource management.

**Architecture**:
```typescript
class AssetManager {
  private cache = new Map<string, Asset>();
  private refCounts = new Map<string, number>();

  async load<T>(id: string, loader: () => Promise<T>): Promise<T> {
    if (this.cache.has(id)) {
      this.refCounts.set(id, (this.refCounts.get(id) || 0) + 1);
      return this.cache.get(id) as T;
    }

    const asset = await loader();
    this.cache.set(id, asset);
    this.refCounts.set(id, 1);
    return asset;
  }

  release(id: string) {
    const count = (this.refCounts.get(id) || 0) - 1;
    if (count <= 0) {
      this.cache.get(id)?.destroy();
      this.cache.delete(id);
      this.refCounts.delete(id);
    } else {
      this.refCounts.set(id, count);
    }
  }
}
```

**Key Concepts**:
- **Reference Counting**: Automatic memory management
- **Async Loading**: Non-blocking asset loads with loading screens
- **Primary/Secondary Assets**: Level assets (primary) load dependencies (secondary) automatically

**Sources**:
- [Resource Manager for Game Assets | GameDev.net](https://www.gamedev.net/tutorials/programming/general-and-gameplay-programming/a-resource-manager-for-game-assets-r3807/)
- [Asset Management in Game Engines | Meegle](https://www.meegle.com/en_us/topics/game-engine/game-engine-asset-management)

---

## 5. Audio System Design

### Layered Architecture
Separation of concerns through well-defined interfaces.

**Layers**:
1. **High-level API**: Game-facing interface (playSound, setVolume)
2. **Audio Manager**: Pooling, mixing, priority management
3. **Platform Layer**: Web Audio API / FMOD / Wwise integration
4. **Thread Communication**: Ring buffers for audio/game thread sync

**Implementation Pattern**:
```typescript
class AudioSystem {
  private mixer: AudioMixer;
  private sources: Map<string, AudioSource> = new Map();

  play(id: string, options: AudioOptions = {}) {
    const source = this.sources.get(id);
    return this.mixer.play(source, {
      volume: options.volume ?? 1.0,
      loop: options.loop ?? false,
      priority: options.priority ?? Priority.Normal
    });
  }

  setGlobalVolume(category: AudioCategory, volume: number) {
    this.mixer.setCategoryVolume(category, volume);
  }
}
```

**Industry Standard**: Wwise (gold standard) and FMOD for advanced interactive audio.

**Sources**:
- [C++ Game Audio Engine: Multithreaded Architecture](https://www.jackcampbellsounds.com/2017/03/17/multithreadedarch.html)
- [Game Engine Architecture Vol. II: Graphics, Motion, and Sound](https://www.amazon.com/Game-Engine-Architecture-Graphics-Motion/dp/1041162588)

---

## 6. Hybrid OOP + Component Architecture

### Modern Approach (2024-2026)
Blend OOP encapsulation with data-oriented ECS principles for pragmatic game development.

**Architecture**:
```typescript
// OOP Base for behavior encapsulation
abstract class GameObject {
  protected components: Component[] = [];

  addComponent<T extends Component>(comp: T): T {
    this.components.push(comp);
    return comp;
  }

  getComponent<T extends Component>(type: new (...args: any[]) => T): T | null {
    return this.components.find(c => c instanceof type) as T || null;
  }

  update(dt: number) {
    this.components.forEach(c => c.update?.(dt));
  }
}

// Component interface for composition
interface Component {
  owner: GameObject;
  update?(dt: number): void;
}
```

**Benefits of Hybrid**:
- OOP for high-level systems and tools (UI, editor features)
- Components for gameplay entities (flexible composition)
- 5-10x performance gains for entity-heavy systems when using pure ECS

**Real-World Examples**:
- Unity DOTS: ECS alongside traditional OOP GameObject system
- Unreal Mass Entity: ECS for large-scale simulations (100k+ entities)
- Bevy (Rust): Pure ECS from ground up

**Migration Strategy**: Start with OOP, gradually introduce components for hot paths and entity systems.

**Sources**:
- [ECS vs OOP | flamendless](https://flamendless.github.io/ecs-vs-oop/)
- [Understanding Modern Game Engine Architecture with ECS](https://columbaengine.org/blog/ecs-architecture-with-ecs/)
- [OOP Abstraction Layer in ECS Applications](https://www.sebaslab.com/oop-abstraction-layer-in-a-ecs-centric-application/)

---

## 7. PixiJS-Specific Patterns (2025-2026)

### Extension-Based Architecture
PixiJS v8 is built entirely on modular extensions, allowing lightweight customization.

**Best Practices**:
- **Display Object Hierarchy**: Leverage nested containers for scene graph organization
- **Object Pooling**: Reuse sprites/containers to minimize GC pressure
- **Custom Render Textures**: Cache complex scenes for performance
- **Asset Management**: Use PixiJS Assets API with priority loading
- **Memory Management**: Proper `destroy()` calls to prevent texture leaks

**TypeScript Integration**:
```typescript
class Game {
  private app: PIXI.Application;
  private scenes: Map<string, Scene> = new Map();

  async init() {
    this.app = new PIXI.Application();
    await this.app.init({
      width: 800,
      height: 600,
      preference: 'webgpu' // WebGPU support in PixiJS v8
    });
  }
}
```

**Sources**:
- [PixiJS Architecture | Official Docs](https://pixijs.com/8.x/guides/concepts/architecture)
- [PixiJS Game Development 2025 | PlayGama](https://playgama.com/blog/general/mastering-pixijs-game-development-a-comprehensive-guide/)
- [pixi-engine: Minimal engine structure](https://github.com/gamestdio/pixi-engine)

---

## Key Takeaways

1. **Game Loop**: Use fixed timestep for physics, variable for rendering (Fiedler's approach)
2. **Scene Management**: Stack-based for pause/resume, FSM for state transitions
3. **Input**: Command pattern for flexibility and testability
4. **Assets**: Reference-counted cache with async loading
5. **Audio**: Layered architecture with mixer and priority system
6. **Architecture**: Start with OOP+Components, migrate to ECS for performance-critical systems
7. **PixiJS**: Leverage v8 extensions, object pooling, and proper memory management

---

## Complete Sources

- [Fix Your Timestep! | Gaffer On Games](https://gafferongames.com/post/fix_your_timestep/)
- [Game Programming Patterns](https://gameprogrammingpatterns.com/)
- [PixiJS v8 Architecture](https://pixijs.com/8.x/guides/concepts/architecture)
- [TypeScript Game Development Guide 2025](https://generalistprogrammer.com/tutorials/typescript-game-development-complete-guide-2025)
- [ECS FAQ](https://github.com/SanderMertens/ecs-faq)
- [Game Engine Architecture](https://www.gameenginebook.com/)
