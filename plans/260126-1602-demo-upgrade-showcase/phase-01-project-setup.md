# Phase 1: Project Setup

## Context
- Parent: [plan.md](plan.md)
- Engine: packages/engine (all exports available)
- Demo: packages/demo-game

## Overview
| Field | Value |
|-------|-------|
| Priority | P0 |
| Status | Pending |
| Est | 1h |

Update demo-game configuration to enable all engine features.

## Key Insights
- Current demo doesn't use physics (no Arcade Physics enabled)
- No asset preloading system
- Missing engine imports for utilities

## Requirements
- Enable Arcade Physics for Collider/RigidBody
- Add shared constants file
- Update game config with multiple scenes
- Ensure all @pge/core imports work

## Architecture
```
game-config.ts
├── physics: { default: 'arcade' }
├── scene: [LoadingScene, MenuScene, PixelArtScene, ...]
└── backgroundColor: dark theme
```

## Related Files
- `packages/demo-game/src/game-config.ts` - Modify
- `packages/demo-game/src/constants.ts` - Create
- `packages/demo-game/src/main.ts` - Keep minimal

## Implementation Steps

1. **Update game-config.ts**
```typescript
import { LoadingScene } from './scenes/loading-scene';
import { MenuScene } from './scenes/menu-scene';
import { PixelArtScene } from './scenes/pixel-art-scene';
import { PlaygroundScene } from './scenes/playground-scene';
import { PhysicsScene } from './scenes/physics-scene';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  physics: {
    default: 'arcade',
    arcade: { gravity: { x: 0, y: 0 }, debug: false }
  },
  scene: [LoadingScene, MenuScene, PixelArtScene, PlaygroundScene, PhysicsScene],
};
```

2. **Create constants.ts**
```typescript
export const COLORS = {
  bg: 0x1a1a2e,
  primary: 0x16213e,
  accent: 0xe94560,
  text: 0xffffff,
};

export const SCENES = {
  LOADING: 'LoadingScene',
  MENU: 'MenuScene',
  PIXEL_ART: 'PixelArtScene',
  PLAYGROUND: 'PlaygroundScene',
  PHYSICS: 'PhysicsScene',
};
```

## Todo
- [ ] Update game-config.ts with physics and scenes
- [ ] Create constants.ts
- [ ] Verify @pge/core imports in package.json

## Success Criteria
- Game boots without errors
- Physics system available
- All scene keys defined

## Risk Assessment
- Low: Standard Phaser configuration

## Next Steps
→ Phase 2: Scene Infrastructure
