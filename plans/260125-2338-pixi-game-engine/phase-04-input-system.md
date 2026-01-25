# Phase 04: Input System

## Context Links
- [Plan Overview](./plan.md)
- [Game Engine Patterns Research](../reports/researcher-260125-2338-game-engine-patterns.md)

## Overview
- **Priority**: High
- **Status**: Pending
- **Description**: Create input system with keyboard, mouse, touch, gamepad support

## Key Insights
- Command pattern decouples input from actions
- Just-pressed/released states need frame tracking
- Mouse uses PixiJS events, keyboard uses DOM events
- Gamepad API requires polling each frame
- Touch can emulate mouse for simple cases

## Requirements

### Functional
- Keyboard: isDown, isJustPressed, isJustReleased
- Mouse: position, buttons, wheel
- Touch: multi-touch points, primary touch as mouse
- Gamepad: axes, buttons with deadzone
- Command binding for action mapping

### Non-Functional
- Input latency < 1 frame
- No memory allocation per frame
- Works on mobile and desktop

## Architecture

```typescript
InputManager
├── KeyboardHandler   ─── DOM keydown/keyup events
├── MouseHandler      ─── PixiJS pointer events
├── TouchHandler      ─── PixiJS touch events
├── GamepadHandler    ─── Navigator.getGamepads() polling
└── InputMapper       ─── Command pattern bindings
```

## Related Code Files

### Create
- `src/input/input-manager.ts` - Main coordinator (~80 lines)
- `src/input/keyboard.ts` - Keyboard handler (~100 lines)
- `src/input/mouse.ts` - Mouse handler (~80 lines)
- `src/input/touch.ts` - Touch handler (~80 lines)
- `src/input/gamepad.ts` - Gamepad handler (~100 lines)
- `src/input/command.ts` - Command pattern (~50 lines)
- `src/types/input.types.ts` - Input type definitions (~60 lines)

## Implementation Steps

1. Create `src/types/input.types.ts`:
   - KeyState type (up, down, justPressed, justReleased)
   - MouseButton enum
   - GamepadButton enum
   - InputAction interface
   - Command interface

2. Create `src/input/command.ts`:
   - Command interface with execute/undo
   - InputMapper class for bindings
   - Action-to-command mapping

3. Create `src/input/keyboard.ts`:
   - KeyboardHandler class
   - Key state tracking (Set<string>)
   - Just-pressed/released buffers
   - DOM event listeners
   - update() clears frame states

4. Create `src/input/mouse.ts`:
   - MouseHandler class
   - Position tracking (x, y)
   - Button states
   - Wheel delta
   - PixiJS stage event listeners

5. Create `src/input/touch.ts`:
   - TouchHandler class
   - Touch points array
   - Primary touch tracking
   - Touch-to-mouse emulation
   - PixiJS touch event listeners

6. Create `src/input/gamepad.ts`:
   - GamepadHandler class
   - Connected gamepad tracking
   - Axis values with deadzone
   - Button states
   - Poll in update()

7. Create `src/input/input-manager.ts`:
   - Coordinate all handlers
   - Unified API
   - update() calls all handlers
   - Destroy cleans up listeners

8. Integrate with Game:
   - Add InputManager instance
   - Add input getter
   - Call update in game loop (end of frame)

## Todo List

- [ ] Create input.types.ts
- [ ] Create command.ts
- [ ] Create keyboard.ts
- [ ] Create mouse.ts
- [ ] Create touch.ts
- [ ] Create gamepad.ts
- [ ] Create input-manager.ts
- [ ] Integrate with Game
- [ ] Test keyboard input
- [ ] Test mouse input
- [ ] Test touch input
- [ ] Test gamepad input
- [ ] Test command bindings

## Success Criteria

- Keyboard isDown() returns true while held
- isJustPressed() true only first frame
- Mouse position updates with pointer
- Touch primary point works as mouse
- Gamepad detected and axes work
- Commands execute on bound inputs
- No input lag or missed inputs

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Focus loss breaks keyboard | Medium | Re-attach on focus |
| Gamepad connection race | Low | Handle connect/disconnect events |
| Touch vs mouse conflict | Medium | Prioritize touch when present |

## Security Considerations
- No sensitive data from input
- Validate input values in commands

## Next Steps

- Proceed to Phase 05: Asset System
- Assets will be loaded based on scene needs
