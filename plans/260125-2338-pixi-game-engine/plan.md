# PixiJS v7 2D Game Engine - Implementation Plan

**Created**: 2026-01-25
**Updated**: 2026-01-25
**Status**: Planning
**Branch**: engine

## Overview

Clean, TypeScript-based 2D game engine wrapping PixiJS v7 with simple API for better DX.
Uses existing ecosystem libraries where possible, custom implementations only where needed.

## Tech Stack

- **Renderer**: PixiJS v7.x
- **Language**: TypeScript (strict mode)
- **Build**: Vite
- **Animation**: GSAP + PixiPlugin
- **Spine**: @esotericsoftware/spine-pixi-v7
- **Audio**: @pixi/sound
- **Particles**: @pixi/particle-emitter
- **Architecture**: Hybrid OOP + Component

## Dependencies

```json
{
  "pixi.js": "^7.4.0",
  "gsap": "^3.12.0",
  "@esotericsoftware/spine-pixi-v7": "^4.2.0",
  "@pixi/sound": "^5.2.0",
  "@pixi/particle-emitter": "^5.0.0"
}
```

## Library Usage (70% from ecosystem)

| Module | Library | Status |
|--------|---------|--------|
| Assets | PixiJS Assets API (built-in) | Wrap |
| Events | eventemitter3 (built-in) | Wrap |
| Spine | @esotericsoftware/spine-pixi-v7 | Integrate |
| Tweening | GSAP + PixiPlugin | Integrate |
| Audio | @pixi/sound | Wrap |
| Particles | @pixi/particle-emitter | Integrate |
| Input (pointer) | PixiJS FederatedEvents | Built-in |

## Custom Implementation (30%)

| Module | Reason |
|--------|--------|
| Scene System | No mature v7 solution |
| Game Loop | Custom fixed timestep needed |
| Input Manager | Unified keyboard/gamepad wrapper |
| Game Objects | Hybrid OOP + Component |

## Phases

| # | Phase | Status | Files |
|---|-------|--------|-------|
| 1 | [Project Setup](./phase-01-project-setup.md) | Pending | 6 |
| 2 | [Core Engine](./phase-02-core-engine.md) | Pending | 4 |
| 3 | [Scene System](./phase-03-scene-system.md) | Pending | 3 |
| 4 | [Input System](./phase-04-input-system.md) | Pending | 5 |
| 5 | [Asset System](./phase-05-asset-system.md) | Pending | 2 |
| 6 | [Audio System](./phase-06-audio-system.md) | Pending | 2 |
| 7 | [Animation System](./phase-07-animation-system.md) | Pending | 2 |
| 8 | [Game Objects](./phase-08-game-objects.md) | Pending | 3 |
| 9 | [Utilities](./phase-09-utilities.md) | Pending | 3 |
| 10 | [Demo Example](./phase-10-demo-example.md) | Pending | 9 |

## Reports

- [PixiJS Architecture](../reports/researcher-260125-2338-pixijs-architecture.md)
- [GSAP Integration](../reports/researcher-260125-2338-gsap-integration.md)
- [Game Engine Patterns](../reports/researcher-260125-2338-game-engine-patterns.md)
- [TypeScript/Vite Setup](../reports/researcher-260125-2338-typescript-vite-setup.md)
- [PixiJS Ecosystem Libraries](../reports/researcher-260125-2338-pixi-ecosystem-libs.md)

## Validation Summary

**Validated:** 2026-01-26
**Questions asked:** 7

### Confirmed Decisions

| Decision | Choice |
|----------|--------|
| GSAP License | Personal/free use - acceptable |
| Architecture | Singleton pattern for Game class |
| Scene Rendering | Paused scenes remain visible (frozen) |
| Gamepad Support | Include in MVP |
| Spine Integration | Make optional - include but don't require |
| Demo Type | Shooter game - tests all systems |
| Object Pooling | Auto-pool enemies/bullets in demo |

### Action Items

- [x] Mark Spine as optional dependency in Phase 07
- [x] Update Phase 10 demo to use ObjectPool for enemies/bullets
- [x] Add note in Phase 03: paused scenes render but don't update
