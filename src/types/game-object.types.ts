import type { Component } from '../game-objects/component';

/** Constructor type for components */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ComponentClass<T extends Component = Component> = new (...args: any[]) => T;

/** GameObject configuration */
export interface GameObjectConfig {
  x?: number;
  y?: number;
  name?: string;
}
