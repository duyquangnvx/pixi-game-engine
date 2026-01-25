# Phase 06: Audio System

## Context Links
- [Plan Overview](./plan.md)
- [PixiJS Ecosystem Libraries](../reports/researcher-260125-2338-pixi-ecosystem-libs.md)

## Overview
- **Priority**: High
- **Status**: Pending
- **Description**: Wrap @pixi/sound with game-friendly interface

## Key Insights
- @pixi/sound is official PixiJS audio plugin
- Web Audio API based
- Volume control, pause/resume built-in
- Integrates with PixiJS Assets for loading

**We wrap existing @pixi/sound, not build from scratch.**

## Requirements

### Functional
- Play sound effects (fire and forget)
- Play background music (loop)
- Volume control per category (master, music, sfx)
- Mute/unmute
- Pause/resume all audio

### Non-Functional
- Thin wrapper over @pixi/sound
- TypeScript type safety
- Category-based volume multipliers

## Architecture

```typescript
AudioManager (thin wrapper)
├── volumes: Map<Category, number>  ─── Category multipliers
├── play(alias, options)            → sound.play(alias, options)
├── playMusic(alias)                → Stop current, start new loop
├── stopMusic()                     → Stop current music
├── setVolume(category, volume)     → Update category volume
├── mute() / unmute()               → sound.toggleMuteAll()
├── pause() / resume()              → sound.pauseAll() / resumeAll()
└── destroy()                       → sound.removeAll()
```

## Related Code Files

### Create
- `src/audio/audio-manager.ts` - Thin wrapper (~100 lines)
- `src/types/audio.types.ts` - Audio type definitions (~30 lines)

## Implementation Steps

1. Create `src/types/audio.types.ts`:
   - AudioCategory enum (Master, Music, SFX, UI)
   - PlayOptions interface
   - MusicOptions interface

2. Create `src/audio/audio-manager.ts`:
   - Import { sound } from '@pixi/sound'
   - Category volumes Map
   - currentMusic tracking
   - play(alias, options?): IMediaInstance
     - Apply category volume
     - Call sound.play(alias, options)
   - playMusic(alias, fadeIn?): void
     - Stop current music
     - Play new with loop: true
   - stopMusic(fadeOut?): void
   - setVolume(category, volume): void
     - Update volumes Map
     - Apply to playing sounds
   - getVolume(category): number
   - mute() / unmute(): void
     - sound.toggleMuteAll()
   - pause() / resume(): void
     - sound.pauseAll() / resumeAll()
   - destroy(): void
     - sound.removeAll()

3. Asset loading note:
   - @pixi/sound integrates with Assets
   - Sounds loaded via manifest are auto-registered
   - Or use sound.add() manually

4. Integrate with Game:
   - Add AudioManager instance
   - Pause audio on game pause
   - Resume on game resume

## Todo List

- [ ] Create audio.types.ts
- [ ] Create audio-manager.ts
- [ ] Implement play with categories
- [ ] Implement playMusic/stopMusic
- [ ] Implement volume controls
- [ ] Implement mute/unmute
- [ ] Implement pause/resume
- [ ] Integrate with Game
- [ ] Test SFX playback
- [ ] Test music playback

## Success Criteria

- SFX plays immediately
- Music loops correctly
- Volume changes apply instantly
- Mute silences all audio
- Pause/resume works
- No audio glitches

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| AudioContext blocked | High | Resume on user interaction |
| Safari issues | Medium | Test on Safari |

## Next Steps

- Proceed to Phase 07: Animation System
