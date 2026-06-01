import type { Container } from "pixi.js";
import type { ComponentType } from "react";
import type { AssetLoader } from "../assets/asset-loader";
import type { BaseScene, SceneConstructor } from "./base-scene";
import type { Bridge, ServiceRegistry, Viewport, InputRuntime, FrameLoop, TickerLike } from "@studio/core";

export interface SceneScreenProps<Data = unknown> {
  data: Data;
  scene: BaseScene<Data>;
}

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

export type { SceneConstructor };
