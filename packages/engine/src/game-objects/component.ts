import type { GameObject } from './game-object';

/**
 * Base class for attachable behaviors.
 * Extend this to create custom components.
 *
 * @example
 * class Movement extends Component {
 *   priority = 10; // Higher priority runs first
 *
 *   onEnable() { console.log('Movement enabled'); }
 *   update(dt: number) { this.owner.x += this.speed * dt; }
 *   lateUpdate(dt: number) { // After all updates }
 * }
 */
export abstract class Component {
  /** Reference to owner GameObject (set on attach) */
  owner!: GameObject;

  private _enabled = true;

  /**
   * Update priority (higher = earlier execution).
   * Use for ordering: physics (100), movement (50), rendering (0).
   */
  priority = 0;

  /** Whether component receives updates */
  get enabled(): boolean {
    return this._enabled;
  }

  set enabled(value: boolean) {
    if (this._enabled === value) return;
    this._enabled = value;

    if (value) {
      this.onEnable();
    } else {
      this.onDisable();
    }
  }

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
   * Called when component.enabled becomes true.
   * Override for re-enable logic.
   */
  onEnable(): void {}

  /**
   * Called when component.enabled becomes false.
   * Override for disable logic (pause behaviors, etc).
   */
  onDisable(): void {}

  /**
   * Called every frame when enabled.
   * @param dt Delta time in milliseconds
   */
  update?(dt: number): void;

  /**
   * Called after all component updates complete.
   * Use for camera follow, constraint resolution, etc.
   * @param dt Delta time in milliseconds
   */
  lateUpdate?(dt: number): void;

  /** Convenience: get scene from owner */
  get scene(): Phaser.Scene {
    return this.owner.scene;
  }
}
