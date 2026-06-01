import "./commands";
import { createGame } from "@studio/core";
import { BootScene } from "./scenes/boot/scene";
import { MenuScene } from "./scenes/menu/scene";
import { GameScene } from "./scenes/game/scene";
import { PauseScene } from "./scenes/pause/scene";

const game = createGame({
  mount: "#app",
  view: { design: [1280, 720], fit: "contain", background: "#1a1a2e" },
  initialScene: "Boot",
  initialState: { hud: { coins: 0 } },
  scenes: [BootScene, MenuScene, GameScene, PauseScene]
});

game.bridge.onCommand((cmd) => {
  switch (cmd.type) {
    case "scene:go":
      void game.scenes.go(cmd.key, { transition: { type: "fade", duration: 250 } });
      break;
    case "scene:push":
      void game.scenes.push(cmd.key);
      break;
    case "scene:pop":
      game.scenes.pop();
      break;
    case "coin:add":
      game.bridge.store.setState((s) => ({ ...s, hud: { ...s.hud, coins: s.hud.coins + cmd.amount } }));
      break;
  }
});

void game.start().then(() => {
  void game.scenes.go("Menu", { transition: { type: "fade", duration: 250 } });
});
