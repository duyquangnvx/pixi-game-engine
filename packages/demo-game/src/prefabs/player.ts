import Phaser from 'phaser';
import { GameObject } from '@pge/core';
import { MovementComponent } from '../components/movement';
import { HealthComponent } from '../components/health';

export class Player extends GameObject {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, { name: 'Player' });

    // Create visual (blue rectangle) - only generate texture once
    if (!scene.textures.exists('player_tex')) {
      const graphics = scene.add.graphics();
      graphics.fillStyle(0x3498db);
      graphics.fillRect(-20, -20, 40, 40);
      graphics.generateTexture('player_tex', 40, 40);
      graphics.destroy();
    }
    const sprite = scene.add.sprite(0, 0, 'player_tex');
    this.add(sprite);

    // Add components
    this.addComponent(new MovementComponent(200));
    this.addComponent(new HealthComponent(100));
  }
}
