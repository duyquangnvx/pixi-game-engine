# Phase 6: Polish & Integration

## Context
- Parent: [plan.md](plan.md)
- Depends: Phases 1-5
- Final phase

## Overview
| Field | Value |
|-------|-------|
| Priority | P2 |
| Status | Pending |
| Est | 2h |

Final polish, testing, and documentation.

## Key Insights
- All features should work together
- Logger should be active across all scenes
- Debug overlay (F3) should be consistent
- StorageManager should persist user preferences

## Requirements
- Test all scene transitions
- Verify all features work
- Add feature labels/annotations in-game
- Update README with demo instructions
- Clean up any TypeScript errors

## Implementation Steps

### 1. Feature verification checklist
```
□ LoadingScene → MenuScene transition
□ MenuScene → PixelArtScene (slide)
□ MenuScene → PlaygroundScene (fade)
□ MenuScene → PhysicsScene (scale)
□ All back buttons work
□ F3 toggles debug overlay in all scenes
□ Logger outputs to console
□ Pixel art palette swap works
□ Pixel art cycling works
□ Transform hierarchy rotates correctly
□ Input bindings display properly
□ Audio volume saves to storage
□ Physics balls spawn and bounce
□ Object pool recycles balls
□ Physics debug toggle works
```

### 2. Add feature annotations
Each scene should have subtle labels showing which engine features are being demonstrated:
- Top-right corner: "Features: X, Y, Z"
- Use #666 color, 10px font

### 3. Update demo README
```markdown
# PGE Demo Game

Comprehensive showcase of @pge/core engine features.

## Running
pnpm dev

## Controls
- **All scenes**: F3 = Debug overlay
- **Menu**: Click buttons to navigate
- **Pixel Art**: 1-4 = Palette swap, C = Color cycling
- **Playground**: WASD/Arrows = Input demo, +/- = Volume
- **Physics**: Click = Spawn ball, R = Reset, D = Debug

## Features Demonstrated
- [x] PixelRenderer + PixelArtBuilder
- [x] Palette swapping (runtime)
- [x] Transform hierarchy
- [x] InputManager bindings
- [x] AudioManager + StorageManager
- [x] Collider + RigidBody
- [x] ObjectPool
- [x] SceneManager + Transitions
- [x] DebugOverlay + Logger
```

### 4. Final code review
- Remove unused imports
- Fix any TypeScript strict mode errors
- Ensure all files under 200 lines
- Add JSDoc comments to public APIs

### 5. Test matrix

| Scene | Feature | Test |
|-------|---------|------|
| Loading | Progress bar | Visual |
| Loading | DebugOverlay | F3 toggle |
| Menu | Navigation | Click each button |
| Menu | Transitions | Visual (fade/slide/scale) |
| PixelArt | PixelArtBuilder | Character renders |
| PixelArt | Animation | Idle pingpong plays |
| PixelArt | Palette swap | 1-4 keys change colors |
| PixelArt | Cycling | C toggles effect |
| Playground | Transform | Parent rotates, children orbit |
| Playground | InputManager | WASD/Arrows/Space display |
| Playground | AudioManager | +/- adjust volume |
| Playground | StorageManager | Volume persists on reload |
| Physics | Spawn | Click spawns ball |
| Physics | Collision | Balls bounce |
| Physics | Pool | Stats update |
| Physics | Debug | D shows colliders |
| Physics | Reset | R clears balls |

## Todo
- [ ] Run through verification checklist
- [ ] Add feature annotations to each scene
- [ ] Update README.md
- [ ] Final TypeScript check (`pnpm typecheck`)
- [ ] Final build test (`pnpm build`)

## Success Criteria
- All scenes load without errors
- All features functional
- No TypeScript errors
- README documents all controls
- Demo is self-explanatory

## Final Deliverables
```
packages/demo-game/
├── src/
│   ├── main.ts
│   ├── game-config.ts
│   ├── constants.ts
│   ├── scenes/
│   │   ├── loading-scene.ts
│   │   ├── menu-scene.ts
│   │   ├── pixel-art-scene.ts
│   │   ├── playground-scene.ts
│   │   └── physics-scene.ts
│   ├── prefabs/
│   │   ├── ui-button.ts
│   │   ├── pixel-character.ts
│   │   └── physics-ball.ts
│   └── components/
│       ├── health.ts (existing)
│       ├── movement.ts (existing)
│       ├── patrol.ts (existing)
│       └── palette-cycler.ts (new)
└── README.md
```

**Total new files**: 10
**Total modified files**: 2 (game-config.ts, main.ts)
**Lines added**: ~600-700 (under 800 target)
