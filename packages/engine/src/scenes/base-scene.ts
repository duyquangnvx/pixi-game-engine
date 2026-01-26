import Phaser from 'phaser';
import { eventBus } from '../core/event-bus';
import type { AssetManifestItem, SceneData } from '../types/scene.types';
import type { SpineLoader } from '../types/spine-plugin.types';

/**
 * Base scene with standardized lifecycle and asset management.
 * Extend this for all game scenes.
 *
 * @example
 * class GameScene extends BaseScene {
 *   constructor() { super('GameScene'); }
 *
 *   getAssets() {
 *     return [{ key: 'player', type: 'image', url: 'player.png' }];
 *   }
 *
 *   onCreate(data) {
 *     // Scene setup after assets loaded
 *   }
 * }
 */
export abstract class BaseScene extends Phaser.Scene {
  /** Data passed from previous scene */
  protected sceneData: SceneData = {};

  /** Whether scene is currently paused */
  protected isPaused = false;

  constructor(key: string) {
    super({ key });
  }

  /**
   * Override to define assets to load for this scene.
   * Called before preload.
   */
  getAssets(): AssetManifestItem[] {
    return [];
  }

  /**
   * Phaser lifecycle: receives data from scene transition.
   */
  init(data?: SceneData): void {
    this.sceneData = data ?? {};
    this.onInit(data);
  }

  /**
   * Override for custom init logic.
   */
  protected onInit(_data?: SceneData): void { }

  /**
   * Phaser lifecycle: load assets.
   */
  preload(): void {
    const assets = this.getAssets();

    for (const asset of assets) {
      this.loadAsset(asset);
    }

    // Progress events
    this.load.on('progress', (value: number) => {
      this.onLoadProgress(value);
    });

    this.load.on('fileprogress', (file: { key: string }) => {
      this.onFileProgress(file.key);
    });
  }

  private loadAsset(asset: AssetManifestItem): void {
    switch (asset.type) {
      case 'image':
        this.load.image(asset.key, asset.url);
        break;
      case 'spritesheet':
        this.load.spritesheet(asset.key, asset.url, asset.frameConfig);
        break;
      case 'audio':
        this.load.audio(asset.key, asset.url);
        break;
      case 'json':
        this.load.json(asset.key, asset.url);
        break;
      case 'atlas':
        this.load.atlas(asset.key, asset.url, asset.atlasUrl);
        break;
      case 'spine': {
        // Spine assets loaded via SpinePlugin
        const spineLoader = this.load as SpineLoader;
        if (spineLoader.spine && asset.atlasUrl) {
          spineLoader.spine(asset.key, asset.url, asset.atlasUrl);
        }
        break;
      }
    }
  }

  /**
   * Override for custom loading progress UI.
   */
  protected onLoadProgress(_progress: number): void { }

  /**
   * Override for per-file loading feedback.
   */
  protected onFileProgress(_fileKey: string): void { }

  /**
   * Phaser lifecycle: scene creation.
   */
  create(): void {
    eventBus.emit('scene:ready', this.scene.key);
    this.onCreate(this.sceneData);
  }

  /**
   * Override for scene setup after assets loaded.
   */
  protected abstract onCreate(data: SceneData): void;

  /**
   * Pause scene (stops update loop but keeps rendering).
   */
  pauseScene(): void {
    if (this.isPaused) return;
    this.isPaused = true;
    this.scene.pause();
    this.onPause();
  }

  /**
   * Resume paused scene.
   */
  resumeScene(): void {
    if (!this.isPaused) return;
    this.isPaused = false;
    this.scene.resume();
    this.onResume();
  }

  /**
   * Override for pause logic (e.g., show pause menu).
   */
  protected onPause(): void { }

  /**
   * Override for resume logic.
   */
  protected onResume(): void { }

  /**
   * Clean shutdown with resource cleanup.
   */
  shutdown(): void {
    this.onShutdown();
    eventBus.emit('scene:shutdown', this.scene.key);
  }

  /**
   * Override for custom cleanup.
   */
  protected onShutdown(): void { }
}
