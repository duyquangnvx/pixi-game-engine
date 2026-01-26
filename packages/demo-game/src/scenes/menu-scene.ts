import Phaser from 'phaser';
import { SceneManager, DebugOverlay } from '@pge/core';
import { SCENES } from '../constants';
import { UIButton } from '../prefabs/ui-button';

/**
 * Main menu with navigation to demo scenes
 */
export class MenuScene extends Phaser.Scene {
  private sceneManager!: SceneManager;

  constructor() {
    super({ key: SCENES.MENU });
  }

  create(): void {
    this.sceneManager = new SceneManager(this.game);
    new DebugOverlay(this);

    // Title
    this.add.text(400, 80, 'PGE Feature Showcase', {
      fontSize: '36px',
      color: '#fff',
    }).setOrigin(0.5);

    this.add.text(400, 120, 'Press F3 for debug overlay', {
      fontSize: '14px',
      color: '#888',
    }).setOrigin(0.5);

    // Menu buttons
    const buttons = [
      { label: 'Pixel Art Demo', scene: SCENES.PIXEL_ART, transition: 'slide-left' as const },
      { label: 'Playground', scene: SCENES.PLAYGROUND, transition: 'fade' as const },
    ];

    buttons.forEach((btn, i) => {
      new UIButton(this, 400, 220 + i * 80, btn.label, () => {
        this.sceneManager.goto(btn.scene, {}, btn.transition);
      });
    });

    // Feature list
    this.add.text(400, 480, [
      'Engine Features Demonstrated:',
      'PixelRenderer, PixelArtBuilder, Palette Swap, Transitions',
      'InputManager, AudioManager, StorageManager',
      'DebugOverlay, Logger, GameObject, Components',
    ].join('\n'), {
      fontSize: '12px',
      color: '#666',
      align: 'center',
    }).setOrigin(0.5);
  }
}
