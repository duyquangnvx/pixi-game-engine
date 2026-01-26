---
phase: 4
title: "Testing & Validation"
status: pending
priority: P1
effort: 1h
---

# Phase 4: Testing & Validation

## Context
- [Parent Plan](plan.md)
- [Phase 3: Core Refactor](phase-03-core-refactor.md)

## Overview
Validate refactored PixelRenderer works correctly with demo-game.

## Requirements
- Verify crisp pixel rendering at multiple scales
- Test all animation features
- Test palette swap functionality
- Verify no memory leaks

## Test Cases

### 1. Visual Rendering
- [ ] Pixels render crisp at scale=1
- [ ] Pixels render crisp at scale=4
- [ ] Pixels render crisp at scale=8
- [ ] No blur when sprite moves
- [ ] No artifacts at edges

### 2. Animation
- [ ] play() starts animation
- [ ] stop() stops animation
- [ ] pause()/resume() work
- [ ] forward direction works
- [ ] reverse direction works
- [ ] pingpong direction works
- [ ] repeat count works
- [ ] animationComplete event fires

### 3. Palette Swap
- [ ] setPalette() changes colors immediately
- [ ] paletteChange event fires
- [ ] Animation continues after palette swap

### 4. Transform Properties
- [ ] scale getter/setter works
- [ ] flipX/flipY work
- [ ] depth works
- [ ] alpha works
- [ ] setOrigin works

### 5. Cleanup
- [ ] onDetach removes texture
- [ ] No console errors/warnings
- [ ] Memory stable over time

## Related Files
- `packages/demo-game/src/scenes/pixel-art-scene.ts`

## Implementation Steps

1. Build engine: `pnpm -F @pge/core build`
2. Run demo: `pnpm -F demo-game dev`
3. Navigate to Pixel Art scene
4. Verify visual rendering (check for blur)
5. Test animation controls
6. Test palette cycling
7. Check console for errors
8. Optional: Use Chrome DevTools MCP for automated validation

## Todo
- [ ] Build engine
- [ ] Run demo-game
- [ ] Visual inspection
- [ ] Test animation
- [ ] Test palette swap
- [ ] Check console errors
- [ ] Document any issues found

## Success Criteria
- All test cases pass
- No console errors
- Pixel art is visually crisp
- Demo scene works as before

## Risk Assessment
- Low - Validation phase, issues found here go back to Phase 3

## Next Steps
If all tests pass → Mark plan as complete
If issues found → Fix in Phase 3, re-validate
