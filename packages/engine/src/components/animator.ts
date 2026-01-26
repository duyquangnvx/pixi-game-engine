import EventEmitter from 'eventemitter3';
import { Component } from '../game-objects/component';
import { SpriteRenderer } from './sprite-renderer';
import type { AnimationConfig, AnimationTransition, AnimatorEvents } from '../types/animation.types';

/**
 * Component for sprite animations with state machine.
 * Requires SpriteRenderer component on same GameObject.
 *
 * @example
 * const animator = player.addComponent(new Animator());
 * animator.addAnimation({ key: 'idle', textureKey: 'player', frames: [0,1,2,3], frameRate: 8 });
 * animator.addAnimation({ key: 'run', textureKey: 'player', frames: [4,5,6,7], frameRate: 12 });
 * animator.play('idle');
 */
export class Animator extends Component {
  private animations = new Map<string, AnimationConfig>();
  private transitions: AnimationTransition[] = [];
  private currentAnim: string | null = null;
  private spriteRenderer: SpriteRenderer | null = null;

  /** Event emitter for animation events */
  readonly events = new EventEmitter<AnimatorEvents>();

  priority = 5; // Run after most logic but before rendering

  onAttach(): void {
    this.spriteRenderer = this.owner.getComponent(SpriteRenderer);
    if (!this.spriteRenderer) {
      console.warn(`Animator requires SpriteRenderer on ${this.owner.id}`);
    }
  }

  /**
   * Register an animation.
   */
  addAnimation(config: AnimationConfig): void {
    this.animations.set(config.key, config);

    // Create Phaser animation if not exists
    const animKey = this.getAnimKey(config.key);
    if (!this.scene.anims.exists(animKey)) {
      const frameConfig = config.frames.map((f) =>
        typeof f === 'number' ? { key: config.textureKey, frame: f } : { key: config.textureKey, frame: f }
      );

      this.scene.anims.create({
        key: animKey,
        frames: frameConfig,
        frameRate: config.frameRate ?? 10,
        repeat: config.repeat ?? -1,
      });
    }
  }

  /**
   * Add multiple animations at once.
   */
  addAnimations(configs: AnimationConfig[]): void {
    for (const config of configs) {
      this.addAnimation(config);
    }
  }

  /**
   * Play animation by key.
   */
  play(key: string, ignoreIfPlaying = true): void {
    if (!this.animations.has(key)) {
      console.warn(`Animation "${key}" not found`);
      return;
    }

    if (ignoreIfPlaying && this.currentAnim === key) {
      return;
    }

    this.currentAnim = key;
    const sprite = this.spriteRenderer?.getSprite();
    if (!sprite) return;

    const animKey = this.getAnimKey(key);
    sprite.play(animKey);

    this.events.emit('animationStart', key);

    // Listen for complete event
    sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      this.events.emit('animationComplete', key);
    });
  }

  /**
   * Stop current animation.
   */
  stop(): void {
    const sprite = this.spriteRenderer?.getSprite();
    if (sprite) {
      sprite.stop();
    }
    this.currentAnim = null;
  }

  /**
   * Pause current animation.
   */
  pause(): void {
    const sprite = this.spriteRenderer?.getSprite();
    if (sprite?.anims) {
      sprite.anims.pause();
    }
  }

  /**
   * Resume paused animation.
   */
  resume(): void {
    const sprite = this.spriteRenderer?.getSprite();
    if (sprite?.anims) {
      sprite.anims.resume();
    }
  }

  /**
   * Get current animation key.
   */
  get current(): string | null {
    return this.currentAnim;
  }

  /**
   * Check if currently playing specific animation.
   */
  isPlaying(key: string): boolean {
    return this.currentAnim === key;
  }

  /**
   * Add state transition rule.
   */
  addTransition(from: string | '*', to: string, condition?: () => boolean): void {
    this.transitions.push({ from, to, condition });
  }

  /**
   * Evaluate transitions and auto-switch states.
   * Call this in update if using state machine.
   */
  evaluateTransitions(): void {
    for (const t of this.transitions) {
      if (t.from !== '*' && t.from !== this.currentAnim) continue;
      if (t.condition && !t.condition()) continue;

      this.play(t.to);
      break;
    }
  }

  /** Generate unique animation key scoped to this animator */
  private getAnimKey(key: string): string {
    return `${this.owner.id}_${key}`;
  }

  onDetach(): void {
    this.stop();
    this.events.removeAllListeners();
  }
}
