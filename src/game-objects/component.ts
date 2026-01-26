import type { GameObject } from './game-object';

/**
 * Base class for attachable behaviors.
 * Extend this to create custom components.
 */
export abstract class Component {
  /** Reference to owner GameObject (set on attach) */
  owner!: GameObject;

  /** Whether component receives updates */
  enabled = true;

  /**
   * Called when component is attached to GameObject.
   * Override for initialization logic.
   */
  onAttach(): void {}

  /**
   * Called when component is detached from GameObject.
   * Override for cleanup logic.
   */
  onDetach(): void {}

  /**
   * Called every frame when enabled.
   * @param dt Delta time in milliseconds
   */
  update?(dt: number): void;

  /** Convenience: get scene from owner */
  get scene(): Phaser.Scene {
    return this.owner.scene;
  }
}
