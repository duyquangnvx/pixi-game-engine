import EventEmitter from 'eventemitter3';
import type { GameEvents } from '../types/event.types';

/**
 * Typed global event bus for game-wide communication.
 * Uses eventemitter3 for performance (~1KB gzipped).
 *
 * @example
 * // Subscribe
 * eventBus.on('player:damaged', (damage, source) => console.log(damage));
 *
 * // Emit
 * eventBus.emit('player:damaged', 10, 'enemy');
 *
 * // Unsubscribe
 * eventBus.off('player:damaged', handler);
 */
export const eventBus = new EventEmitter<GameEvents>();

/**
 * Create a scoped event bus for isolated systems.
 * Useful when you need separate event channels.
 */
export function createEventBus<T extends Record<string, (...args: never[]) => void>>(): EventEmitter<T> {
  return new EventEmitter<T>();
}
