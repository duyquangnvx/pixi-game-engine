# Production-Ready PhaserJS Game Engine

## Overview
Lightweight, composition-based wrapper for PhaserJS targeting:
- 2D Platformer games
- Top-down/RPG games
- Puzzle/Casual games

Built on Phaser 3.90 with Arcade Physics. Web-only, no multiplayer.

## Phases

| # | Phase | Priority | Status | Est |
|---|-------|----------|--------|-----|
| 1 | [Core Architecture](phase-01-core-architecture.md) | P0 | Pending | 2d |
| 2 | [Built-in Components](phase-02-built-in-components.md) | P0 | Pending | 3d |
| 3 | [Scene Management](phase-03-scene-management.md) | P1 | Pending | 2d |
| 4 | [Utilities](phase-04-utilities.md) | P1 | Pending | 2d |
| 5 | [Dev Tools](phase-05-dev-tools.md) | P2 | Pending | 1d |
| 6 | [Packaging](phase-06-packaging.md) | P1 | Pending | 1d |

**Total Est**: ~11 days

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Game Application                        │
├─────────────────────────────────────────────────────────────┤
│  Scene Layer: BaseScene, SceneManager, Transitions          │
├─────────────────────────────────────────────────────────────┤
│  Entity Layer: GameObject, Components, ObjectPool           │
├─────────────────────────────────────────────────────────────┤
│  Core Layer: EventBus, ComponentManager                     │
├─────────────────────────────────────────────────────────────┤
│  Utilities: InputManager, AudioManager, StorageManager      │
├─────────────────────────────────────────────────────────────┤
│  Phaser 3.90 + Arcade Physics                              │
└─────────────────────────────────────────────────────────────┘
```

## File Structure

```
src/
├── core/                    # EventBus, ObjectPool
├── game-objects/            # GameObject, Component (enhanced)
├── components/              # Transform, SpriteRenderer, Animator, Collider
├── scenes/                  # BaseScene, SceneManager, Transitions
├── utils/                   # Input, Audio, Storage managers
├── debug/                   # Overlay, Profiler (tree-shaken in prod)
├── types/                   # TypeScript definitions
└── index.ts                 # Public API
```

## Design Principles
- **YAGNI**: Only essential features for target game types
- **KISS**: Simple APIs, minimal abstraction
- **DRY**: Reusable components
- **Phaser 4 Ready**: ECS-compatible design

## Dependencies
- phaser: ^3.90.0 (peer)
- typescript: ^5.0.0
- vite: ^7.0.0

## Research References
- [Architecture Research](../reports/researcher-260126-1058-game-engine-architecture.md)
- [Tooling Research](../reports/researcher-260126-1058-game-engine-tooling.md)
