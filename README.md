# PGE - Pixi Game Engine

A production-ready, composition-based 2D game engine built on [Phaser 3](https://phaser.io/). Write type-safe games with minimal boilerplate using component-driven architecture.

```
┌─────────────────────────────────────────────────────────┐
│                 PGE Game Engine                         │
│         Component-Based | Type-Safe | Extensible       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Core Features                                          │
│  ✓ Entity-Component System (ECS-lite)                   │
│  ✓ Scene management with transitions                    │
│  ✓ Transform hierarchy support                          │
│  ✓ Sprite rendering & animation                        │
│  ✓ Arcade physics integration                          │
│  ✓ Pixel art support (Aseprite loader)                 │
│  ✓ Input management (keyboard/gamepad)                 │
│  ✓ Audio system & storage abstraction                  │
│  ✓ Debug tools (profiler, logger, overlay)             │
│  ✓ Event-driven architecture                           │
│  ✓ 100% TypeScript + strict mode                       │
│                                                          │
│  Perfect for: Indie games, Web game studios,           │
│              Phaser enthusiasts, TypeScript lovers      │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Quick Start

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/duyquangnvx/pixi-game-engine.git
cd pixi-game-engine

# Install dependencies (pnpm required)
pnpm install

# Or install pnpm if needed
npm install -g pnpm
```

### 2. Run Demo Game

```bash
# Start dev server with demo game
pnpm dev

# Build for production
pnpm build:all
```

### 3. Create Your First Game

```typescript
import Phaser from 'phaser';
import { BaseScene, GameObject, Transform, SpriteRenderer } from '@pge/core';

class MyScene extends BaseScene {
  constructor() {
    super('MyScene');
  }

  override getAssets() {
    return [{ key: 'player', type: 'image', url: '/player.png' }];
  }

  override create() {
    // Create game object
    const player = new GameObject(this, 100, 100, { name: 'Player' });

    // Add components
    player.addComponent(new Transform());
    player.addComponent(new SpriteRenderer({ key: 'player' }));

    // Add to scene
    this.add.existing(player);
  }

  override update() {
    // Components handle updates automatically
  }
}

// Boot game
const game = new Phaser.Game({
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: MyScene,
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 300 } },
  },
});
```

## Documentation

| Document | Purpose |
|----------|---------|
| [Project Overview & PDR](./docs/project-overview-pdr.md) | Vision, goals, features, technical requirements |
| [Codebase Summary](./docs/codebase-summary.md) | Directory structure, package organization, file overview |
| [Code Standards](./docs/code-standards.md) | Naming conventions, patterns, TypeScript guidelines |
| [System Architecture](./docs/system-architecture.md) | Design decisions, data flow, component lifecycle |
| [Project Roadmap](./docs/project-roadmap.md) | Development timeline, phases, milestones |

## Project Structure

```
pge-monorepo/
├── packages/
│   ├── engine/              (@pge/core - Main engine)
│   │   ├── src/
│   │   │   ├── components/  (Built-in components)
│   │   │   ├── scenes/      (Scene system)
│   │   │   ├── utils/       (Managers)
│   │   │   ├── pixel-art/   (Aseprite support)
│   │   │   ├── debug/       (Tools)
│   │   │   └── types/       (TypeScript definitions)
│   │   └── dist/            (Compiled output)
│   │
│   └── demo-game/           (@pge/demo-game - Showcase)
│       ├── src/
│       │   ├── scenes/      (Game scenes)
│       │   ├── prefabs/     (Reusable objects)
│       │   └── public/      (Assets)
│       └── dist/            (Built game)
│
├── docs/                    (Documentation)
└── plans/                   (Development plans)
```

## Packages

### @pge/core (Engine Package)

Production-ready engine with all core systems. Use in your projects:

```bash
pnpm add @pge/core
```

**Key Exports:**
- Core systems: GameObject, Component, ComponentManager, EventBus
- Components: Transform, SpriteRenderer, Animator, Collider, RigidBody
- Scenes: BaseScene, SceneManager, LoadingScene, Transitions
- Utils: InputManager, AudioManager, StorageManager
- Debug: Logger, Profiler, DebugOverlay
- Pixel Art: PixelRenderer, PixelArtBuilder, AsepriteLoader

**Stats:**
- ~4,700 LOC
- 40+ public exports
- 100% TypeScript strict mode
- < 100KB minified

### @pge/demo-game (Demo Package)

Showcase game demonstrating all engine features. Not for production use.

**Features:**
- 4 complete scenes (Loading, Menu, PixelArt, Playground)
- 13 pixel art characters with palette variants
- Input/audio/physics integration
- Scene transitions and effects

## Core Concepts

### Component-Based Architecture

Instead of inheritance, compose functionality with components:

```typescript
const player = new GameObject(scene, 100, 100);

// Add components as needed
player.addComponent(new Transform());
player.addComponent(new SpriteRenderer({ key: 'sprite' }));
player.addComponent(new Collider({ shape: 'rect' }));
player.addComponent(new PlayerController()); // Custom component

// Components update automatically each frame in priority order
```

### Scene Management

Scenes load assets, manage lifecycle, and handle transitions:

```typescript
class GameScene extends BaseScene {
  // Define assets
  override getAssets(): AssetManifestItem[] {
    return [
      { key: 'tilemap', type: 'json', url: '/maps/level1.json' },
      { key: 'sprite', type: 'image', url: '/sprites/player.png' },
    ];
  }

  // Receive data from previous scene
  protected override onInit(data?: SceneData): void {
    this.level = data?.level ?? 1;
  }

  // Create game after assets loaded
  override create(): void {
    this.createPlayer();
    this.createEnemies();
  }

  override update(time: number, delta: number): void {
    // Component updates handled automatically
  }
}

// Switch scenes with data
sceneManager.switchScene('GameScene', { level: 2 });
```

### Event-Driven Communication

Components communicate via EventBus without tight coupling:

```typescript
// Emit event
eventBus.emit('enemy:died', { drops: ['gold', 'item'] });

// Listen to event
eventBus.on('enemy:died', (data) => {
  this.collectDrops(data.drops);
});
```

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Phaser | 3.90+ | Game framework & rendering |
| TypeScript | 5.9+ | Type safety |
| pnpm | Latest | Monorepo package manager |
| Vite | 7.3+ | Build & dev server |
| eventemitter3 | 5.0+ | Event system |
| Aseprite Parser | 0.0.18+ | Pixel art support |

## Development

### Install & Setup

```bash
pnpm install
```

### Commands

```bash
# Start demo game dev server
pnpm dev

# Build engine package
pnpm build

# Build all packages
pnpm build:all

# Type check
pnpm typecheck
```

### Code Standards

Follow the [Code Standards](./docs/code-standards.md) document:

- **Naming:** PascalCase for classes, camelCase for functions
- **Files:** kebab-case matching exports
- **Components:** Extend `Component`, implement lifecycle hooks
- **Types:** Full TypeScript with strict mode
- **Size:** Keep files under 200-250 LOC

## Contributing

Contributions welcome! Please:

1. Read the [Code Standards](./docs/code-standards.md)
2. Create an issue first to discuss changes
3. Follow conventional commits
4. Include tests with changes
5. Submit PRs to the `engine` branch

## Status

**Phase:** 2 (Demo & Documentation) - In Progress

| Phase | Status | Timeline |
|-------|--------|----------|
| Core Engine | ✓ COMPLETE | Jan 2025 |
| Demo & Docs | 🔄 IN PROGRESS | Jan-Feb 2025 |
| v1.0 Release | ⏳ PLANNED | Q2 2025 |
| Advanced Features | ⏳ PLANNED | Q3+ 2025 |

**Progress:** See [Project Roadmap](./docs/project-roadmap.md) for detailed timeline.

## License

MIT - See LICENSE file for details

## Repository

- **GitHub:** [duyquangnvx/pixi-game-engine](https://github.com/duyquangnvx/pixi-game-engine)
- **Issues:** [Report bugs](https://github.com/duyquangnvx/pixi-game-engine/issues)
- **Discussions:** [Ask questions](https://github.com/duyquangnvx/pixi-game-engine/discussions)

## Related Links

- [Phaser Documentation](https://photonstorm.github.io/phaser3-docs/)
- [Aseprite Editor](https://www.aseprite.org/)
- [Arcade Physics Guide](https://photonstorm.github.io/phaser3-docs/Phaser.Physics.Arcade.html)

---

**Built with ❤️ using Phaser 3**
