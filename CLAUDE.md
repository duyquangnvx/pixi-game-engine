# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# From monorepo root
pnpm build:engine                     # Build library
pnpm --filter @slot-game/game-engine dev   # Watch mode build
pnpm --filter @slot-game/game-engine test  # Run tests
pnpm --filter @slot-game/game-engine typecheck

### Game Singleton Pattern

**IMPORTANT:** Always use `Game.instance` to access the game instead of passing `game` as constructor parameter.

```typescript
// ✅ PREFERRED - Use singleton
import { Game } from '@slot-game/game-engine';

class MyComponent {
  doSomething() {
    Game.instance.tween.to(this, { alpha: 0 });
    Game.instance.sound.playSfx('click');
  }
}

// ❌ AVOID - Passing game as parameter
class MyComponent {
  constructor(private game: Game) {} // Don't do this
}
```

**Initialization:**
```typescript
const game = Game.init({ width: 1920, height: 1080 });
document.body.appendChild(game.view as HTMLCanvasElement);
```

### Manager Pattern

The `Game` class (`src/core/game.ts`) orchestrates all subsystems. Access via `Game.instance`:

```typescript
Game.instance.scenes    // SceneManager - scene lifecycle
Game.instance.input     // InputManager - keyboard, pointer, gamepad
Game.instance.assets    // AssetManager - manifest-based loading
Game.instance.sound     // SoundManager - @pixi/sound wrapper
Game.instance.particles // ParticleManager - particle effects
Game.instance.tween     // TweenManager - GSAP with PixiPlugin
Game.instance.ui        // UIManager - @pixi/ui components
Game.instance.spine     // SpineManager - Spine animations
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
├── core/                 # Game orchestrator, Signal
│   ├── game.ts
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
