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
    this.input.keyboard?.on('keydown-SPACE', () => {
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
