import "@studio/core";

declare module "@studio/core" {
  interface GameState {
    hud: { coins: number };
  }
  interface CommandMap {
    "scene:go": { type: "scene:go"; key: string };
    "scene:push": { type: "scene:push"; key: string };
    "scene:pop": { type: "scene:pop" };
    "coin:add": { type: "coin:add"; amount: number };
  }
}
