import Phaser from 'phaser';
import { executeTransition, DEFAULT_TRANSITIONS } from './transitions';
import type { TransitionConfig, TransitionType, SceneData } from '../types/scene.types';

/**
 * Manages scene navigation, transitions, and scene stack.
 *
 * @example
 * const sceneManager = new SceneManager(game);
 *
 * // Simple navigation
 * sceneManager.goto('GameScene', { level: 1 });
 *
 * // With transition
 * sceneManager.goto('MenuScene', {}, 'fade');
 *
 * // Scene stack (push/pop)
 * sceneManager.push('PauseScene');
 * sceneManager.pop(); // Returns to previous
 */
export class SceneManager {
  private game: Phaser.Game;
  private sceneStack: string[] = [];
  private isTransitioning = false;

  constructor(game: Phaser.Game) {
    this.game = game;
  }

  /**
   * Navigate to scene, replacing current.
   */
  async goto(
    key: string,
    data?: SceneData,
    transition: TransitionType | TransitionConfig = 'none'
  ): Promise<void> {
    if (this.isTransitioning) {
      console.warn('Scene transition already in progress');
      return;
    }

    const currentScene = this.getCurrentScene();
    const transitionConfig = typeof transition === 'string' ? DEFAULT_TRANSITIONS[transition] : transition;

    this.isTransitioning = true;

    try {
      // Transition out
      if (currentScene && transitionConfig.type !== 'none') {
        await executeTransition(currentScene, transitionConfig, 'out');
      }

      // Stop current scene
      if (currentScene) {
        this.game.scene.stop(currentScene.scene.key);
      }

      // Start new scene
      this.game.scene.start(key, data);

      // Update stack (replace)
      if (this.sceneStack.length > 0) {
        this.sceneStack[this.sceneStack.length - 1] = key;
      } else {
        this.sceneStack.push(key);
      }

      // Transition in
      const newScene = this.game.scene.getScene(key);
      if (newScene && transitionConfig.type !== 'none') {
        await executeTransition(newScene, transitionConfig, 'in');
      }
    } finally {
      this.isTransitioning = false;
    }
  }

  /**
   * Push scene onto stack (overlay).
   * Current scene is paused, not stopped.
   */
  push(key: string, data?: SceneData): void {
    const currentScene = this.getCurrentScene();

    if (currentScene) {
      currentScene.scene.pause();
    }

    // Launch scene as overlay (Phaser's scene.launch)
    const scenePlugin = this.game.scene;
    scenePlugin.start(key, data);
    scenePlugin.bringToTop(key);
    this.sceneStack.push(key);
  }

  /**
   * Pop scene from stack.
   * Resumes previous scene.
   */
  pop(): void {
    if (this.sceneStack.length <= 1) {
      console.warn('Cannot pop: scene stack has only one scene');
      return;
    }

    const currentKey = this.sceneStack.pop()!;
    this.game.scene.stop(currentKey);

    const previousKey = this.sceneStack[this.sceneStack.length - 1];
    const previousScene = this.game.scene.getScene(previousKey);

    if (previousScene) {
      previousScene.scene.resume();
    }
  }

  /**
   * Preload scenes for faster switching.
   */
  async preload(keys: string[]): Promise<void> {
    const promises = keys.map((key) => {
      return new Promise<void>((resolve) => {
        const scene = this.game.scene.getScene(key);
        if (!scene) {
          console.warn(`Scene "${key}" not found for preloading`);
          resolve();
          return;
        }

        // Start scene but keep it sleeping
        if (!this.game.scene.isActive(key)) {
          this.game.scene.start(key);
          this.game.scene.sleep(key);
        }

        scene.events.once('create', () => resolve());
      });
    });

    await Promise.all(promises);
  }

  /**
   * Get currently active scene.
   */
  getCurrentScene(): Phaser.Scene | null {
    if (this.sceneStack.length === 0) return null;

    const key = this.sceneStack[this.sceneStack.length - 1];
    return this.game.scene.getScene(key) ?? null;
  }

  /**
   * Get current scene key.
   */
  get currentKey(): string | null {
    return this.sceneStack.length > 0 ? this.sceneStack[this.sceneStack.length - 1] : null;
  }

  /**
   * Get scene stack depth.
   */
  get stackDepth(): number {
    return this.sceneStack.length;
  }

  /**
   * Check if transition is in progress.
   */
  get transitioning(): boolean {
    return this.isTransitioning;
  }
}
