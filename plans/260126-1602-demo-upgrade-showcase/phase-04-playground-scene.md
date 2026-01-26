# Phase 4: Playground Scene

## Context
- Parent: [plan.md](plan.md)
- Depends: Phase 2
- Uses: Transform, SpriteRenderer, Animator, InputManager, AudioManager

## Overview
| Field | Value |
|-------|-------|
| Priority | P1 |
| Status | Pending |
| Est | 2h |

Interactive playground showcasing components, input, and audio.

## Key Insights
- Transform supports parent-child hierarchy with local/world coords
- Animator has state machine with transitions
- InputManager supports keyboard + gamepad
- AudioManager handles music + SFX with volume control

## Requirements
- Transform hierarchy demo (parent rotates, children follow)
- Animator state machine (idle → walk → run transitions)
- InputManager keyboard bindings
- AudioManager SFX on interactions
- Settings panel for volume/controls

## Architecture
```
PlaygroundScene
├── HierarchyDemo (parent + 2 children orbiting)
├── AnimatorDemo (state machine with visual feedback)
├── InputDisplay (shows pressed keys/actions)
└── AudioControls (volume slider, test buttons)
```

## Related Files
- `scenes/playground-scene.ts` - Create

## Implementation Steps

### 1. Create playground-scene.ts
```typescript
import Phaser from 'phaser';
import {
  GameObject, Transform, SpriteRenderer,
  SceneManager, DebugOverlay, Logger,
  InputManager, AudioManager, StorageManager
} from '@pge/core';
import { SCENES, COLORS } from '../constants';
import { UIButton } from '../prefabs/ui-button';

export class PlaygroundScene extends Phaser.Scene {
  private inputManager!: InputManager;
  private audioManager!: AudioManager;
  private storageManager!: StorageManager;
  private logger = new Logger('Playground');

  private parentObj!: GameObject;
  private inputDisplay!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: SCENES.PLAYGROUND });
  }

  create(): void {
    new DebugOverlay(this);
    const sceneManager = new SceneManager(this);

    // Initialize managers
    this.inputManager = new InputManager(this);
    this.audioManager = new AudioManager(this);
    this.storageManager = new StorageManager('pge-demo');

    // Title
    this.add.text(400, 30, '🎮 Playground', {
      fontSize: '28px', color: '#fff'
    }).setOrigin(0.5);

    // Back button
    new UIButton(this, 70, 30, '← Back', () => {
      sceneManager.goto(SCENES.MENU, { transition: 'fade' });
    });

    this.createHierarchyDemo();
    this.createInputDemo();
    this.createAudioDemo();

    this.logger.info('Playground loaded');
  }

  private createHierarchyDemo(): void {
    // Section title
    this.add.text(150, 100, 'Transform Hierarchy', {
      fontSize: '16px', color: '#aaa'
    }).setOrigin(0.5);

    // Parent object (center)
    this.parentObj = new GameObject(this, 150, 220, 'Parent');
    const parentGfx = this.add.rectangle(0, 0, 30, 30, COLORS.accent);
    this.parentObj.add(parentGfx);
    this.add.existing(this.parentObj);

    // Child 1 (orbiting)
    const child1 = new GameObject(this, 60, 0, 'Child1');
    const child1Gfx = this.add.rectangle(0, 0, 15, 15, 0x00ff00);
    child1.add(child1Gfx);
    this.parentObj.add(child1);

    // Child 2 (opposite side)
    const child2 = new GameObject(this, -60, 0, 'Child2');
    const child2Gfx = this.add.rectangle(0, 0, 15, 15, 0x0088ff);
    child2.add(child2Gfx);
    this.parentObj.add(child2);

    this.add.text(150, 320, 'Parent rotates,\nchildren follow', {
      fontSize: '12px', color: '#666', align: 'center'
    }).setOrigin(0.5);
  }

  private createInputDemo(): void {
    // Section title
    this.add.text(400, 100, 'Input Manager', {
      fontSize: '16px', color: '#aaa'
    }).setOrigin(0.5);

    // Register input bindings
    this.inputManager.bind('move_up', [Phaser.Input.Keyboard.KeyCodes.W, Phaser.Input.Keyboard.KeyCodes.UP]);
    this.inputManager.bind('move_down', [Phaser.Input.Keyboard.KeyCodes.S, Phaser.Input.Keyboard.KeyCodes.DOWN]);
    this.inputManager.bind('move_left', [Phaser.Input.Keyboard.KeyCodes.A, Phaser.Input.Keyboard.KeyCodes.LEFT]);
    this.inputManager.bind('move_right', [Phaser.Input.Keyboard.KeyCodes.D, Phaser.Input.Keyboard.KeyCodes.RIGHT]);
    this.inputManager.bind('action', [Phaser.Input.Keyboard.KeyCodes.SPACE]);

    // Display
    this.inputDisplay = this.add.text(400, 220, 'Press WASD/Arrows/Space', {
      fontSize: '14px', color: '#fff', align: 'center'
    }).setOrigin(0.5);

    this.add.text(400, 320, 'Actions bound:\nmove_up/down/left/right, action', {
      fontSize: '12px', color: '#666', align: 'center'
    }).setOrigin(0.5);
  }

  private createAudioDemo(): void {
    // Section title
    this.add.text(650, 100, 'Audio Manager', {
      fontSize: '16px', color: '#aaa'
    }).setOrigin(0.5);

    // Volume display
    const volumeText = this.add.text(650, 180, `SFX Vol: ${Math.round(this.audioManager.sfxVolume * 100)}%`, {
      fontSize: '14px', color: '#fff'
    }).setOrigin(0.5);

    // Volume controls
    this.add.text(650, 220, '[ - ]  Volume  [ + ]', {
      fontSize: '12px', color: '#888'
    }).setOrigin(0.5);

    // Key handlers for volume
    this.input.keyboard!.on('keydown-MINUS', () => {
      this.audioManager.setSfxVolume(Math.max(0, this.audioManager.sfxVolume - 0.1));
      volumeText.setText(`SFX Vol: ${Math.round(this.audioManager.sfxVolume * 100)}%`);
      this.storageManager.set('sfxVolume', this.audioManager.sfxVolume);
    });

    this.input.keyboard!.on('keydown-PLUS', () => {
      this.audioManager.setSfxVolume(Math.min(1, this.audioManager.sfxVolume + 0.1));
      volumeText.setText(`SFX Vol: ${Math.round(this.audioManager.sfxVolume * 100)}%`);
      this.storageManager.set('sfxVolume', this.audioManager.sfxVolume);
    });

    // Load saved volume
    const savedVol = this.storageManager.get<number>('sfxVolume');
    if (savedVol !== null) {
      this.audioManager.setSfxVolume(savedVol);
      volumeText.setText(`SFX Vol: ${Math.round(savedVol * 100)}%`);
    }

    this.add.text(650, 280, 'StorageManager saves\nvolume preference', {
      fontSize: '12px', color: '#666', align: 'center'
    }).setOrigin(0.5);
  }

  update(_time: number, _delta: number): void {
    // Rotate parent (children follow)
    this.parentObj.rotation += 0.02;

    // Update input display
    const actions: string[] = [];
    if (this.inputManager.isDown('move_up')) actions.push('↑');
    if (this.inputManager.isDown('move_down')) actions.push('↓');
    if (this.inputManager.isDown('move_left')) actions.push('←');
    if (this.inputManager.isDown('move_right')) actions.push('→');
    if (this.inputManager.isDown('action')) actions.push('ACTION');

    this.inputDisplay.setText(actions.length > 0 ? actions.join(' ') : 'Press WASD/Arrows/Space');

    // Update input manager
    this.inputManager.update();
  }
}
```

## Todo
- [ ] Create playground-scene.ts
- [ ] Implement hierarchy demo with rotating parent
- [ ] Implement input bindings and display
- [ ] Implement audio volume controls
- [ ] Integrate StorageManager for persistence

## Success Criteria
- Parent rotates, children orbit correctly
- Input display shows active keys
- Volume adjusts with +/- keys
- Volume persists via StorageManager

## Risk Assessment
- Low: Standard component usage
- Note: No actual audio files (visual feedback only)

## Next Steps
→ Phase 5: Physics Demo
