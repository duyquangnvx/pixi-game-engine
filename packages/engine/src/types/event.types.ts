import type { GameObject } from '../game-objects/game-object';

/**
 * Type-safe event definitions for the game engine.
 * Extend this interface in your game to add custom events.
 *
 * @example
 * declare module '@pge/core' {
 *   interface GameEvents {
 *     'player:scored': (points: number) => void;
 *   }
 * }
 */
export interface GameEvents {
  // Core engine events
  'gameobject:created': (gameObject: GameObject) => void;
  'gameobject:destroyed': (gameObject: GameObject) => void;

  // Scene lifecycle
  'scene:ready': (sceneKey: string) => void;
  'scene:shutdown': (sceneKey: string) => void;

  // Pool events
  'pool:exhausted': (poolName: string) => void;
  'pool:expanded': (poolName: string, newSize: number) => void;
}
