import type { Component } from '../game-objects/component';

/**
 * Constructor type for components.
 * Uses `any[]` intentionally - component constructors have varying signatures
 * and TypeScript requires this for the getComponent<T>(Type) pattern to work.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ComponentClass<T extends Component = Component> = new (...args: any[]) => T;

/** GameObject configuration */
export interface GameObjectConfig {
  x?: number;
  y?: number;
  name?: string;
}
