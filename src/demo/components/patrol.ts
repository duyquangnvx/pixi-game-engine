import Phaser from 'phaser';
import { Component } from '../../game-objects/component';

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
    const dist = Phaser.Math.Distance.Between(this.owner.x, this.owner.y, target.x, target.y);

    if (dist < 5) {
      this.currentIndex = (this.currentIndex + 1) % this.points.length;
      return;
    }

    const move = Math.min(this.speed * dt / 1000, dist);
    this.owner.x += ((target.x - this.owner.x) / dist) * move;
    this.owner.y += ((target.y - this.owner.y) / dist) * move;
  }
}
