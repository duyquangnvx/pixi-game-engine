import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Container } from "pixi.js";
import { createBridge } from "../bridge";
import { ServiceRegistry } from "../services";
import { AssetLoader } from "../pixi/asset-loader";
import { SceneManager } from "../pixi/scene-manager";
import { BaseScene } from "../pixi/scene";
import { createViewport } from "../pixi/viewport";
import { emptyInputRuntime } from "../input/runtime";
import { emptyFrameLoop } from "../scheduler";
import { GameProvider } from "./GameProvider";
import { Overlay } from "./Overlay";
import type { ReactNode } from "react";
import type { Game } from "../game";
import type { FrameInfo, SceneManagerHost, SceneScreenProps } from "../types";

function MenuScreen(_props: SceneScreenProps): ReactNode {
  return <button>Play</button>;
}
class MenuScene extends BaseScene {
  static override key = "Menu";
  static override Screen = MenuScreen;
}

function fakeGame(): Game {
  const ticks = new Set<(f: FrameInfo) => void>();
  const host: SceneManagerHost = {
    stage: new Container(),
    ticker: { add: (fn) => { ticks.add(fn); }, remove: (fn) => { ticks.delete(fn); } },
    uiRoot: document.createElement("div"),
    viewport: createViewport(() => ({ scale: 1, offsetX: 0, offsetY: 0, design: { width: 1280, height: 720 }, css: { width: 1280, height: 720 }, orientation: "landscape" })),
    input: emptyInputRuntime(),
    scheduler: emptyFrameLoop(),
    bridge: createBridge({}),
    loader: new AssetLoader(),
    services: new ServiceRegistry()
  };
  const scenes = new SceneManager(host);
  scenes.register(MenuScene);
  // Only the members Overlay/hooks touch are needed for this test.
  const game = { scenes, bridge: host.bridge } satisfies Pick<Game, "scenes" | "bridge">;
  return game as Game;
}

describe("Overlay", () => {
  it("renders the current scene's Screen from the stack", async () => {
    const game = fakeGame();
    await game.scenes.go("Menu");
    render(
      <GameProvider game={game}>
        <Overlay />
      </GameProvider>
    );
    expect(screen.getByRole("button", { name: "Play" })).toBeDefined();
  });
});
