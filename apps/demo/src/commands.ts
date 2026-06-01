import "@studio/core";
import type { SceneKey } from "@studio/core";
import type { BaseScene } from "@studio/pixi";

declare module "@studio/core" {
  interface GameState {
    hud: { coins: number; level: number };
  }
  interface Commands {
    "scene:go": (args: { key: SceneKey; level?: number }) => Promise<BaseScene>;
    "scene:push": (args: { key: SceneKey }) => Promise<BaseScene>;
    "scene:pop": () => void;
    "coin:add": (args: { amount: number }) => void;
  }
}
