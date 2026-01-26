import Phaser from 'phaser';
import EventEmitter from 'eventemitter3';
import { Component } from '../game-objects/component';
import type { GameObject } from '../game-objects/game-object';

/**
 * Collider shape type.
 */
export type ColliderShape = 'box' | 'circle';

/**
 * Events emitted by Collider.
 */
export interface ColliderEvents {
  /** Fired on collision start */
  collisionEnter: (other: GameObject) => void;
  /** Fired while colliding */
  collisionStay: (other: GameObject) => void;
  /** Fired on overlap (trigger mode) */
  triggerEnter: (other: GameObject) => void;
}

/**
 * Configuration for Collider component.
 */
export interface ColliderConfig {
  /** Shape type */
  shape?: ColliderShape;
  /** Width for box, diameter for circle */
  width?: number;
  /** Height for box */
  height?: number;
  /** Offset from owner position */
  offset?: { x: number; y: number };
  /** Trigger mode (no physics response) */
  isTrigger?: boolean;
}

/**
 * Component wrapping Arcade Physics body.
 *
 * @example
 * const collider = player.addComponent(new Collider({ width: 32, height: 48 }));
 * collider.events.on('collisionEnter', (other) => console.log('Hit!', other));
 */
export class Collider extends Component {
  private body: Phaser.Physics.Arcade.Body | null = null;
  private config: Required<ColliderConfig>;
  private debugGraphics: Phaser.GameObjects.Graphics | null = null;

  /** Event emitter for collision events */
  readonly events = new EventEmitter<ColliderEvents>();

  /** Collision groups/layers for filtering */
  collisionGroup = 0;
  collisionMask = 0xffffffff;

  priority = 90; // High priority - before most logic

  constructor(config: ColliderConfig = {}) {
    super();
    this.config = {
      shape: config.shape ?? 'box',
      width: config.width ?? 32,
      height: config.height ?? 32,
      offset: config.offset ?? { x: 0, y: 0 },
      isTrigger: config.isTrigger ?? false,
    };
  }

  onAttach(): void {
    // Enable physics on owner
    this.scene.physics.add.existing(this.owner);
    this.body = this.owner.body as Phaser.Physics.Arcade.Body;

    if (!this.body) {
      console.warn(`Failed to create physics body for ${this.owner.id}`);
      return;
    }

    this.applyConfig();
  }

  private applyConfig(): void {
    if (!this.body) return;

    const { shape, width, height, offset, isTrigger } = this.config;

    if (shape === 'circle') {
      this.body.setCircle(width / 2, offset.x, offset.y);
    } else {
      this.body.setSize(width, height);
      this.body.setOffset(offset.x, offset.y);
    }

    // Triggers don't have physics response
    if (isTrigger) {
      this.body.setImmovable(true);
      // Overlap check handled by RigidBody or manual setup
    }
  }

  /** Get underlying Arcade Physics body */
  getBody(): Phaser.Physics.Arcade.Body | null {
    return this.body;
  }

  /** Update collider size */
  setSize(width: number, height?: number): void {
    this.config.width = width;
    this.config.height = height ?? width;
    if (this.body) {
      if (this.config.shape === 'circle') {
        this.body.setCircle(width / 2);
      } else {
        this.body.setSize(width, this.config.height);
      }
    }
  }

  /** Update collider offset */
  setOffset(x: number, y: number): void {
    this.config.offset = { x, y };
    this.body?.setOffset(x, y);
  }

  /** Enable/disable trigger mode */
  set isTrigger(value: boolean) {
    this.config.isTrigger = value;
    if (this.body) {
      this.body.setImmovable(value);
    }
  }

  get isTrigger(): boolean {
    return this.config.isTrigger;
  }

  /** Check if this collider can collide with another based on masks */
  canCollideWith(other: Collider): boolean {
    return (this.collisionMask & other.collisionGroup) !== 0 && (other.collisionMask & this.collisionGroup) !== 0;
  }

  /** Show debug visualization */
  showDebug(show: boolean): void {
    if (show && !this.debugGraphics) {
      this.debugGraphics = this.scene.add.graphics();
      this.debugGraphics.lineStyle(1, 0x00ff00, 1);
    } else if (!show && this.debugGraphics) {
      this.debugGraphics.destroy();
      this.debugGraphics = null;
    }
  }

  lateUpdate(): void {
    // Update debug visualization
    if (this.debugGraphics && this.body) {
      this.debugGraphics.clear();
      this.debugGraphics.lineStyle(1, 0x00ff00, 0.8);

      if (this.config.shape === 'circle') {
        this.debugGraphics.strokeCircle(this.body.center.x, this.body.center.y, this.config.width / 2);
      } else {
        this.debugGraphics.strokeRect(this.body.x, this.body.y, this.body.width, this.body.height);
      }
    }
  }

  onDetach(): void {
    if (this.debugGraphics) {
      this.debugGraphics.destroy();
      this.debugGraphics = null;
    }
    this.events.removeAllListeners();
    // Body cleanup handled by Phaser
  }
}
