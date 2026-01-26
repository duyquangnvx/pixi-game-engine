---
title: "PhaserJS Component System Wrapper"
description: "Lightweight component system on top of PhaserJS for Unity-like GameObject pattern"
status: completed
priority: P1
effort: 4h
branch: engine
tags: [phaser, component-system, game-engine, typescript]
created: 2026-01-26
---

# PhaserJS Component System Wrapper

## Overview

Lightweight wrapper adding Unity-like component system to PhaserJS while keeping all built-in systems intact.

**Goal**: Fix pain points (Sprite≠Container, no components, transform issues) without replacing Phaser.

## Tech Stack

- PhaserJS 3.90.x
- TypeScript (strict)
- Vite

## Architecture

```
┌─────────────────────────────────────────────────┐
│                  Your Game                       │
├─────────────────────────────────────────────────┤
│  GameObject Wrapper Layer (this project)        │
│  ├── GameObject (wraps Container)               │
│  ├── Component (attachable behaviors)           │
│  └── ComponentManager (per-scene lifecycle)     │
├─────────────────────────────────────────────────┤
│         PhaserJS 3.90 (untouched)               │
│  Scenes│Physics│Audio│Input│Assets│Tweens      │
└─────────────────────────────────────────────────┘
```

## Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Base class | Phaser.GameObjects.Container | Already has hierarchy support |
| Update hook | Scene 'update' event | Use Phaser's loop, no custom ticker |
| Component storage | Map<Constructor, Component> | O(1) lookup by type |
| Destroy cleanup | Override destroy() | Ensure component detach |

## Phases

| # | Phase | Status | Est |
|---|-------|--------|-----|
| 1 | [Project Setup](./phase-01-project-setup.md) | Complete | 30m |
| 2 | [Core Implementation](./phase-02-core-implementation.md) | Complete | 2h |
| 3 | [Demo & Validation](./phase-03-demo-validation.md) | Complete | 1.5h |

## File Structure

```
src/
├── game-objects/
│   ├── index.ts              # Public exports
│   ├── game-object.ts        # GameObject class (~100 lines)
│   ├── component.ts          # Component base (~50 lines)
│   └── component-manager.ts  # Scene-level manager (~60 lines)
├── types/
│   └── game-object.types.ts  # Type definitions (~40 lines)
├── demo/
│   ├── main.ts               # Entry point
│   ├── game-config.ts        # Phaser config
│   └── scenes/
│       └── demo-scene.ts     # Demo scene with GameObjects
└── index.ts                  # Library entry
```

**Total**: ~8 files, ~350 lines

## Success Criteria

- [x] GameObject extends Phaser.Container with component support
- [x] Components receive update(dt) calls via Phaser scene loop
- [x] Type-safe getComponent<T>() works
- [x] Proper cleanup on destroy (no memory leaks)
- [x] Demo shows Player + Enemy with Movement components
- [x] Zero impact on Phaser's built-in systems

## Dependencies

```json
{
  "phaser": "^3.90.0",
  "typescript": "^5.0.0",
  "vite": "^5.0.0"
}
```

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Update order unpredictable | Medium | Document; add priority if needed |
| Phaser version breaking | Low | Pin version, test on upgrade |
