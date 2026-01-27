# PGE Codebase Summary

## Repository Structure

```
pge-monorepo/
├── packages/
│   ├── engine/              (@pge/core - 4,710 LOC)
│   └── demo-game/           (@pge/demo-game - 1,214 LOC)
├── docs/                    (Documentation)
├── plans/                   (Development plans)
├── pnpm-workspace.yaml      (Monorepo configuration)
├── tsconfig.json            (Root TypeScript config)
└── README.md                (Project overview)
```

## @pge/core Package

**Location:** `packages/engine/`
**Description:** Production-ready Phaser 3 game engine with composition-based architecture
**Entry Point:** `src/index.ts`
**Build:** Vite library mode with TypeScript declarations
**Total LOC:** ~4,710 across 41 TypeScript files

### Directory Structure

```
packages/engine/src/
├── components/              (1,278 LOC, 7 files)
│   ├── transform.ts         (197 LOC) - Position/rotation/scale with hierarchy
│   ├── sprite-renderer.ts   (235 LOC) - Sprite display component
│   ├── animator.ts          (289 LOC) - Frame-based animation
│   ├── collider.ts          (198 LOC) - Physics collision detection
│   ├── rigid-body.ts        (117 LOC) - Physics body properties
│   ├── spine-renderer.ts    (156 LOC) - Spine skeleton animation
│   └── index.ts             (86 LOC)  - Public exports
│
├── game-objects/            (287 LOC, 4 files)
│   ├── game-object.ts       (132 LOC) - Base entity with component system
│   ├── component.ts         (67 LOC)  - Component base class
│   ├── component-manager.ts (79 LOC)  - Update orchestration
│   └── index.ts             (9 LOC)   - Public exports
│
├── core/                    (153 LOC, 3 files)
│   ├── event-bus.ts         (89 LOC)  - EventBus singleton & factory
│   ├── object-pool.ts       (43 LOC)  - Object reuse pool
│   └── index.ts             (21 LOC)  - Public exports
│
├── scenes/                  (637 LOC, 5 files)
│   ├── base-scene.ts        (247 LOC) - Standardized scene lifecycle
│   ├── scene-manager.ts     (145 LOC) - Scene switching with context
│   ├── loading-scene.ts     (123 LOC) - Asset preloading UI
│   ├── transitions.ts       (98 LOC)  - Scene transition effects
│   └── index.ts             (24 LOC)  - Public exports
│
├── utils/                   (572 LOC, 4 files)
│   ├── input-manager.ts     (189 LOC) - Keyboard/gamepad input
│   ├── audio-manager.ts     (157 LOC) - Centralized audio control
│   ├── storage-manager.ts   (155 LOC) - LocalStorage abstraction
│   └── index.ts             (71 LOC)  - Public exports
│
├── pixel-art/               (897 LOC, 6 files)
│   ├── pixel-renderer.ts    (218 LOC) - Pixel-perfect rendering
│   ├── pixel-art-builder.ts (287 LOC) - Sprite creation utilities
│   ├── aseprite-loader.ts   (156 LOC) - Aseprite file parser
│   ├── pixel-sprite.types.ts(178 LOC) - Type definitions
│   ├── ase-parser.d.ts      (25 LOC)  - Parser type declarations
│   └── index.ts             (33 LOC)  - Public exports
│
├── debug/                   (373 LOC, 5 files)
│   ├── debug-overlay.ts     (147 LOC) - On-screen debug UI
│   ├── profiler.ts          (94 LOC)  - Performance profiling
│   ├── logger.ts            (102 LOC) - Structured logging
│   └── index.ts             (30 LOC)  - Public exports
│
├── types/                   (404 LOC, 7 files)
│   ├── game-object.types.ts (45 LOC)  - GameObject interfaces
│   ├── event.types.ts       (28 LOC)  - Event definitions
│   ├── animation.types.ts   (67 LOC)  - Animation configs
│   ├── spine.types.ts       (124 LOC) - Spine runtime types
│   ├── spine-plugin.types.ts(71 LOC)  - Spine plugin interfaces
│   ├── scene.types.ts       (43 LOC)  - Scene lifecycle types
│   ├── input.types.ts       (26 LOC)  - Input binding types
│
└── index.ts                 (61 LOC) - Main package exports
```

### Module Organization

**Core Systems (game-objects, core)**
- GameObject: Extended Phaser Container with component system
- Component: Base class for all attachable behaviors
- ComponentManager: Orchestrates component lifecycle
- EventBus: Decoupled event system

**Built-in Components (components)**
- Transform: Hierarchical position/rotation/scale
- SpriteRenderer: Sprite display and frame switching
- Animator: Frame-based animation state machine
- Collider: Physics collision detection (Arcade)
- RigidBody: Physics body configuration
- SpineRenderer: Skeletal animation support

**Scene System (scenes)**
- BaseScene: Standard lifecycle with asset preloading
- SceneManager: Scene switching with context passing
- LoadingScene: Built-in loading screen template
- Transitions: Scene transition effects

**Utilities (utils)**
- InputManager: Unified keyboard/gamepad input handling
- AudioManager: Sound effect and music management
- StorageManager: LocalStorage key-value abstraction

**Pixel Art (pixel-art)**
- PixelRenderer: Pixel-perfect rendering system
- PixelArtBuilder: Utilities for pixel sprite creation
- AsepriteLoader: Aseprite file format support

**Development Tools (debug)**
- DebugOverlay: On-screen performance/state visualization
- Profiler: Frame time and memory profiling
- Logger: Structured logging with scopes

### Public API Surface

**Exports by Category:**

Core Systems:
- `eventBus`, `createEventBus`
- `GameObject`, `Component`, `ComponentManager`
- `ObjectPool`

Built-in Components:
- `Transform`, `SpriteRenderer`, `Animator`
- `Collider`, `RigidBody`, `SpineRenderer`

Scenes:
- `BaseScene`, `SceneManager`, `LoadingScene`
- `executeTransition`, `createTransition`, `DEFAULT_TRANSITIONS`

Utilities:
- `InputManager`, `AudioManager`, `StorageManager`
- `GamepadButton`, `GamepadAxis` (constants)

Debug:
- `DebugOverlay`, `Profiler`, `Logger`, `ScopedLogger`, `LogLevel`

Pixel Art:
- `PixelRenderer`, `PixelArtBuilder`, `AsepriteLoader`
- `PixelSprite`, `PixelSpriteOptions`, `PixelAnimationFrame`

Types:
- Component interfaces, game object configs, animation configs
- Event type definitions, input bindings, scene data

## @pge/demo-game Package

**Location:** `packages/demo-game/`
**Description:** Showcase game demonstrating PGE engine capabilities
**Entry Point:** `src/main.ts`
**Build:** Vite SPA with TypeScript
**Total LOC:** ~1,214 across 10 TypeScript files

### Directory Structure

```
packages/demo-game/src/
├── main.ts                  (67 LOC) - Application bootstrap
├── game-config.ts           (34 LOC) - Phaser game config
├── constants.ts             (45 LOC) - Game constants
│
├── scenes/                  (4 scene files)
│   ├── loading-scene.ts     (98 LOC) - Asset loading
│   ├── menu-scene.ts        (134 LOC) - Main menu UI
│   ├── pixel-art-scene.ts   (287 LOC) - Pixel creatures showcase
│   └── playground-scene.ts  (256 LOC) - Interactive demo
│
├── prefabs/                 (Reusable game objects)
│   ├── pixel-characters.ts  (178 LOC) - 13 pixel creature variants
│   └── ui-button.ts         (82 LOC)  - Reusable button component
│
├── components/              (Custom components)
│   └── palette-cycler.ts    (56 LOC) - Palette switching demo
│
├── public/                  (Static assets)
│   ├── assets/              (Game sprites, audio, etc.)
│   └── index.html
│
└── vite.config.ts           (Bundler configuration)
```

### Demo Features

- **4 Scenes:** Loading, Menu, PixelArt showcase, Interactive Playground
- **13 Pixel Creatures:** Various character designs from vibe-game style
- **4 Palette Variants:** Demonstrates pixel art color cycling
- **Input Integration:** Keyboard/gamepad controls showcased
- **Audio & Storage:** Manager system integration examples

## Package Dependencies

### @pge/core

| Dependency | Type | Version | Purpose |
|---|---|---|---|
| phaser | peer | ^3.90.0 | Game runtime & rendering |
| eventemitter3 | prod | ^5.0.4 | Event bus implementation |
| ase-parser | prod | ^0.0.18 | Aseprite file parsing |
| buffer | prod | ^6.0.3 | Node.js buffer polyfill |
| @esotericsoftware/spine-phaser | optional peer | Latest | Spine animation support |

### @pge/demo-game

| Dependency | Type | Version | Purpose |
|---|---|---|---|
| @pge/core | workspace | * | Main engine package |
| phaser | prod | ^3.90.0 | Game runtime |
| TypeScript | dev | ^5.9.3 | Type checking |
| Vite | dev | ^7.3.1 | Build tooling |

## Build Configuration

### TypeScript Settings

- **Target:** ES2020
- **Module:** ESNext
- **Strict Mode:** Enabled
- **Declaration:** Generated (.d.ts files)
- **Source Maps:** Enabled for debugging

### Vite Configuration

- **Engine Package:** Library mode with dts plugin
- **Demo Package:** SPA mode with HTML entry
- **Tree-shaking:** Enabled
- **Output:** Minified ESM modules

### Export Map (@pge/core)

```javascript
{
  ".": "./dist/index.js",
  "./components": "./dist/components/index.js",
  "./scenes": "./dist/scenes/index.js",
  "./utils": "./dist/utils/index.js",
  "./debug": "./dist/debug/index.js",
  "./pixel-art": "./dist/pixel-art/index.js"
}
```

## File Naming Conventions

- **Components:** PascalCase classes (e.g., `TransformComponent`, `SpriteRenderer`)
- **Files:** kebab-case names matching exports (e.g., `sprite-renderer.ts`)
- **Types:** Suffixed with `types.ts` or inline with `Type` suffix (e.g., `AnimationConfig`)
- **Managers:** PascalCase ending in Manager (e.g., `InputManager`)
- **Utilities:** Lowercase functions, PascalCase classes

## Code Metrics

| Metric | @pge/core | @pge/demo-game | Total |
|--------|-----------|--------|-------|
| **TypeScript Files** | 41 | 10 | 51 |
| **Total LOC** | 4,710 | 1,214 | 5,924 |
| **Avg File Size** | ~115 LOC | ~121 LOC | ~116 LOC |
| **Max File Size** | 287 LOC | 287 LOC | 287 LOC |
| **Public Exports** | 40+ | N/A | 40+ |

## Related Documentation

- [Code Standards](./code-standards.md) - Implementation patterns
- [System Architecture](./system-architecture.md) - Design decisions
- [Project Overview](./project-overview-pdr.md) - Vision and requirements
