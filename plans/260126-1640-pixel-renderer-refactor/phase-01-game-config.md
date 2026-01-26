---
phase: 1
title: "Game Config Update"
status: pending
priority: P0
effort: 0.5h
---

# Phase 1: Game Config Update

## Context
- [Parent Plan](plan.md)
- Phaser game config controls default texture filtering

## Overview
Add pixel art settings to enable NEAREST filtering globally.

## Requirements
- Enable `pixelArt: true` - Forces NEAREST filtering on all textures
- Enable `antialias: false` - Disable antialiasing for crisp edges
- Optional: `roundPixels: true` - Prevents sub-pixel blurring

## Related Files
- `packages/demo-game/src/game-config.ts`

## Implementation Steps

1. Read current game-config.ts
2. Add pixel art configuration:
```typescript
export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  pixelArt: true,      // ADD: Forces NEAREST filtering
  antialias: false,    // ADD: Disable antialiasing
  roundPixels: true,   // ADD: Prevent sub-pixel positioning
  // ... rest unchanged
};
```

## Todo
- [ ] Add `pixelArt: true`
- [ ] Add `antialias: false`
- [ ] Add `roundPixels: true`
- [ ] Test that existing demo still works

## Success Criteria
- Game config updated without breaking existing scenes
- Console shows no errors on startup

## Risk Assessment
- Low risk - additive config change only

## Next Steps
Proceed to Phase 2: Format Conversion
