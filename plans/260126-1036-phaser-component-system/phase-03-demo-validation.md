# Phase 03: Demo & Validation

## Context Links
- [Plan Overview](./plan.md)
- [Phase 02: Core Implementation](./phase-02-core-implementation.md)

## Overview
- **Priority**: High
- **Status**: Pending
- **Est**: 1.5 hours
- **Description**: Create demo showcasing component system with Player + Enemy

## Key Insights

- Demo should validate: component attach, update loop, destroy cleanup
- Use keyboard input (Phaser built-in) to move player
- Enemy with simple patrol behavior via component
- Show multiple components on single GameObject

## Requirements

### Functional
- Player with MovementComponent (keyboard controlled)
- Enemy with PatrolComponent (auto move between points)
- Both have HealthComponent (shared behavior)
- Visual sprites using Phaser graphics

### Non-Functional
- 60fps smooth movement
- No memory leaks when destroying objects
- Console logs component lifecycle events

## Related Code Files

### Create
- `src/demo/main.ts` - Phaser game entry
- `src/demo/game-config.ts` - Phaser configuration
- `src/demo/scenes/demo-scene.ts` - Main demo scene
- `src/demo/objects/player.ts` - Player GameObject
- `src/demo/objects/enemy.ts` - Enemy GameObject
- `src/demo/components/movement.ts` - Keyboard movement
- `src/demo/components/patrol.ts` - Auto patrol behavior
- `src/demo/components/health.ts` - Health tracking

## Implementation Steps

### Step 1: Create Components

`src/demo/components/movement.ts`:

```typescript
import { Component } from '@game-objects/component';

/**
 * Keyboard-controlled movement component.
 */
export class MovementComponent extends Component {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor(public speed = 200) {
    super();
  }

  onAttach(): void {
    this.cursors = this.scene.input.keyboard!.createCursorKeys();
    console.log(`[MovementComponent] Attached to ${this.owner.id}`);
  }

  onDetach(): void {
    console.log(`[MovementComponent] Detached from ${this.owner.id}`);
  }

  update(dt: number): void {
    const velocity = { x: 0, y: 0 };

    if (this.cursors.left.isDown) velocity.x = -1;
    else if (this.cursors.right.isDown) velocity.x = 1;

    if (this.cursors.up.isDown) velocity.y = -1;
    else if (this.cursors.down.isDown) velocity.y = 1;

    // Normalize diagonal movement
    const len = Math.sqrt(velocity.x ** 2 + velocity.y ** 2);
    if (len > 0) {
      velocity.x /= len;
      velocity.y /= len;
    }

    // Apply movement (dt is in ms, convert to seconds)
    const dtSec = dt / 1000;
    this.owner.x += velocity.x * this.speed * dtSec;
    this.owner.y += velocity.y * this.speed * dtSec;
  }
}
```

`src/demo/components/patrol.ts`:

```typescript
import { Component } from '@game-objects/component';

/**
 * Auto-patrol between points.
 */
export class PatrolComponent extends Component {
  private points: Phaser.Math.Vector2[];
  private currentIndex = 0;

  constructor(
    points: Array<{ x: number; y: number }>,
    public speed = 100
  ) {
    super();
    this.points = points.map(p => new Phaser.Math.Vector2(p.x, p.y));
  }

  onAttach(): void {
    console.log(`[PatrolComponent] Attached with ${this.points.length} patrol points`);
  }

  update(dt: number): void {
    const target = this.points[this.currentIndex];
    const dx = target.x - this.owner.x;
    const dy = target.y - this.owner.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Reached target?
    if (dist < 5) {
      this.currentIndex = (this.currentIndex + 1) % this.points.length;
      return;
    }

    // Move towards target
    const dtSec = dt / 1000;
    const moveSpeed = Math.min(this.speed * dtSec, dist);
    this.owner.x += (dx / dist) * moveSpeed;
    this.owner.y += (dy / dist) * moveSpeed;
  }
}
```

`src/demo/components/health.ts`:

```typescript
import { Component } from '@game-objects/component';

/**
 * Health tracking component.
 */
export class HealthComponent extends Component {
  private _health: number;

  constructor(public maxHealth = 100) {
    super();
    this._health = maxHealth;
  }

  get health(): number {
    return this._health;
  }

  onAttach(): void {
    console.log(`[HealthComponent] Attached with ${this.maxHealth} HP`);
  }

  takeDamage(amount: number): void {
    this._health = Math.max(0, this._health - amount);
    console.log(`[HealthComponent] ${this.owner.id} took ${amount} damage, HP: ${this._health}`);

    if (this._health <= 0) {
      console.log(`[HealthComponent] ${this.owner.id} died!`);
      this.owner.destroy();
    }
  }

  heal(amount: number): void {
    this._health = Math.min(this.maxHealth, this._health + amount);
  }
}
```

### Step 2: Create GameObjects

`src/demo/objects/player.ts`:

```typescript
import Phaser from 'phaser';
import { GameObject } from '@game-objects/game-object';
import { MovementComponent } from '../components/movement';
import { HealthComponent } from '../components/health';

export class Player extends GameObject {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, { name: 'Player' });

    // Create visual (blue rectangle)
    const graphics = scene.add.graphics();
    graphics.fillStyle(0x3498db);
    graphics.fillRect(-20, -20, 40, 40);
    graphics.generateTexture('player_tex', 40, 40);
    graphics.destroy();

    const sprite = scene.add.sprite(0, 0, 'player_tex');
    this.add(sprite);

    // Add components
    this.addComponent(new MovementComponent(200));
    this.addComponent(new HealthComponent(100));
  }
}
```

`src/demo/objects/enemy.ts`:

```typescript
import Phaser from 'phaser';
import { GameObject } from '@game-objects/game-object';
import { PatrolComponent } from '../components/patrol';
import { HealthComponent } from '../components/health';

export class Enemy extends GameObject {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    patrolPoints: Array<{ x: number; y: number }>
  ) {
    super(scene, x, y, { name: 'Enemy' });

    // Create visual (red rectangle)
    const graphics = scene.add.graphics();
    graphics.fillStyle(0xe74c3c);
    graphics.fillRect(-15, -15, 30, 30);
    graphics.generateTexture('enemy_tex', 30, 30);
    graphics.destroy();

    const sprite = scene.add.sprite(0, 0, 'enemy_tex');
    this.add(sprite);

    // Add components
    this.addComponent(new PatrolComponent(patrolPoints, 80));
    this.addComponent(new HealthComponent(50));
  }
}
```

### Step 3: Create Demo Scene

`src/demo/scenes/demo-scene.ts`:

```typescript
import Phaser from 'phaser';
import { Player } from '../objects/player';
import { Enemy } from '../objects/enemy';
import { HealthComponent } from '../components/health';

export class DemoScene extends Phaser.Scene {
  private player!: Player;
  private enemies: Enemy[] = [];

  constructor() {
    super({ key: 'DemoScene' });
  }

  create(): void {
    // Instructions
    this.add.text(10, 10, 'Arrow keys to move\nSpace to damage nearest enemy', {
      fontSize: '16px',
      color: '#ffffff',
    });

    // Create player at center
    this.player = new Player(this, 400, 300);
    this.add.existing(this.player);

    // Create patrol enemies
    const enemy1 = new Enemy(this, 100, 100, [
      { x: 100, y: 100 },
      { x: 300, y: 100 },
      { x: 300, y: 200 },
      { x: 100, y: 200 },
    ]);
    this.add.existing(enemy1);
    this.enemies.push(enemy1);

    const enemy2 = new Enemy(this, 600, 400, [
      { x: 600, y: 400 },
      { x: 700, y: 500 },
      { x: 500, y: 500 },
    ]);
    this.add.existing(enemy2);
    this.enemies.push(enemy2);

    // Space key to damage nearest enemy
    this.input.keyboard!.on('keydown-SPACE', () => {
      this.damageNearestEnemy();
    });
  }

  private damageNearestEnemy(): void {
    let nearest: Enemy | null = null;
    let minDist = Infinity;

    for (const enemy of this.enemies) {
      if (!enemy.active) continue;
      const dist = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        enemy.x, enemy.y
      );
      if (dist < minDist) {
        minDist = dist;
        nearest = enemy;
      }
    }

    if (nearest && minDist < 150) {
      const health = nearest.getComponent(HealthComponent);
      if (health) {
        health.takeDamage(25);
      }
    }
  }
}
```

### Step 4: Create Entry Point

`src/demo/game-config.ts`:

```typescript
import Phaser from 'phaser';
import { DemoScene } from './scenes/demo-scene';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2c3e50',
  scene: [DemoScene],
};
```

`src/demo/main.ts`:

```typescript
import Phaser from 'phaser';
import { gameConfig } from './game-config';

console.log('Phaser Component System Demo');
new Phaser.Game(gameConfig);
```

### Step 5: Validate

Run `npm run dev` and verify:
1. Player moves with arrow keys
2. Enemies patrol their points
3. Space damages nearest enemy (within range)
4. Enemies destroyed when HP reaches 0
5. Console shows component lifecycle logs
6. No errors in console

## Todo List

- [ ] Create movement.ts component
- [ ] Create patrol.ts component
- [ ] Create health.ts component
- [ ] Create player.ts GameObject
- [ ] Create enemy.ts GameObject
- [ ] Create demo-scene.ts
- [ ] Create game-config.ts
- [ ] Update main.ts
- [ ] Test player movement
- [ ] Test enemy patrol
- [ ] Test damage + destroy
- [ ] Verify no memory leaks

## Success Criteria

- Player moves smoothly at 60fps
- Enemies patrol continuously
- Space key damages enemies in range
- Dead enemies properly destroyed
- Console shows all lifecycle events
- No TypeScript errors
- No runtime errors

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Texture generation issues | Low | Use simple graphics, fallback to colors |
| Keyboard not captured | Low | Focus canvas on click |

## Next Steps

- Documentation for library usage
- Publish as npm package (optional)
- Add more component examples
