import Phaser from 'phaser';
import { COLORS } from '../constants';

/**
 * Reusable UI button with hover effect
 */
export class UIButton extends Phaser.GameObjects.Container {
  private bg: Phaser.GameObjects.Rectangle;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    label: string,
    onClick: () => void,
    width = 280
  ) {
    super(scene, x, y);

    this.bg = scene.add.rectangle(0, 0, width, 50, COLORS.primary).setInteractive({ useHandCursor: true });

    const text = scene.add.text(0, 0, label, {
      fontSize: '20px',
      color: '#fff',
    }).setOrigin(0.5);

    this.add([this.bg, text]);
    scene.add.existing(this);

    this.bg.on('pointerover', () => this.bg.setFillStyle(COLORS.accent));
    this.bg.on('pointerout', () => this.bg.setFillStyle(COLORS.primary));
    this.bg.on('pointerdown', onClick);
  }
}
