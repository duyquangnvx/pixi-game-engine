import Phaser from 'phaser';
import { GameObject } from '../../game-objects/game-object';
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

    // Create visual (red rectangle) - only generate texture once
    if (!scene.textures.exists('enemy_tex')) {
      const graphics = scene.add.graphics();
      graphics.fillStyle(0xe74c3c);
      graphics.fillRect(-15, -15, 30, 30);
      graphics.generateTexture('enemy_tex', 30, 30);
      graphics.destroy();
    }
    const sprite = scene.add.sprite(0, 0, 'enemy_tex');
    this.add(sprite);

    // Add components
    this.addComponent(new PatrolComponent(patrolPoints, 80));
    this.addComponent(new HealthComponent(50));
  }
}
