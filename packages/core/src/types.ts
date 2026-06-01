import type { Container } from "pixi.js";
import type { ComponentType } from "react";
import type { Store } from "./store";
import type { ServiceRegistry } from "./services";
import type { InputMapDef, InputRuntime } from "./input/types";

/** Per-frame info; PixiJS Ticker satisfies this structurally. */
export interface FrameInfo {
  readonly deltaTime: number;
  readonly deltaMS: number;
}

/** Minimal ticker surface used by core; `app.ticker` satisfies it. */
export interface TickerLike {
  add(fn: (frame: FrameInfo) => void): unknown;
  remove(fn: (frame: FrameInfo) => void): unknown;
}

/** Cancels a scheduled timer or interval. */
export interface ScheduleHandle {
  cancel(): void;
}

/** Ticker-driven scheduler; see `createFrameLoop`. */
export interface FrameLoop {
  timer(ms: number, fn: () => void): ScheduleHandle;
  interval(ms: number, fn: () => void): ScheduleHandle;
  destroy(): void;
}

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
 */
/** Empty by design — games populate it via declaration merging. */
export interface CommandMap {}
export type Command = CommandMap[keyof CommandMap];

export interface SceneScreenProps<Data = unknown> {
  data: Data;
  scene: BaseScene<Data>;
}

/** Narrow dependency a scene needs — keeps scenes unit-testable. */
export interface SceneContext {
  readonly services: ServiceRegistry;
  readonly store: Store<GameState>;
  readonly viewport: Viewport;
  readonly input: InputRuntime;
  readonly scheduler: FrameLoop;
}

export type ViewFit = "contain" | "cover";

export interface ViewConfig {
  design: readonly [number, number];
  fit?: ViewFit;
  background?: string;
}

/**
 * Live view transform: how design coordinates map onto canvas-relative CSS
 * pixels under the current fit/resize. Reassigned (never mutated) on resize.
 */
export interface ViewState {
  readonly scale: number;
  readonly offsetX: number;
  readonly offsetY: number;
  readonly design: Readonly<{ width: number; height: number }>;
  readonly css: Readonly<{ width: number; height: number }>;
}

/**
 * Scene-facing view: read the current transform and convert between viewport
 * space (canvas-relative CSS pixels, e.g. a pointer event) and design space.
 */
export interface Viewport {
  readonly scale: number;
  readonly design: Readonly<{ width: number; height: number }>;
  readonly css: Readonly<{ width: number; height: number }>;
  viewportToDesign(x: number, y: number): { x: number; y: number };
  designToViewport(x: number, y: number): { x: number; y: number };
}

export type Transition =
  | { type: "none" }
  | { type: "fade"; duration: number };

export interface GoOptions {
  data?: unknown;
  transition?: Transition;
}

// Forward type-only reference; concrete class lives in scene.ts.
import type { BaseScene } from "./pixi/scene";
export type { BaseScene };

import type { Bridge } from "./bridge";
import type { AssetLoader } from "./pixi/asset-loader";

export interface SceneStackEntry {
  key: string;
  data: unknown;
  Screen?: ComponentType<SceneScreenProps>;
  instance: BaseScene;
}

export interface SceneManagerHost {
  readonly stage: Container;
  readonly ticker: TickerLike;
  readonly uiRoot: HTMLElement;
  readonly viewport: Viewport;
  readonly input: InputRuntime;
  readonly scheduler: FrameLoop;
  readonly bridge: Bridge;
  readonly loader: AssetLoader;
  readonly services: ServiceRegistry;
}

import type { SceneConstructor } from "./pixi/scene";

export interface GamePlugin {
  install(game: import("./game").Game): void | Promise<void>;
}

export interface GameHooks {
  onReady?(game: import("./game").Game): void | Promise<void>;
  onError?(error: unknown): void;
}

export interface GameConfig {
  mount?: string;
  view: ViewConfig;
  initialScene: string;
  initialState: Omit<GameState, "route">;
  scenes: SceneConstructor[];
  input?: InputMapDef;
  manifest?: string;
  plugins?: GamePlugin[];
  hooks?: GameHooks;
}
