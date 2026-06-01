import type { GameState, ViewConfig, SceneConstructor, InputMapDef } from "@studio/core";
import type { Game } from "./game";

export interface GamePlugin {
  install(game: Game): void | Promise<void>;
}

export interface GameHooks {
  onReady?(game: Game): void | Promise<void>;
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
  dev?: { fps?: boolean };
}
