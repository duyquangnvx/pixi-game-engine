import { Component } from '../../game-objects/component';

/**
 * Keyboard-controlled movement component.
 */
export class MovementComponent extends Component {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor(public speed = 200) {
    super();
  }

  onAttach(): void {
    if (!this.scene.input.keyboard) {
      console.warn(`[MovementComponent] Keyboard not available for ${this.owner.id}`);
      this.enabled = false;
      return;
    }
    this.cursors = this.scene.input.keyboard.createCursorKeys();
    console.log(`[MovementComponent] Attached to ${this.owner.id}`);
  }

  onDetach(): void {
    console.log(`[MovementComponent] Detached from ${this.owner.id}`);
  }

  update(dt: number): void {
    let vx = 0, vy = 0;

    if (this.cursors.left.isDown) vx = -1;
    else if (this.cursors.right.isDown) vx = 1;

    if (this.cursors.up.isDown) vy = -1;
    else if (this.cursors.down.isDown) vy = 1;

    // Normalize diagonal movement
    const len = Math.sqrt(vx * vx + vy * vy);
    if (len === 0) return;

    const dtSec = dt / 1000;
    const move = (this.speed * dtSec) / len;
    this.owner.x += vx * move;
    this.owner.y += vy * move;
  }
}
