import Phaser from 'phaser';
import { DebugOverlay, Logger } from '@pge/core';
import { SCENES, COLORS } from '../constants';

/**
 * Loading scene with progress bar
 */
export class LoadingScene extends Phaser.Scene {
  private progressBar!: Phaser.GameObjects.Graphics;

  constructor() {
    super({ key: SCENES.LOADING });
  }

  preload(): void {
    this.createProgressBar();
    Logger.info('Loading', 'Loading assets...');

    // Listen to load progress
    this.load.on('progress', (value: number) => {
      this.updateProgress(value);
    });

    // Simulate some loading time (no external assets needed)
    this.simulateLoading();
  }

  private simulateLoading(): void {
    // Create fake assets to trigger progress
    for (let i = 0; i < 10; i++) {
      this.load.image(`fake_${i}`, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
    }
  }

  create(): void {
    Logger.info('Loading', 'Assets loaded');
    new DebugOverlay(this);

    this.time.delayedCall(300, () => {
      this.scene.start(SCENES.MENU);
    });
  }

  private createProgressBar(): void {
    const { width, height } = this.scale;
    const barW = 400;
    const barH = 20;
    const y = height / 2;

    // Background bar
    this.add.rectangle(width / 2, y, barW, barH, COLORS.primary);

    // Progress bar
    this.progressBar = this.add.graphics();
    this.updateProgress(0);

    // Title
    this.add.text(width / 2, y - 50, 'PGE Demo', {
      fontSize: '36px',
      color: '#fff',
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(width / 2, y + 50, 'Loading...', {
      fontSize: '14px',
      color: '#888',
    }).setOrigin(0.5);
  }

  private updateProgress(value: number): void {
    this.progressBar.clear();
    this.progressBar.fillStyle(COLORS.accent);
    this.progressBar.fillRect(200, 290, 400 * value, 20);
  }
}
