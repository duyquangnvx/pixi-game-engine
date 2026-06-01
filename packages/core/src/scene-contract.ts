import type { Store } from "./store";
import type { ServiceRegistry } from "./services";
import type { Viewport } from "./viewport";
import type { FrameLoop } from "./scheduler";
import type { InputRuntime } from "./input/types";

/** One entry in the route stack mirrored into game state. */
export interface RouteEntry {
  scene: string;
  data: unknown;
}

/**
 * Game state. Base shape only declares `route`; games extend it via
 * declaration merging: `declare module "@studio/core" { interface GameState {...} }`.
 */
export interface GameState {
  route: RouteEntry[];
}

/**
 * Command registry. Games augment via declaration merging:
 * `interface CommandMap { "scene:go": { type: "scene:go"; key: string } }`.
 * Empty by design.
 */
export interface CommandMap {}
export type Command = CommandMap[keyof CommandMap];

/** Narrow dependency a scene needs — keeps scenes unit-testable. */
export interface SceneContext {
  readonly services: ServiceRegistry;
  readonly store: Store<GameState>;
  readonly viewport: Viewport;
  readonly input: InputRuntime;
  readonly scheduler: FrameLoop;
}

export type Transition =
  | { type: "none" }
  | { type: "fade"; duration: number };

export interface GoOptions<Data = unknown> {
  data?: Data;
  transition?: Transition;
}
