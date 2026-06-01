import { describe, expect, it } from "vitest";
import { Container } from "pixi.js";
import { createBridge } from "./bridge";
import { ServiceRegistry } from "./services";
import { AssetLoader } from "./asset-loader";
import { BaseScene } from "./scene";
import { SceneManager } from "./scene-manager";
import type { FrameInfo, SceneManagerHost } from "./types";

function makeHost(): { host: SceneManagerHost; frame(ms: number): void } {
  const ticks = new Set<(f: FrameInfo) => void>();
  const host: SceneManagerHost = {
    stage: new Container(),
    ticker: {
      add: (fn) => { ticks.add(fn); },
      remove: (fn) => { ticks.delete(fn); }
    },
    uiRoot: document.createElement("div"),
    bridge: createBridge({}),
    loader: new AssetLoader(),
    services: new ServiceRegistry()
  };
  return {
    host,
    frame: (ms) => { for (const fn of ticks) fn({ deltaTime: ms / 16.6667, deltaMS: ms }); }
  };
}

const flush = (): Promise<void> => new Promise((resolve) => { setTimeout(resolve, 0); });

const log: string[] = [];
class A extends BaseScene {
  static override key = "A";
  override onCreate(): void { log.push("A.create"); }
  override onUpdate(): void { log.push("A.update"); }
  override onDestroy(): void { log.push("A.destroy"); }
}
class B extends BaseScene {
  static override key = "B";
  override onCreate(): void { log.push("B.create"); }
}

describe("SceneManager", () => {
  it("go() builds the scene, attaches world, ticks it, and updates route", async () => {
    log.length = 0;
    const { host, frame } = makeHost();
    const mgr = new SceneManager(host, () => undefined);
    mgr.register(A);

    await mgr.go("A");

    expect(host.stage.children.length).toBe(1);
    expect(host.bridge.store.getState().route).toEqual([{ scene: "A", data: undefined }]);
    frame(16);
    expect(log).toContain("A.update");
    expect(mgr.getStack()[0]?.key).toBe("A");
  });

  it("go() to another scene tears down the previous one", async () => {
    log.length = 0;
    const { host } = makeHost();
    const mgr = new SceneManager(host, () => undefined);
    mgr.register(A);
    mgr.register(B);

    await mgr.go("A");
    await mgr.go("B");

    expect(log).toContain("A.destroy");
    expect(host.stage.children.length).toBe(1);
    expect(mgr.getStack().map((e) => e.key)).toEqual(["B"]);
  });

  it("push() keeps the previous scene mounted; pop() restores it", async () => {
    const { host } = makeHost();
    const mgr = new SceneManager(host, () => undefined);
    mgr.register(A);
    mgr.register(B);

    await mgr.go("A");
    await mgr.push("B");
    expect(mgr.getStack().map((e) => e.key)).toEqual(["A", "B"]);
    expect(host.stage.children.length).toBe(2);

    mgr.pop();
    expect(mgr.getStack().map((e) => e.key)).toEqual(["A"]);
    expect(host.bridge.store.getState().route.map((r) => r.scene)).toEqual(["A"]);
  });

  it("pop() at depth 1 is a no-op", async () => {
    const { host } = makeHost();
    const mgr = new SceneManager(host, () => undefined);
    mgr.register(A);
    await mgr.go("A");
    mgr.pop();
    expect(mgr.getStack().map((e) => e.key)).toEqual(["A"]);
  });

  it("throws when navigating to an unregistered scene", async () => {
    const { host } = makeHost();
    const mgr = new SceneManager(host, () => undefined);
    await expect(mgr.go("Nope")).rejects.toThrow(/Nope/);
  });

  it("go() with fade ramps the new scene to full alpha and removes the tween tick", async () => {
    log.length = 0;
    const { host, frame } = makeHost();
    const mgr = new SceneManager(host, () => undefined);
    mgr.register(A);

    const done = mgr.go("A", { transition: { type: "fade", duration: 100 } });
    await flush(); // let enter() resolve so the fade-in tween registers its ticker callback
    frame(50);
    frame(50); // tween reaches p=1, resolves, self-removes
    await done;

    expect(mgr.getStack()[0]?.instance.world.alpha).toBe(1);
  });

  it("notifies stack subscribers on change", async () => {
    const { host } = makeHost();
    const mgr = new SceneManager(host, () => undefined);
    mgr.register(A);
    let calls = 0;
    mgr.subscribe(() => { calls += 1; });
    await mgr.go("A");
    expect(calls).toBeGreaterThan(0);
  });
});
