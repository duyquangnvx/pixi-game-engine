import Phaser from 'phaser';
import { Component } from './component';
import { ComponentManager } from './component-manager';
import type { ComponentClass, GameObjectConfig } from '../types/game-object.types';

/**
 * Extended Container with component system.
 * Use as base class for game entities.
 */
export class GameObject extends Phaser.GameObjects.Container {
  private components = new Map<ComponentClass, Component>();
  private static idCounter = 0;

  /** Unique identifier */
  readonly id: string;

  constructor(scene: Phaser.Scene, x = 0, y = 0, config?: GameObjectConfig) {
    super(scene, x, y);
    this.id = `go_${++GameObject.idCounter}`;

    if (config?.name) {
      this.name = config.name;
    }

    // Register with ComponentManager for updates
    ComponentManager.register(scene, this);
  }

  /**
   * Attach a component to this GameObject.
   * @returns The attached component for chaining
   */
  addComponent<T extends Component>(component: T): T {
    const ctor = component.constructor as ComponentClass<T>;

    if (this.components.has(ctor)) {
      console.warn(`Component ${ctor.name} already exists on ${this.id}`);
      return this.components.get(ctor) as T;
    }

    component.owner = this;
    this.components.set(ctor, component);
    component.onAttach();

    return component;
  }

  /**
   * Get component by type.
   * @returns Component instance or null if not found
   */
  getComponent<T extends Component>(type: ComponentClass<T>): T | null {
    return (this.components.get(type) as T) ?? null;
  }

  /**
   * Check if component exists.
   */
  hasComponent(type: ComponentClass): boolean {
    return this.components.has(type);
  }

  /**
   * Remove component by type.
   */
  removeComponent(type: ComponentClass): void {
    const component = this.components.get(type);
    if (component) {
      component.onDetach();
      this.components.delete(type);
    }
  }

  /**
   * Called by ComponentManager each frame.
   * Updates all enabled components.
   */
  updateComponents(dt: number): void {
    for (const component of this.components.values()) {
      if (component.enabled && component.update) {
        component.update(dt);
      }
    }
  }

  /**
   * Override destroy to cleanup components.
   */
  destroy(fromScene?: boolean): void {
    // Detach all components
    for (const component of this.components.values()) {
      component.onDetach();
    }
    this.components.clear();

    // Unregister from ComponentManager
    ComponentManager.unregister(this.scene, this);

    super.destroy(fromScene);
  }
}
