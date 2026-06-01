import "@studio/core";
import type { SceneKey } from "@studio/core";

declare module "@studio/core" {
  interface GameState {
    hud: { coins: number; level: number };
  }
  interface CommandMap {
    "scene:go": { type: "scene:go"; key: SceneKey; level?: number };
    "scene:push": { type: "scene:push"; key: SceneKey };
    "scene:pop": { type: "scene:pop" };
    "coin:add": { type: "coin:add"; amount: number };
  }
}
