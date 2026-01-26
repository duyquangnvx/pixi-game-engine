import type { GameObject } from './game-object';

/**
 * Manages GameObject updates per scene.
 * Hooks into Phaser's scene update event.
 * Executes: update() → lateUpdate()
 */
export class ComponentManager {
  private static sceneMap = new WeakMap<Phaser.Scene, Set<GameObject>>();
  private static listenerMap = new WeakMap<Phaser.Scene, boolean>();

  /**
   * Register GameObject for updates in scene.
   */
  static register(scene: Phaser.Scene, gameObject: GameObject): void {
    let objects = this.sceneMap.get(scene);
    if (!objects) {
      objects = new Set();
      this.sceneMap.set(scene, objects);
    }
    objects.add(gameObject);

    // Setup scene update listener (once per scene)
    if (!this.listenerMap.get(scene)) {
      scene.events.on('update', (_time: number, delta: number) => {
        this.updateScene(scene, delta);
      });

      // Cleanup on scene shutdown
      scene.events.once('shutdown', () => {
        this.sceneMap.delete(scene);
        this.listenerMap.delete(scene);
      });

      this.listenerMap.set(scene, true);
    }
  }

  /**
   * Unregister GameObject from scene updates.
   */
  static unregister(scene: Phaser.Scene, gameObject: GameObject): void {
    const objects = this.sceneMap.get(scene);
    if (objects) {
      objects.delete(gameObject);
    }
  }

  private static updateScene(scene: Phaser.Scene, delta: number): void {
    const objects = this.sceneMap.get(scene);
    if (!objects) return;

    // Phase 1: update() on all active objects
    for (const obj of objects) {
      if (obj.active) {
        obj.updateComponents(delta);
      }
    }

    // Phase 2: lateUpdate() on all active objects
    for (const obj of objects) {
      if (obj.active) {
        obj.lateUpdateComponents(delta);
      }
    }
  }
}
