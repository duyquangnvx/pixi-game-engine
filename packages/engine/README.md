# @pge/core

Production-ready composition-based game engine wrapper for PhaserJS.

## Features

- **Composition over inheritance** - Attach components to GameObjects
- **TypeScript-first** - Full type safety with IntelliSense
- **Built-in components** - Transform, SpriteRenderer, Animator, Collider, RigidBody, SpineRenderer
- **Scene management** - BaseScene, transitions, asset loading
- **Utilities** - InputManager, AudioManager, StorageManager
- **Debug tools** - FPS overlay, profiler, logger (tree-shaken in prod)

## Installation

```bash
npm install @pge/core phaser
```

## Quick Start

```typescript
import Phaser from 'phaser';
import { BaseScene, GameObject, Transform, SpriteRenderer } from '@pge/core';

class GameScene extends BaseScene {
  constructor() {
    super('GameScene');
  }

  getAssets() {
    return [{ key: 'player', type: 'image', url: 'player.png' }];
  }

  onCreate() {
    const player = new GameObject(this, 'Player');
    player.addComponent(Transform);
    player.addComponent(SpriteRenderer, { textureKey: 'player' });
  }
}

new Phaser.Game({
  width: 800,
  height: 600,
  scene: [GameScene],
});
```

## Components

### Transform
Position, rotation, and scale with parent hierarchy support.

```typescript
const transform = obj.addComponent(Transform);
transform.position.set(100, 200);
transform.rotation = Math.PI / 4;
```

### SpriteRenderer
Display textures with tint, flip, and origin control.

```typescript
const sprite = obj.addComponent(SpriteRenderer, { textureKey: 'player' });
sprite.tint = 0xff0000;
sprite.flipX = true;
```

### Animator
Sprite sheet animations with state machine.

```typescript
const animator = obj.addComponent(Animator);
animator.addAnimation('walk', { key: 'player', frames: [0, 1, 2, 3], frameRate: 10 });
animator.play('walk');
```

### Collider
Arcade Physics collision detection.

```typescript
const collider = obj.addComponent(Collider, { shape: 'box', width: 32, height: 32 });
collider.on('collide', (other) => console.log('Hit!', other));
```

### RigidBody
Physics-based movement with velocity and gravity.

```typescript
const body = obj.addComponent(RigidBody);
body.velocity.set(100, 0);
body.gravityScale = 1;
```

## Scene Management

```typescript
import { SceneManager } from '@pge/core';

// In your scene
const sceneManager = new SceneManager(this);
await sceneManager.goto('NextScene', { score: 100 }, { type: 'fade', duration: 500 });
```

## Utilities

### InputManager
Action-based input with keyboard and gamepad support.

```typescript
const input = new InputManager(scene);
input.bindAction('jump', ['SPACE', 'GAMEPAD_A']);

if (input.isActionJustPressed('jump')) {
  player.jump();
}
```

### AudioManager
Music and SFX with volume control.

```typescript
const audio = new AudioManager(scene);
audio.playMusic('bgm', { loop: true, volume: 0.5 });
audio.playSfx('explosion');
```

### StorageManager
Typed localStorage wrapper.

```typescript
const storage = new StorageManager('my-game');
storage.save('highscore', 1000);
const score = storage.load<number>('highscore', 0);
```

## Debug Tools

```typescript
import { DebugOverlay } from '@pge/core/debug';

const debug = new DebugOverlay(scene);
debug.addStat('Objects', () => gameObjects.length);
// Press F3 to toggle
```

## Sub-path Exports

```typescript
// Import only what you need (tree-shakeable)
import { Transform, SpriteRenderer } from '@pge/core/components';
import { BaseScene, SceneManager } from '@pge/core/scenes';
import { InputManager, AudioManager } from '@pge/core/utils';
import { DebugOverlay, Profiler } from '@pge/core/debug';
```

## Requirements

- Phaser ^3.90.0 (peer dependency)
- TypeScript ^5.0.0 (recommended)

## License

MIT
