import type { Container } from "pixi.js";
import type { ComponentType } from "react";
import type { Store } from "./store";
import type { ServiceRegistry } from "./services";

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
}

export type ViewFit = "contain" | "cover";

export interface ViewConfig {
  design: readonly [number, number];
  fit?: ViewFit;
  background?: string;
}

export type Transition =
  | { type: "none" }
  | { type: "fade"; duration: number };

export interface GoOptions {
  data?: unknown;
  transition?: Transition;
}

// Forward type-only reference; concrete class lives in scene.ts.
import type { BaseScene } from "./scene";
export type { BaseScene };

import type { Bridge } from "./bridge";
import type { AssetLoader } from "./asset-loader";

export interface SceneStackEntry {
  key: string;
  data: unknown;
  Screen?: import("react").ComponentType<SceneScreenProps>;
  instance: BaseScene;
}

export interface SceneManagerHost {
  readonly stage: Container;
  readonly ticker: TickerLike;
  readonly uiRoot: HTMLElement;
  readonly bridge: Bridge;
  readonly loader: AssetLoader;
  readonly services: ServiceRegistry;
}
