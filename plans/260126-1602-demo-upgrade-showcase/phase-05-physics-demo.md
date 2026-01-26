# Phase 5: Physics Demo

## Context
- Parent: [plan.md](plan.md)
- Depends: Phase 1 (physics enabled)
- Uses: Collider, RigidBody, ObjectPool

## Overview
| Field | Value |
|-------|-------|
| Priority | P1 |
| Status | Pending |
| Est | 2h |

Physics scene with bouncing objects demonstrating Collider, RigidBody, and pooling.

## Key Insights
- Collider supports box and circle shapes
- RigidBody handles velocity, mass, drag, bounce
- ObjectPool prevents GC pauses for spawned objects
- Physics debug can show collider bounds

## Requirements
- Spawn balls on click (pooled)
- Balls bounce off walls and each other
- Show pool stats (active/available)
- Toggle physics debug visualization

## Architecture
```
PhysicsScene
├── Walls (static colliders)
├── BallPool (ObjectPool<PhysicsBall>)
├── SpawnArea (click to spawn)
└── StatsPanel (pool count, physics info)
```

## Related Files
- `scenes/physics-scene.ts` - Create
- `prefabs/physics-ball.ts` - Create

## Implementation Steps

### 1. Create physics-ball.ts prefab
```typescript
import Phaser from 'phaser';
import { GameObject, Collider, RigidBody } from '@pge/core';
import { COLORS } from '../constants';

export class PhysicsBall extends GameObject {
  private gfx!: Phaser.GameObjects.Arc;
  private rigidBody!: RigidBody;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'PhysicsBall');

    const radius = 15 + Math.random() * 10;
    const color = Phaser.Display.Color.RandomRGB().color;

    this.gfx = scene.add.circle(0, 0, radius, color);
    this.add(this.gfx);

    // Add physics components
    this.addComponent(new Collider({
      shape: 'circle',
      radius,
      onCollide: (other) => {
        // Flash on collision
        this.gfx.setFillStyle(0xffffff);
        scene.time.delayedCall(50, () => this.gfx.setFillStyle(color));
      }
    }));

    this.rigidBody = this.addComponent(new RigidBody({
      mass: radius / 10,
      bounce: 0.8,
      drag: 0.01,
    }));
  }

  launch(vx: number, vy: number): void {
    this.rigidBody.setVelocity(vx, vy);
  }

  reset(): void {
    this.rigidBody.setVelocity(0, 0);
    this.setPosition(0, 0);
    this.setActive(false);
    this.setVisible(false);
  }
}
```

### 2. Create physics-scene.ts
```typescript
import Phaser from 'phaser';
import {
  SceneManager, DebugOverlay, Logger, ObjectPool
} from '@pge/core';
import { SCENES, COLORS } from '../constants';
import { PhysicsBall } from '../prefabs/physics-ball';
import { UIButton } from '../prefabs/ui-button';

export class PhysicsScene extends Phaser.Scene {
  private ballPool!: ObjectPool<PhysicsBall>;
  private activeBalls: PhysicsBall[] = [];
  private statsText!: Phaser.GameObjects.Text;
  private logger = new Logger('Physics');

  constructor() {
    super({ key: SCENES.PHYSICS });
  }

  create(): void {
    new DebugOverlay(this);
    const sceneManager = new SceneManager(this);

    // Title
    this.add.text(400, 30, '⚽ Physics Demo', {
      fontSize: '28px', color: '#fff'
    }).setOrigin(0.5);

    // Back button
    new UIButton(this, 70, 30, '← Back', () => {
      sceneManager.goto(SCENES.MENU, { transition: 'scale' });
    });

    // Create walls
    this.createWalls();

    // Initialize object pool
    this.ballPool = new ObjectPool<PhysicsBall>(
      () => this.createBall(),
      (ball) => ball.reset(),
      20 // max pool size
    );

    // Click to spawn
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.y > 80) { // Not on UI
        this.spawnBall(pointer.x, pointer.y);
      }
    });

    // Instructions
    this.add.text(400, 80, 'Click to spawn balls | R to reset | D for debug', {
      fontSize: '14px', color: '#aaa'
    }).setOrigin(0.5);

    // Stats display
    this.statsText = this.add.text(10, 560, '', {
      fontSize: '12px', color: '#666'
    });

    // Key handlers
    this.input.keyboard!.on('keydown-R', () => this.resetBalls());
    this.input.keyboard!.on('keydown-D', () => this.togglePhysicsDebug());

    this.logger.info('Physics scene loaded');
    this.updateStats();
  }

  private createWalls(): void {
    const { width, height } = this.scale;
    const wallThickness = 20;

    // Create static wall bodies
    const walls = [
      { x: width/2, y: height - wallThickness/2, w: width, h: wallThickness }, // bottom
      { x: width/2, y: 100 + wallThickness/2, w: width, h: wallThickness },    // top
      { x: wallThickness/2, y: height/2, w: wallThickness, h: height },        // left
      { x: width - wallThickness/2, y: height/2, w: wallThickness, h: height }, // right
    ];

    walls.forEach(wall => {
      const rect = this.add.rectangle(wall.x, wall.y, wall.w, wall.h, COLORS.primary);
      this.physics.add.existing(rect, true); // static body
    });
  }

  private createBall(): PhysicsBall {
    const ball = new PhysicsBall(this, 0, 0);
    this.add.existing(ball);
    return ball;
  }

  private spawnBall(x: number, y: number): void {
    if (this.activeBalls.length >= 30) {
      this.logger.warn('Max balls reached');
      return;
    }

    const ball = this.ballPool.acquire();
    ball.setPosition(x, y);
    ball.setActive(true);
    ball.setVisible(true);

    // Random velocity
    const vx = (Math.random() - 0.5) * 400;
    const vy = (Math.random() - 0.5) * 400;
    ball.launch(vx, vy);

    this.activeBalls.push(ball);
    this.logger.debug(`Spawned ball at ${x},${y}`);
    this.updateStats();
  }

  private resetBalls(): void {
    this.activeBalls.forEach(ball => {
      this.ballPool.release(ball);
    });
    this.activeBalls = [];
    this.logger.info('Balls reset');
    this.updateStats();
  }

  private togglePhysicsDebug(): void {
    this.physics.world.debugGraphic?.setVisible(
      !this.physics.world.debugGraphic?.visible
    );
    this.logger.info('Physics debug toggled');
  }

  private updateStats(): void {
    const pooled = this.ballPool['pool'].length;
    const active = this.activeBalls.length;
    this.statsText.setText(
      `Active: ${active} | Pooled: ${pooled} | Max: 30`
    );
  }

  update(): void {
    // Clean up destroyed balls
    this.activeBalls = this.activeBalls.filter(b => b.active);
    this.updateStats();
  }
}
```

## Todo
- [ ] Create physics-ball.ts prefab with Collider + RigidBody
- [ ] Create physics-scene.ts with walls and spawning
- [ ] Implement ObjectPool for ball recycling
- [ ] Add physics debug toggle
- [ ] Display pool statistics

## Success Criteria
- Balls spawn on click
- Balls bounce off walls
- Pool reuses ball instances
- D key toggles physics debug
- R key resets all balls

## Risk Assessment
- Medium: Phaser Arcade Physics integration with Components
- May need to use Phaser physics directly instead of RigidBody component

## Next Steps
→ Phase 6: Polish & Integration
