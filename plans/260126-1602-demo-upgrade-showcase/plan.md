---
title: "Demo Upgrade - Comprehensive Feature Showcase"
description: "Upgrade demo-game to showcase all 33 engine features with pixel-art priority"
status: complete
priority: P1
effort: 1d
branch: engine
tags: [demo, showcase, pixel-art, comprehensive]
created: 2026-01-26
completed: 2026-01-26
---

# Demo Upgrade - Comprehensive Feature Showcase

## Overview
Transform minimal demo into comprehensive showcase of engine features. Priority: Pixel-art module with multiple characters.

## Data Flow
```
LoadingScene → MenuScene → [PixelArtScene | PlaygroundScene]
                  ↑____________________________|
```

## Phases

| # | Phase | Priority | Status | Est |
|---|-------|----------|--------|-----|
| 1 | [Project Setup](phase-01-project-setup.md) | P0 | Complete | 1h |
| 2 | [Scene Infrastructure](phase-02-scene-infrastructure.md) | P0 | Complete | 2h |
| 3 | [Pixel-Art Showcase](phase-03-pixel-art-showcase.md) | P0 | Complete | 3h |
| 4 | [Playground Scene](phase-04-playground-scene.md) | P1 | Complete | 2h |
| 5 | ~~Physics Demo~~ | - | Skipped | - |
| 6 | [Polish & Integration](phase-06-polish-integration.md) | P2 | Complete | 2h |

**Total Est**: ~10h (1 day)

## File Structure

```
packages/demo-game/src/
├── main.ts                          # Entry point
├── game-config.ts                   # Updated config
├── constants.ts                     # Colors, keys, shared constants
├── scenes/
│   ├── loading-scene.ts             # Asset loading with progress
│   ├── menu-scene.ts                # Interactive menu
│   ├── pixel-art-scene.ts           # Pixel-art showcase (PRIORITY)
│   └── playground-scene.ts          # Components + Input + Audio
├── prefabs/
│   ├── pixel-characters.ts          # Multiple PixelRenderer chars
│   └── ui-button.ts                 # Reusable menu button
├── components/
│   └── palette-cycler.ts            # Auto palette cycling
└── assets/
    └── (procedural via PixelArtBuilder)
```

**Note:** Existing components (health, movement, patrol) will be removed (clean slate).

## Engine Features Coverage

| Feature | Scene | Method |
|---------|-------|--------|
| **Pixel-Art Module** | PixelArtScene | Full showcase |
| PixelRenderer | PixelArtScene | Multiple animated chars |
| PixelArtBuilder | PixelArtScene | Procedural sprites (3 chars) |
| Palette Swap | PixelArtScene | Real-time color change |
| **Components** | Playground | Interactive demo |
| Transform | Playground | Parent-child hierarchy |
| SpriteRenderer | Playground | Tinting, flipping |
| ~~Physics~~ | ~~Skipped~~ | ~~Per validation~~ |
| **Scenes** | All | Navigation system |
| BaseScene | All | Asset loading |
| SceneManager | Menu | Transitions |
| Transitions | Menu | Fade/slide/scale |
| **Utilities** | Playground | Settings panel |
| InputManager | Playground | Keyboard/gamepad |
| AudioManager | Playground | Visual only (no files) |
| StorageManager | Menu | Save settings |
| **Debug** | All | Toggle with F3 |
| DebugOverlay | All | FPS counter |
| Logger | All | Console output |

## Dependencies
- @pge/core (current engine)
- Phaser 3.90+
- No external assets (procedural generation)

## Research
- [Demo Patterns](research/demo-patterns-research.md)
- [Pixel-Art Techniques](research/pixel-art-research.md)

## Validation Summary

**Validated:** 2026-01-26
**Questions asked:** 4

### Confirmed Decisions

| Decision | Choice |
|----------|--------|
| Assets approach | Procedural only (no external files) |
| Physics scene | Skip (Phase 5 removed) |
| Pixel character detail | Multiple sprites (2-3 different characters) |
| Legacy code | Remove unused (clean slate) |

### Action Items
- [x] Update plan.md - remove Phase 5, update file structure
- [x] Phase 3: Expand to 2-3 pixel characters instead of 1
- [x] Phase 1: Remove existing health/movement/patrol components
- [x] Phase 6: Update checklist to exclude physics tests
