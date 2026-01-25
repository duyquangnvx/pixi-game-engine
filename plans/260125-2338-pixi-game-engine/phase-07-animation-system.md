# Phase 07: Animation System

## Context Links
- [Plan Overview](./plan.md)
- [GSAP Integration Research](../reports/researcher-260125-2338-gsap-integration.md)
- [PixiJS Ecosystem Libraries](../reports/researcher-260125-2338-pixi-ecosystem-libs.md)

## Overview
- **Priority**: High
- **Status**: Pending
- **Description**: GSAP helpers + Spine integration for animations

## Key Insights
- GSAP PixiPlugin simplifies property animation
- @esotericsoftware/spine-pixi-v7 is official Spine runtime
- Spine handles skeletal animation
- GSAP handles tweening/transitions
- Both are industry standards

## Requirements

### Functional
- Initialize GSAP with PixiPlugin
- Animate PixiJS display objects
- Create animation timelines
- Load and play Spine animations
- Common game animation presets

### Non-Functional
- Smooth 60fps animations
- No memory leaks
- Easy-to-use API

## Architecture

```typescript
Tween (static helper)
├── initialize()           ─── Register PixiPlugin
├── to/from/fromTo         ─── Basic GSAP tweens
├── timeline()             ─── Timeline creation
├── fadeIn/fadeOut/pulse   ─── Presets
└── pauseAll/resumeAll     ─── Global control

SpineManager (thin wrapper)
├── create(alias)          ─── Create Spine from loaded data
├── play(spine, anim)      ─── Play animation
├── mix(spine, from, to)   ─── Set mix duration
└── destroy(spine)         ─── Cleanup
```

## Related Code Files

### Create
- `src/animation/tween.ts` - GSAP helpers (~100 lines)
- `src/animation/spine-manager.ts` - Spine wrapper (~80 lines)
- `src/types/animation.types.ts` - Animation types (~40 lines)

## Implementation Steps

1. Create `src/types/animation.types.ts`:
   - TweenProps interface
   - SpineOptions interface
   - AnimationPreset type

2. Create `src/animation/tween.ts`:
   - initialize(): register PixiPlugin
   - to(target, props, duration?, ease?): Tween
   - from(target, props, duration?, ease?): Tween
   - fromTo(target, from, to): Tween
   - timeline(options?): Timeline

   Presets:
   - fadeIn(target, duration?): Tween
   - fadeOut(target, duration?): Tween
   - pulse(target, scale?, duration?): Tween
   - shake(target, intensity?): Tween
   - flash(target, color?): Tween

   Control:
   - pauseAll(): gsap.globalTimeline.pause()
   - resumeAll(): gsap.globalTimeline.resume()

3. Create `src/animation/spine-manager.ts`:
   - Import Spine from @esotericsoftware/spine-pixi-v7
   - create(skeletonAlias, atlasAlias): Spine
     - Load skeleton and atlas from Assets
     - Return configured Spine instance
   - play(spine, animationName, loop?): void
     - spine.state.setAnimation(track, name, loop)
   - addAnimation(spine, animationName, delay?): void
     - Queue animation
   - setMix(spine, from, to, duration): void
     - Set transition mix
   - destroy(spine): void
     - Clean up resources

4. Asset loading for Spine:
   - Add .json (skeleton) and .atlas to manifest
   - @pixi-spine handles loading automatically

5. Integrate with Game:
   - Call Tween.initialize() in Game.initialize()
   - Pause animations on game pause

## Todo List

- [ ] Create animation.types.ts
- [ ] Create tween.ts
- [ ] Implement GSAP initialize
- [ ] Implement to/from/fromTo
- [ ] Implement presets
- [ ] Create spine-manager.ts
- [ ] Implement Spine create
- [ ] Implement play/addAnimation
- [ ] Implement setMix
- [ ] Integrate with Game
- [ ] Test GSAP tweens
- [ ] Test Spine animations

## Success Criteria

- GSAP animates PixiJS objects correctly
- Timeline sequences work
- Spine loads and plays animations
- Mixing transitions smoothly
- Pause/resume works globally

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| GSAP license (commercial) | Medium | Document free tier limits |
| Spine version mismatch | Medium | Match runtime to export version |

## Next Steps

- Proceed to Phase 08: Game Objects
