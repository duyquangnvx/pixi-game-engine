# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

pnpm build        # Build library (tsup → ESM + CJS + DTS)
pnpm dev          # Watch mode build
pnpm test         # Run tests
pnpm typecheck    # tsc --noEmit

### Static Engine Pattern

**IMPORTANT:** Always use `Engine` static class to access subsystems directly — no instance needed.

```typescript
// ✅ PREFERRED - Use static Engine
import { Engine } from '@slot-game/game-engine';

class MyComponent {
  doSomething() {
    Engine.tween.to(this, { alpha: 0 });
    Engine.sound.playSfx('click');
  }
}

// ❌ AVOID - Passing engine as parameter
class MyComponent {
  constructor(private engine: typeof Engine) {} // Don't do this
}
```

**Initialization:**
```typescript
Engine.init({ width: 1920, height: 1080 });
document.body.appendChild(Engine.view as HTMLCanvasElement);
```

### Manager Pattern

The `Engine` class (`src/core/engine.ts`) orchestrates all subsystems. Access via static getters:

```typescript
Engine.scenes    // SceneManager - scene lifecycle
Engine.input     // InputManager - keyboard, pointer, gamepad
Engine.assets    // AssetManager - manifest-based loading
Engine.sound     // SoundManager - @pixi/sound wrapper
Engine.particles // ParticleManager - particle effects
Engine.tween     // TweenManager - GSAP with PixiPlugin
Engine.ui        // UIManager - @pixi/ui components
Engine.spine     // SpineManager - Spine animations
```

Game loop order: input.update() → scenes.update() → particles.update() → input.postUpdate()

Note: TweenManager uses GSAP's internal ticker, so no manual update is needed in the game loop.

### Scene Lifecycle

Scenes extend `PIXI.Container` with lifecycle hooks:

```typescript
abstract class Scene extends PIXI.Container {
  onEnter(): void | Promise<void>  // Async init supported
  onUpdate(delta: number): void    // Per-frame update
  onExit(): void                   // Cleanup
}
```

### Module Structure

```
src/
├── core/                 # Engine orchestrator, Signal
│   ├── engine.ts
│   ├── signal.ts
│   └── index.ts
├── scenes/               # Scene, SceneManager
├── input/                # KeyboardManager, PointerManager, GamepadManager
├── assets/               # AssetManager, manifest types
├── sound/                # SoundManager
├── particles/            # ParticleManager
├── tween/                # TweenManager (GSAP integration)
├── spine/                # SpineManager
├── ui/                   # All UI subsystems
│   ├── ui-manager.ts     # UIManager (@pixi/ui helpers)
│   ├── modal/            # BaseModal, ModalManager
│   ├── alert/            # AlertManager (promise-based alerts)
│   ├── toast/            # ToastManager (themed notifications)
│   └── index.ts          # Umbrella barrel
├── animations/           # CountAnimator, presets
├── utils/                # Logger
└── index.ts              # Barrel exports (public API)
```

Every subdirectory has a barrel `index.ts`; the root `src/index.ts` re-exports only from barrels.

## Key Dependencies

- **pixi.js** ^7.4.2 - Core rendering
- **gsap** ^3.12.7 - Animation (PixiPlugin pre-registered in TweenManager)
- **@pixi/sound** ^5.2.3 - Audio
- **@pixi/ui** ^1.2.4 - UI components
- **pixi-spine** ^4.0.5 - Spine animations
