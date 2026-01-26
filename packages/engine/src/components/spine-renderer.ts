import EventEmitter from 'eventemitter3';
import { Component } from '../game-objects/component';
import type { SpineConfig, SpineEvents, AnimationMix } from '../types/spine.types';
import type {
  SpineGameObject,
  SpineScene,
  SpineAnimationStateListener,
  SpineTrackEntry,
  SpineEvent as SpineEventData,
} from '../types/spine-plugin.types';

/**
 * Component for Spine skeletal animations.
 * Requires SpinePlugin to be loaded in Phaser game config.
 *
 * @example
 * // In preload:
 * this.load.spine('hero', 'hero.json', 'hero.atlas');
 *
 * // In create:
 * const spine = player.addComponent(new SpineRenderer({
 *   skeletonKey: 'hero',
 *   atlasKey: 'hero',
 *   initialAnimation: 'idle',
 *   loop: true
 * }));
 *
 * spine.play('run');
 * spine.events.on('complete', (_, anim) => console.log('Done:', anim));
 *
 * @note Requires SpinePlugin. Install: npm install @esotericsoftware/spine-phaser
 * @see http://en.esotericsoftware.com/spine-phaser
 */
export class SpineRenderer extends Component {
  private spineObject: SpineGameObject | null = null;
  private config: SpineConfig;
  private mixConfig: AnimationMix[] = [];
  private listener: SpineAnimationStateListener | null = null;

  /** Event emitter for Spine events */
  readonly events = new EventEmitter<SpineEvents>();

  /** Current animation name */
  private currentAnimation: string | null = null;

  priority = 0; // Render priority

  constructor(config: SpineConfig) {
    super();
    this.config = config;
  }

  onAttach(): void {
    this.createSpineObject();
  }

  private createSpineObject(): void {
    const spineScene = this.scene as SpineScene;

    if (!spineScene.spine) {
      console.error('SpinePlugin not loaded. Add SpinePlugin to game config.');
      return;
    }

    try {
      // Create spine game object
      this.spineObject = spineScene.spine.add.spine(
        0,
        0,
        this.config.skeletonKey,
        this.config.atlasKey
      );

      if (this.config.scale) {
        this.spineObject.setScale(this.config.scale);
      }

      // Set initial skin
      if (this.config.skin) {
        this.setSkin(this.config.skin);
      }

      // Apply mix configurations
      this.applyMixConfig();

      // Play initial animation
      if (this.config.initialAnimation) {
        this.play(this.config.initialAnimation, this.config.loop ?? true);
      }

      // Setup event listeners
      this.setupEventListeners();

      // Add to owner container
      this.owner.add(this.spineObject as unknown as Phaser.GameObjects.GameObject);
    } catch (error) {
      console.error('Failed to create Spine object:', error);
    }
  }

  private setupEventListeners(): void {
    if (!this.spineObject?.state) return;

    this.listener = {
      start: (entry: SpineTrackEntry) => {
        this.events.emit('start', entry.trackIndex, entry.animation.name);
      },
      complete: (entry: SpineTrackEntry) => {
        this.events.emit('complete', entry.trackIndex, entry.animation.name);
      },
      event: (entry: SpineTrackEntry, event: SpineEventData) => {
        this.events.emit('event', entry.trackIndex, {
          name: event.data.name,
          intValue: event.intValue,
          floatValue: event.floatValue,
          stringValue: event.stringValue,
        });
      },
      interrupt: (entry: SpineTrackEntry) => {
        this.events.emit('interrupt', entry.trackIndex);
      },
    };

    this.spineObject.state.addListener(this.listener);
  }

  private applyMixConfig(): void {
    if (!this.spineObject?.stateData) return;

    for (const mix of this.mixConfig) {
      this.spineObject.stateData.setMix(mix.from, mix.to, mix.duration);
    }
  }

  /**
   * Play animation.
   * @param name Animation name
   * @param loop Whether to loop
   * @param track Track index (default 0)
   */
  play(name: string, loop = false, track = 0): void {
    if (!this.spineObject?.state) return;

    this.spineObject.state.setAnimation(track, name, loop);
    this.currentAnimation = name;
  }

  /**
   * Queue animation to play after current finishes.
   */
  queue(name: string, loop = false, track = 0, delay = 0): void {
    if (!this.spineObject?.state) return;

    this.spineObject.state.addAnimation(track, name, loop, delay);
  }

  /**
   * Set empty animation (fade out).
   */
  setEmpty(track = 0, mixDuration = 0.2): void {
    if (!this.spineObject?.state) return;

    this.spineObject.state.setEmptyAnimation(track, mixDuration);
    this.currentAnimation = null;
  }

  /**
   * Stop animation on track.
   */
  stop(track = 0): void {
    if (!this.spineObject?.state) return;

    this.spineObject.state.clearTrack(track);
    this.currentAnimation = null;
  }

  /**
   * Set mix duration between animations.
   */
  setMix(from: string, to: string, duration: number): void {
    this.mixConfig.push({ from, to, duration });
    if (this.spineObject?.stateData) {
      this.spineObject.stateData.setMix(from, to, duration);
    }
  }

  /**
   * Change skin.
   */
  setSkin(skinName: string): void {
    if (!this.spineObject?.skeleton) return;

    this.spineObject.skeleton.setSkinByName(skinName);
    this.spineObject.skeleton.setSlotsToSetupPose();
  }

  /**
   * Get current animation name.
   */
  get current(): string | null {
    return this.currentAnimation;
  }

  /**
   * Get animation time scale.
   */
  get timeScale(): number {
    return this.spineObject?.state?.timeScale ?? 1;
  }

  /**
   * Set animation time scale.
   */
  set timeScale(value: number) {
    if (this.spineObject?.state) {
      this.spineObject.state.timeScale = value;
    }
  }

  /**
   * Get underlying Spine game object.
   */
  getSpineObject(): SpineGameObject | null {
    return this.spineObject;
  }

  /**
   * Set tint color.
   */
  setTint(color: number): void {
    this.spineObject?.setTint(color);
  }

  /**
   * Set alpha.
   */
  set alpha(value: number) {
    if (this.spineObject) {
      this.spineObject.setAlpha(value);
    }
  }

  get alpha(): number {
    return this.spineObject?.alpha ?? 1;
  }

  onDetach(): void {
    if (this.spineObject) {
      if (this.listener) {
        this.spineObject.state?.removeListener(this.listener);
      }
      this.spineObject.destroy();
      this.spineObject = null;
    }
    this.events.removeAllListeners();
  }
}
