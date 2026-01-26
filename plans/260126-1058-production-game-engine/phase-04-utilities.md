# Phase 4: Utilities

## Context Links
- [Plan Overview](./plan.md)
- [Phase 3](./phase-03-scene-management.md)

## Overview
- **Priority**: P1 (High)
- **Status**: Pending
- **Est**: 2 days
- **Description**: Input, audio, and storage managers

## Requirements

### Functional
- F1: InputManager with action mapping
- F2: AudioManager with music/sfx separation
- F3: StorageManager with localStorage

## Architecture

### InputManager
```typescript
class InputManager {
  bindAction(name, keys): void
  isActionDown(name): boolean
  isActionJustPressed(name): boolean
  getAxis(name): number  // for analog
}
```

### AudioManager
```typescript
class AudioManager {
  playMusic(key, config?): void
  playSfx(key, config?): void
  stopMusic(fadeMs?): void
  setMusicVolume(vol): void
  setSfxVolume(vol): void
}
```

### StorageManager
```typescript
class StorageManager {
  save<T>(key, value): void
  load<T>(key, default?): T
  delete(key): void
  clear(): void
}
```

## Related Code Files

### Create
- `src/utils/input-manager.ts`
- `src/utils/audio-manager.ts`
- `src/utils/storage-manager.ts`
- `src/utils/index.ts`
- `src/types/input.types.ts`

## Implementation Steps

1. Create InputManager with action binding
2. Add gamepad support
3. Create AudioManager with volumes
4. Add music crossfade
5. Create StorageManager with JSON

## Todo List
- [ ] Create InputManager
- [ ] Gamepad support
- [ ] Create AudioManager
- [ ] Music crossfade
- [ ] Create StorageManager
- [ ] Unit tests

## Success Criteria
- Input actions work keyboard + gamepad
- Audio plays correctly
- Storage persists sessions
