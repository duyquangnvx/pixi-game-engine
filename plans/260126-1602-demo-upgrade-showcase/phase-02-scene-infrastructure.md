# Phase 2: Scene Infrastructure

## Context
- Parent: [plan.md](plan.md)
- Depends: Phase 1
- Uses: BaseScene, SceneManager, LoadingScene, Transitions

## Overview
| Field | Value |
|-------|-------|
| Priority | P0 |
| Status | Pending |
| Est | 2h |

Create scene navigation with loading, menu, and transitions.

## Key Insights
- Engine has LoadingScene template
- SceneManager provides goto/push/pop with transitions
- Transitions: fade, slide, scale, rotate, none

## Requirements
- Loading scene with progress bar
- Menu with buttons for each demo scene
- Scene transitions (fade default, options for others)
- Back button in each scene → Menu

## Architecture
```
LoadingScene (boot)
    ↓ (fade)
MenuScene
    ├── "Pixel Art" → PixelArtScene (slide)
    ├── "Playground" → PlaygroundScene (fade)
    └── "Physics" → PhysicsScene (scale)
```

## Related Files
- `scenes/loading-scene.ts` - Create
- `scenes/menu-scene.ts` - Create
- `prefabs/ui-button.ts` - Create

## Implementation Steps

### 1. Create loading-scene.ts
```typescript
import { BaseScene, DebugOverlay, Logger } from '@pge/core';
import { SCENES, COLORS } from '../constants';

export class LoadingScene extends BaseScene {
  private progressBar!: Phaser.GameObjects.Graphics;
  private logger = new Logger('Loading');

  constructor() {
    super({ key: SCENES.LOADING });
  }

  preload(): void {
    this.createProgressBar();
    this.logger.info('Loading assets...');

    // Simulate asset loading (no external assets needed)
    this.load.on('progress', (value: number) => {
      this.updateProgress(value);
    });
  }

  create(): void {
    this.logger.info('Assets loaded');
    // Add debug overlay (F3 toggle)
    new DebugOverlay(this);

    this.time.delayedCall(500, () => {
      this.scene.start(SCENES.MENU);
    });
  }

  private createProgressBar(): void {
    const { width, height } = this.scale;
    const barW = 400, barH = 20;
    const x = (width - barW) / 2;
    const y = height / 2;

    // Background
    this.add.rectangle(width/2, y, barW, barH, COLORS.primary);

    // Progress
    this.progressBar = this.add.graphics();
    this.updateProgress(0);

    this.add.text(width/2, y - 40, 'PGE Demo', {
      fontSize: '32px', color: '#fff'
    }).setOrigin(0.5);
  }

  private updateProgress(value: number): void {
    this.progressBar.clear();
    this.progressBar.fillStyle(COLORS.accent);
    this.progressBar.fillRect(200, 290, 400 * value, 20);
  }
}
```

### 2. Create menu-scene.ts
```typescript
import Phaser from 'phaser';
import { SceneManager, DebugOverlay, StorageManager } from '@pge/core';
import { SCENES, COLORS } from '../constants';
import { UIButton } from '../prefabs/ui-button';

export class MenuScene extends Phaser.Scene {
  private sceneManager!: SceneManager;

  constructor() {
    super({ key: SCENES.MENU });
  }

  create(): void {
    this.sceneManager = new SceneManager(this);
    new DebugOverlay(this);

    // Title
    this.add.text(400, 80, 'PGE Feature Showcase', {
      fontSize: '36px', color: '#fff'
    }).setOrigin(0.5);

    this.add.text(400, 120, 'Press F3 for debug overlay', {
      fontSize: '14px', color: '#888'
    }).setOrigin(0.5);

    // Menu buttons
    const buttons = [
      { label: '🎨 Pixel Art Demo', scene: SCENES.PIXEL_ART, transition: 'slide' },
      { label: '🎮 Playground', scene: SCENES.PLAYGROUND, transition: 'fade' },
      { label: '⚽ Physics Demo', scene: SCENES.PHYSICS, transition: 'scale' },
    ];

    buttons.forEach((btn, i) => {
      new UIButton(this, 400, 220 + i * 80, btn.label, () => {
        this.sceneManager.goto(btn.scene, { transition: btn.transition as any });
      });
    });

    // Feature list
    this.add.text(400, 500, 'Engine Features: Components, Scenes, Physics,\nInput, Audio, Storage, Debug, Pixel-Art', {
      fontSize: '14px', color: '#666', align: 'center'
    }).setOrigin(0.5);
  }
}
```

### 3. Create prefabs/ui-button.ts
```typescript
import Phaser from 'phaser';
import { COLORS } from '../constants';

export class UIButton extends Phaser.GameObjects.Container {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    label: string,
    onClick: () => void
  ) {
    super(scene, x, y);

    const bg = scene.add.rectangle(0, 0, 280, 50, COLORS.primary)
      .setInteractive({ useHandCursor: true });

    const text = scene.add.text(0, 0, label, {
      fontSize: '20px', color: '#fff'
    }).setOrigin(0.5);

    this.add([bg, text]);
    scene.add.existing(this);

    bg.on('pointerover', () => bg.setFillStyle(COLORS.accent));
    bg.on('pointerout', () => bg.setFillStyle(COLORS.primary));
    bg.on('pointerdown', onClick);
  }
}
```

## Todo
- [ ] Create loading-scene.ts with progress bar
- [ ] Create menu-scene.ts with navigation
- [ ] Create ui-button.ts prefab
- [ ] Test scene transitions

## Success Criteria
- Loading screen shows progress
- Menu displays 3 demo options
- Scene transitions work (fade/slide/scale)
- F3 toggles debug overlay

## Risk Assessment
- Medium: SceneManager API usage

## Next Steps
→ Phase 3: Pixel-Art Showcase (PRIORITY)
