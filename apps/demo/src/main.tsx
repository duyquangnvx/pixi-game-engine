import "./commands";
import "./scenes/scene-map";
import { createGame } from "@studio/react";
import { input } from "./input";
import { BootScene } from "./scenes/boot/scene";
import { MenuScene } from "./scenes/menu/scene";
import { GameScene } from "./scenes/game/scene";
import { PauseScene } from "./scenes/pause/scene";

const game = createGame({
  mount: "#app",
  view: { design: [1280, 720], fit: "contain", background: "#1a1a2e" },
  initialScene: "Boot",
  initialState: { hud: { coins: 0, level: 1 } },
  scenes: [BootScene, MenuScene, GameScene, PauseScene],
  input,
  dev: { fps: true }
});

game.bridge.handle("scene:go", ({ key, level }) =>
  game.scenes.go(key, {
    transition: { type: "fade", duration: 250 },
    ...(level !== undefined ? { data: { level } } : {})
  })
);
game.bridge.handle("scene:push", ({ key }) => game.scenes.push(key));
game.bridge.handle("scene:pop", () => game.scenes.pop());
game.bridge.handle("coin:add", ({ amount }) => {
  game.bridge.store.setState((s) => ({ ...s, hud: { ...s.hud, coins: s.hud.coins + amount } }));
});

void game.start().then(() => {
  void game.scenes.go("Menu", { transition: { type: "fade", duration: 250 } });
});
