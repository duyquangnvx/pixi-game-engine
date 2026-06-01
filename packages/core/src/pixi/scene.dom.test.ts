import { describe, expect, it, vi } from "vitest";
import { Container } from "pixi.js";
import { createStore } from "../store";
import { ServiceRegistry } from "../services";
import { BaseScene } from "./scene";
import type { GameState, SceneContext } from "../types";

function ctx(): SceneContext {
  return { services: new ServiceRegistry(), store: createStore<GameState>({ route: [] }) };
}

class TestScene extends BaseScene {
  static override key = "Test";
  createdWith: unknown = null;
  destroyed = false;
  override onCreate(data: unknown): void {
    this.createdWith = data;
    this.spawn(new Container());
  }
  override onDestroy(): void {
    this.destroyed = true;
  }
}

describe("BaseScene", () => {
  it("starts with an empty world Container", () => {
    const scene = new TestScene(ctx());
    expect(scene.world).toBeInstanceOf(Container);
    expect(scene.world.children.length).toBe(0);
  });

  it("spawn adds to world and registers auto-cleanup", () => {
    const scene = new TestScene(ctx());
    scene.onCreate({ level: 1 });
    expect(scene.createdWith).toEqual({ level: 1 });
    expect(scene.world.children.length).toBe(1);

    const child = scene.world.children[0];
    scene._runDestroy(() => undefined);
    expect(child?.destroyed).toBe(true);
  });

  it("_runDestroy runs disposers in reverse order, then onDestroy", () => {
    const scene = new TestScene(ctx());
    const order: string[] = [];
    scene.onCleanup(() => order.push("first"));
    scene.onCleanup(() => order.push("second"));
    scene._runDestroy(() => undefined);
    expect(order).toEqual(["second", "first"]);
    expect(scene.destroyed).toBe(true);
  });

  it("_runDestroy routes a throwing disposer to the error handler and continues", () => {
    const scene = new TestScene(ctx());
    const onError = vi.fn();
    scene.onCleanup(() => { throw new Error("boom"); });
    const survivor = vi.fn();
    scene.onCleanup(survivor);
    scene._runDestroy(onError);
    expect(survivor).toHaveBeenCalledTimes(1); // ran before the throwing one (reverse order)
    expect(onError).toHaveBeenCalledTimes(1);
  });
});
