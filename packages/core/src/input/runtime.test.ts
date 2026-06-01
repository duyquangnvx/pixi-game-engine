import { describe, expect, it, vi } from "vitest";
import { createInputRuntime, emptyInputRuntime } from "./runtime";
import { createViewport } from "../pixi/viewport";
import type { InputEventSource, RawKeyboardEvent, RawPointerEvent } from "./types";

function fakeSource() {
  const keyListeners = new Set<(e: RawKeyboardEvent) => void>();
  const pointerListeners = new Set<(e: RawPointerEvent) => void>();
  let destroyed = false;
  const source: InputEventSource = {
    onKey(fn) {
      keyListeners.add(fn);
      return () => keyListeners.delete(fn);
    },
    onPointer(fn) {
      pointerListeners.add(fn);
      return () => pointerListeners.delete(fn);
    },
    destroy() {
      destroyed = true;
      keyListeners.clear();
      pointerListeners.clear();
    }
  };
  return {
    source,
    key: (e: RawKeyboardEvent) => keyListeners.forEach((fn) => fn(e)),
    pointer: (e: RawPointerEvent) => pointerListeners.forEach((fn) => fn(e)),
    isDestroyed: () => destroyed
  };
}

// scale 2, offset (100, 50): viewport (100,50) -> design (0,0)
const viewport = createViewport(() => ({
  scale: 2,
  offsetX: 100,
  offsetY: 50,
  design: { width: 1280, height: 720 },
  css: { width: 2660, height: 1490 }
}));

const noop = () => undefined;

describe("createInputRuntime", () => {
  it("dispatches onDown / onUp for a key-bound action and tracks isDown", () => {
    const fs = fakeSource();
    const runtime = createInputRuntime({ map: { jump: { keys: ["Space"] } }, source: fs.source, viewport });
    const input = runtime.facade(noop);
    const down = vi.fn();
    const up = vi.fn();
    input.onDown("jump", down);
    input.onUp("jump", up);

    fs.key({ type: "down", code: "Space", repeat: false });
    expect(down).toHaveBeenCalledTimes(1);
    expect(input.isDown("jump")).toBe(true);

    fs.key({ type: "up", code: "Space", repeat: false });
    expect(up).toHaveBeenCalledTimes(1);
    expect(input.isDown("jump")).toBe(false);
  });

  it("ignores key auto-repeat and duplicate downs", () => {
    const fs = fakeSource();
    const runtime = createInputRuntime({ map: { jump: { keys: ["Space"] } }, source: fs.source, viewport });
    const down = vi.fn();
    runtime.facade(noop).onDown("jump", down);

    fs.key({ type: "down", code: "Space", repeat: false });
    fs.key({ type: "down", code: "Space", repeat: true });
    fs.key({ type: "down", code: "Space", repeat: false });
    expect(down).toHaveBeenCalledTimes(1);
  });

  it("keeps an action down until every bound key is released", () => {
    const fs = fakeSource();
    const runtime = createInputRuntime({ map: { fire: { keys: ["KeyA", "KeyD"] } }, source: fs.source, viewport });
    const up = vi.fn();
    const input = runtime.facade(noop);
    input.onUp("fire", up);

    fs.key({ type: "down", code: "KeyA", repeat: false });
    fs.key({ type: "down", code: "KeyD", repeat: false });
    fs.key({ type: "up", code: "KeyA", repeat: false });
    expect(input.isDown("fire")).toBe(true);
    expect(up).not.toHaveBeenCalled();

    fs.key({ type: "up", code: "KeyD", repeat: false });
    expect(input.isDown("fire")).toBe(false);
    expect(up).toHaveBeenCalledTimes(1);
  });

  it("computes an axis vector from opposing keys and notifies on change", () => {
    const fs = fakeSource();
    const runtime = createInputRuntime({
      map: { move: { axis: { x: ["KeyA", "KeyD"], y: ["KeyW", "KeyS"] } } },
      source: fs.source,
      viewport
    });
    const onAxis = vi.fn();
    const input = runtime.facade(noop);
    input.onAxis("move", onAxis);

    fs.key({ type: "down", code: "KeyD", repeat: false });
    expect(input.axis("move")).toEqual({ x: 1, y: 0 });
    fs.key({ type: "down", code: "KeyW", repeat: false });
    expect(input.axis("move")).toEqual({ x: 1, y: -1 });

    expect(onAxis).toHaveBeenLastCalledWith({ x: 1, y: -1 });
    expect(onAxis).toHaveBeenCalledTimes(2);
  });

  it("dispatches pointer down and up gestures in design space", () => {
    const fs = fakeSource();
    const runtime = createInputRuntime({ map: { press: { pointer: "down" }, release: { pointer: "up" } }, source: fs.source, viewport });
    const input = runtime.facade(noop);
    const down = vi.fn();
    const up = vi.fn();
    input.onDown("press", down);
    input.onUp("release", up);

    fs.pointer({ type: "down", pointerId: 1, viewportX: 100, viewportY: 50 });
    expect(down).toHaveBeenCalledWith({ type: "down", designX: 0, designY: 0 });

    fs.pointer({ type: "up", pointerId: 1, viewportX: 300, viewportY: 250 });
    expect(up).toHaveBeenCalledWith({ type: "up", designX: 100, designY: 100 });
  });

  it("converts pointer taps to design space for onTap", () => {
    const fs = fakeSource();
    const runtime = createInputRuntime({ map: { shoot: { pointer: "tap" } }, source: fs.source, viewport });
    const onTap = vi.fn();
    runtime.facade(noop).onTap("shoot", onTap);

    fs.pointer({ type: "tap", pointerId: 1, viewportX: 100, viewportY: 50 });
    expect(onTap).toHaveBeenCalledWith({ type: "tap", designX: 0, designY: 0 });
  });

  it("unsubscribes a scene's handlers via the register hook", () => {
    const fs = fakeSource();
    const runtime = createInputRuntime({ map: { jump: { keys: ["Space"] } }, source: fs.source, viewport });
    const unsubs: Array<() => void> = [];
    const input = runtime.facade((fn) => unsubs.push(fn));
    const down = vi.fn();
    input.onDown("jump", down);

    for (const fn of unsubs) fn();
    fs.key({ type: "down", code: "Space", repeat: false });
    expect(down).not.toHaveBeenCalled();
  });

  it("routes handler errors to onError instead of throwing", () => {
    const fs = fakeSource();
    const onError = vi.fn();
    const runtime = createInputRuntime({ map: { jump: { keys: ["Space"] } }, source: fs.source, viewport, onError });
    runtime.facade(noop).onDown("jump", () => {
      throw new Error("boom");
    });

    expect(() => fs.key({ type: "down", code: "Space", repeat: false })).not.toThrow();
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it("stops dispatching and tears down the source on destroy", () => {
    const fs = fakeSource();
    const runtime = createInputRuntime({ map: { jump: { keys: ["Space"] } }, source: fs.source, viewport });
    const down = vi.fn();
    runtime.facade(noop).onDown("jump", down);

    runtime.destroy();
    fs.key({ type: "down", code: "Space", repeat: false });
    expect(down).not.toHaveBeenCalled();
    expect(fs.isDestroyed()).toBe(true);
  });
});

describe("emptyInputRuntime", () => {
  it("produces inert facades", () => {
    const input = emptyInputRuntime().facade(noop);
    input.onDown("jump", () => undefined);
    expect(input.isDown("jump")).toBe(false);
    expect(input.axis("move")).toEqual({ x: 0, y: 0 });
  });
});
