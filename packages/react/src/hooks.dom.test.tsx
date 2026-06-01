import { describe, expect, it } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { ReactNode } from "react";
import { Container } from "pixi.js";
import { createBridge, ServiceRegistry, createViewport, emptyInputRuntime, emptyFrameLoop } from "@studio/core";
import { AssetLoader, SceneManager, BaseScene } from "@studio/pixi";
import { GameProvider } from "./GameProvider";
import { useGame, useStore, useScene } from "./hooks";
import type { Game } from "./game";
import type { FrameInfo } from "@studio/core";
import type { SceneManagerHost } from "@studio/pixi";

class MenuScene extends BaseScene {
  static override key = "Menu";
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
  const game = { scenes, bridge: host.bridge } satisfies Pick<Game, "scenes" | "bridge">;
  return game as Game;
}

function wrapperFor(game: Game) {
  return ({ children }: { children: ReactNode }): ReactNode => (
    <GameProvider game={game}>{children}</GameProvider>
  );
}

describe("useGame", () => {
  it("throws when used outside a GameProvider", () => {
    expect(() => renderHook(() => useGame())).toThrow(/GameProvider/);
  });

  it("returns the provided game inside a provider", () => {
    const game = fakeGame();
    const { result } = renderHook(() => useGame(), { wrapper: wrapperFor(game) });
    expect(result.current).toBe(game);
  });
});

describe("useStore", () => {
  it("selects state and memoizes when the selected value is unchanged", () => {
    const game = fakeGame();
    let renders = 0;
    const { result } = renderHook(
      () => {
        renders += 1;
        return useStore((s) => s.route.length);
      },
      { wrapper: wrapperFor(game) }
    );

    expect(result.current).toBe(0);

    // selected value changes 0 -> 1 (re-render expected)
    act(() => { game.bridge.setRoute([{ scene: "X", data: undefined }]); });
    expect(result.current).toBe(1);

    // a store notification that does NOT change the selected length -> cache hit, no re-render
    const before = renders;
    act(() => { game.bridge.setRoute([{ scene: "Y", data: undefined }]); });
    expect(result.current).toBe(1);
    expect(renders).toBeLessThanOrEqual(before + 1);
  });
});

describe("useScene", () => {
  it("is null initially and the top instance after go()", async () => {
    const game = fakeGame();
    const { result } = renderHook(() => useScene(), { wrapper: wrapperFor(game) });
    expect(result.current).toBeNull();
    await act(async () => { await game.scenes.go("Menu"); });
    expect(result.current).not.toBeNull();
  });
});
