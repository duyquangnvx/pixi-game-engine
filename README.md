# @duyquangnvx/pixi-game-engine

Full-featured PixiJS v7 game engine with TypeScript support.

## Installation

```bash
pnpm add @duyquangnvx/pixi-game-engine
```

## Quick Start

```typescript
import { Engine, Scene, PIXI } from '@duyquangnvx/pixi-game-engine';

class GameScene extends Scene {
  private player!: PIXI.Sprite;

  onEnter() {
    this.player = new PIXI.Graphics();
    this.player.beginFill(0x4ecca3);
    this.player.drawRect(-25, -25, 50, 50);
    this.player.x = Engine.screen.width / 2;
    this.player.y = Engine.screen.height / 2;
    this.addChild(this.player);
  }

  onUpdate(delta: number) {
    const { keyboard } = Engine.input;

    if (keyboard.isDown('ArrowLeft')) this.player.x -= 5 * delta;
    if (keyboard.isDown('ArrowRight')) this.player.x += 5 * delta;
    if (keyboard.isDown('ArrowUp')) this.player.y -= 5 * delta;
    if (keyboard.isDown('ArrowDown')) this.player.y += 5 * delta;
  }

  onExit() {}
}

Engine.init({
  width: 800,
  height: 600,
  backgroundColor: 0x1a1a2e,
});

document.body.appendChild(Engine.view as HTMLCanvasElement);
Engine.scenes.add('game', GameScene);
Engine.scenes.start('game');
```

## Features

| Feature | Module | Description |
|---------|--------|-------------|
| Scenes | `SceneManager` | Scene lifecycle, transitions |
| Input | `InputManager` | Keyboard, mouse, touch, gamepad |
| Assets | `AssetManager` | Manifest-based loading |
| Sound | `SoundManager` | @pixi/sound wrapper |
| Particles | `ParticleManager` | @pixi/particle-emitter |
| Tweens | `TweenManager` | GSAP + PixiPlugin |
| UI | `UIManager` | @pixi/ui components |
| Spine | `SpineManager` | pixi-spine animations |

## Dependencies

- pixi.js ^7.4.2
- @pixi/sound ^5.2.3
- @pixi/particle-emitter ^5.0.10
- @pixi/ui ^1.2.4
- pixi-spine ^4.0.5
- gsap ^3.12.x

## License

MIT
