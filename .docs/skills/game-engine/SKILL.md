---
name: game-engine
description: >
  Development guide for the @duyquangnvx/pixi-game-engine library - a PixiJS v7
  game engine with static Engine class, scene management, input handling, asset loading,
  sound, particles, tweens, spine animations, and UI (modals, alerts, toasts). Use when
  working on code in this game engine repo: adding features, creating managers, writing
  scenes, building UI components, or extending the engine. Triggers on tasks involving
  PixiJS game development, Engine class usage, scene lifecycle, manager patterns, or
  any work within the pixi-game-engine codebase.
---

# Game Engine Development Guide

## Architecture

Static `Engine` class orchestrates all subsystems. No instances - access everything via static getters.

```
Engine.init(config) -> creates PIXI.Application + all managers
Engine.scenes / .input / .assets / .sound / .particles / .tween / .ui / .spine / .toast / .alert / .modal
```

## Key Patterns

### Always use `Engine` static access

```typescript
// Correct
Engine.tween.to(sprite, { alpha: 0, duration: 0.5 });
Engine.sound.playSfx('click');
Engine.toast.success('Win!');

// Wrong - never pass Engine as parameter
constructor(private engine: typeof Engine) {} // Don't do this
```

### Initialization

```typescript
Engine.init({ width: 1920, height: 1080, scaleMode: 'letterbox' });
document.body.appendChild(Engine.view as HTMLCanvasElement);
Engine.resizeToWindow();
```

### Scene pattern

Scenes extend `PIXI.Container` with lifecycle hooks. Use `this.engine` for Engine access.

```typescript
class GameScene extends Scene {
    onEnter() {
        // Setup - async supported
        const bg = new PIXI.Sprite(Engine.assets.get('bg'));
        this.addChild(bg);
        Engine.sound.playMusic('bgm');
    }
    onUpdate(delta: number) {
        if (Engine.input.keyboard.justPressed('Space')) { /* jump */ }
    }
    onExit() { /* cleanup */ }
}

Engine.scenes.add('game', GameScene);
await Engine.scenes.start('game');
```

### Custom modal pattern

```typescript
class SettingsModal extends BaseModal<{ volume: number }> {
    protected onShow(data: { volume: number }) {
        const title = this.createTitle('Settings');
        title.x = this.config.width / 2 - title.width / 2;
        title.y = 20;
        this.contentContainer.addChild(title);

        const btn = this.createButton({ text: 'Close', onClick: () => this.hide() });
        this.contentContainer.addChild(btn);
    }
}

const modal = new SettingsModal({ width: 500, height: 400, animation: 'scale' });
Engine.modal.show(modal);
await modal.show({ volume: 0.8 });
```

### Signal pattern

```typescript
const onHit = new Signal<{ damage: number }>();
const binding = onHit.add((data) => console.log(data.damage));
onHit.emit({ damage: 10 });
binding.detach();
```

## Module Structure

```
src/
  core/engine.ts        # Static Engine class + EngineConfig
  core/signal.ts        # Signal<T> event emitter
  scenes/scene.ts       # Abstract Scene base class
  scenes/scene-manager.ts
  input/                # KeyboardManager, PointerManager, GamepadManager
  assets/               # AssetManager (wraps PIXI.Assets)
  sound/                # SoundManager (@pixi/sound)
  particles/            # ParticleManager (@pixi/particle-emitter)
  tween/                # TweenManager (GSAP + PixiPlugin)
  spine/                # SpineManager (pixi-spine)
  ui/ui-manager.ts      # UIManager (buttons, text, progress bars)
  ui/modal/             # BaseModal, ModalManager
  ui/alert/             # AlertManager (promise-based)
  ui/toast/             # ToastManager (themed notifications)
  animations/           # CountAnimator (number counting)
  utils/                # Logger
  index.ts              # Barrel exports
```

Every subdirectory has a barrel `index.ts`. Root `src/index.ts` re-exports only from barrels.

## Build & Verify

```bash
pnpm build        # tsup -> ESM + CJS + DTS
pnpm typecheck    # tsc --noEmit
pnpm test         # Run tests
pnpm dev          # Watch mode
```

## Conventions

- All managers are constructed inside `Engine.init()` and accessed via static getters
- New managers: add private static field + public static getter in `engine.ts`, construct in `init()`, destroy in `destroy()`
- Game loop order: `onUpdate` emit -> `input.update()` -> `scenes.update()` -> `particles.update()` -> `input.postUpdate()`
- TweenManager uses GSAP's own ticker (no manual update call)
- UI overlays (toast, alert, modal) auto-resize via `Engine.onResize` signal
- Exports: add to subdirectory barrel, then to `src/index.ts`
- Types: use `export type` for interfaces/type aliases

## Full API Reference

For complete method signatures of all managers, types, and interfaces, see [references/api_reference.md](references/api_reference.md).
