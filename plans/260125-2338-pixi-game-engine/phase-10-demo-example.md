# Phase 10: Demo Example

## Context Links
- [Plan Overview](./plan.md)
- All previous phase files

## Overview
- **Priority**: Medium
- **Status**: Pending
- **Description**: Create simple demo game showcasing all engine systems

## Key Insights
- Demo validates all systems work together
- Simple gameplay avoids scope creep
- Loading screen demonstrates asset system
- Pause menu shows scene stacking
- **Use ObjectPool for enemies and bullets** to demonstrate proper pooling pattern

## Requirements

### Functional
- Loading scene with progress bar
- Menu scene with start button
- Game scene with player and enemies
- Pause menu (push/pop scene)
- Sound effects and music
- Keyboard and touch controls

### Non-Functional
- Runs at 60fps
- < 5MB total assets
- Works on mobile and desktop

## Architecture

```
demo/
├── demo-game.ts         ─── Demo entry point
├── scenes/
│   ├── loading-scene.ts ─── Asset loading
│   ├── menu-scene.ts    ─── Main menu
│   ├── game-scene.ts    ─── Gameplay
│   └── pause-scene.ts   ─── Pause overlay
├── objects/
│   ├── player.ts        ─── Player object
│   └── enemy.ts         ─── Enemy object
└── components/
    └── movement.ts      ─── Movement component
```

## Related Code Files

### Create
- `src/demo/demo-game.ts` - Demo entry point (~60 lines)
- `src/demo/scenes/loading-scene.ts` - Loading screen (~80 lines)
- `src/demo/scenes/menu-scene.ts` - Main menu (~80 lines)
- `src/demo/scenes/game-scene.ts` - Gameplay (~120 lines)
- `src/demo/scenes/pause-scene.ts` - Pause overlay (~60 lines)
- `src/demo/objects/player.ts` - Player class (~80 lines)
- `src/demo/objects/enemy.ts` - Enemy class with reset() (~70 lines)
- `src/demo/objects/bullet.ts` - Bullet class with reset() (~50 lines)
- `src/demo/components/movement.ts` - Movement component (~50 lines)

### Create Assets
- `public/assets/sprites/player.png`
- `public/assets/sprites/enemy.png`
- `public/assets/sprites/button.png`
- `public/assets/audio/bgm.mp3`
- `public/assets/audio/shoot.wav`
- `public/assets/audio/hit.wav`
- `public/assets/manifest.json`

## Implementation Steps

1. Create asset manifest:
   - Define bundles: preload, menu, game
   - List all assets with aliases

2. Create `src/demo/demo-game.ts`:
   - Initialize Game with config
   - Start with LoadingScene

3. Create `src/demo/scenes/loading-scene.ts`:
   - Show loading bar
   - Load 'menu' and 'game' bundles
   - Transition to MenuScene on complete

4. Create `src/demo/scenes/menu-scene.ts`:
   - Display title text
   - Animated start button (GSAP)
   - Play button click → GameScene
   - Background music starts

5. Create `src/demo/scenes/game-scene.ts`:
   - Create player at center
   - **Use ObjectPool for enemies** (acquire on spawn, release on destroy)
   - **Use ObjectPool for bullets** (acquire on shoot, release on hit/exit)
   - Spawn enemies periodically
   - Handle collisions (simple AABB)
   - Score display
   - ESC/tap → push PauseScene

6. Create `src/demo/scenes/pause-scene.ts`:
   - Semi-transparent overlay
   - "PAUSED" text
   - Resume button → pop scene
   - Quit button → replace with MenuScene

7. Create `src/demo/objects/player.ts`:
   - Extend GameObject
   - Add sprite
   - Movement via input
   - Shoot on spacebar/tap

8. Create `src/demo/objects/enemy.ts`:
   - Extend GameObject
   - Simple downward movement
   - **reset() method for pool reuse**
   - Release to pool on hit or exit screen

9. Create `src/demo/objects/bullet.ts`:
   - Extend GameObject
   - Upward movement
   - **reset() method for pool reuse**
   - Release to pool on hit or exit screen

10. Create `src/demo/components/movement.ts`:
   - Component for velocity-based movement
   - update() applies velocity

11. Create placeholder assets:
    - Simple colored squares for sprites
    - Free sound effects

12. Update main.ts:
    - Import and run demo

## Todo List

- [ ] Create asset manifest
- [ ] Create demo-game.ts
- [ ] Create loading-scene.ts
- [ ] Create menu-scene.ts
- [ ] Create game-scene.ts
- [ ] Create pause-scene.ts
- [ ] Create player.ts
- [ ] Create enemy.ts with reset()
- [ ] Create bullet.ts with reset()
- [ ] Setup ObjectPool for enemies and bullets
- [ ] Create movement.ts
- [ ] Create/add placeholder assets
- [ ] Test loading flow
- [ ] Test menu interactions
- [ ] Test gameplay
- [ ] Test pause/resume
- [ ] Test on mobile
- [ ] Test audio playback

## Success Criteria

- Loading screen shows progress
- Menu button animates and responds
- Player moves with keyboard/touch
- Enemies spawn and move
- **Bullets fire and pool correctly**
- **ObjectPool reuses enemies/bullets** (no GC spikes)
- Pause overlay works via scene stack
- Audio plays without issues
- No errors in console
- 60fps maintained

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Scope creep | High | Keep gameplay minimal |
| Asset loading issues | Medium | Use placeholders first |
| Mobile touch issues | Medium | Test early on device |

## Security Considerations
- Demo runs locally, no network requests

## Next Steps

- Engine complete after demo works
- Document API usage
- Consider publishing as npm package
