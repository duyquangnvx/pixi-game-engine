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
 * Command registry: maps a command name to a handler signature
 * `(args) => result`. Games augment it via declaration merging, so `dispatch`
 * and `handle` are checked against one source of truth:
 *
 * ```ts
 * declare module "@studio/core" {
 *   interface Commands {
 *     "scene:go": (args: { key: SceneKey; level?: number }) => Promise<BaseScene>
 *     "coin:add": (args: { amount: number }) => void
 *   }
 * }
 * ```
 *
 * A command resolves to its (awaited) return type, so dispatch is two-way.
 * Use `() => void` for fire-and-forget commands.
 */
export interface Commands {}

export type CommandName = keyof Commands & string;

export type CommandArgs<K extends CommandName> = Commands[K] extends (...args: infer A) => unknown
  ? A
  : never;

export type CommandResult<K extends CommandName> = Commands[K] extends (
  ...args: never[]
) => infer R
  ? Awaited<R>
  : never;

/**
 * Handler accepted by `bridge.handle`. May resolve synchronously or as a
 * promise regardless of how the contract states the return type.
 */
export type CommandHandler<K extends CommandName> = (
  ...args: CommandArgs<K>
) => CommandResult<K> | Promise<CommandResult<K>>;

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

/**
 * Scene registry. Maps scene key → scene data shape. Empty by design — games
 * augment it via declaration merging so navigation keys and data are checked:
 *
 * ```ts
 * declare module "@studio/core" {
 *   interface SceneMap { Boot: void; Game: { level?: number } }
 * }
 * ```
 */
export interface SceneMap {}

/** Registered scene keys, or `string` when {@link SceneMap} is unaugmented. */
export type SceneKey = [keyof SceneMap & string] extends [never]
  ? string
  : keyof SceneMap & string;
