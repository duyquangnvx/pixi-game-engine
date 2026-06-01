import { describe, expect, it, vi } from "vitest";
import { createFrameLoop, emptyFrameLoop } from "./scheduler";
import type { FrameInfo, TickerLike } from "./types";

function fakeTicker() {
  const fns = new Set<(f: FrameInfo) => void>();
  const ticker: TickerLike = {
    add: (fn) => fns.add(fn),
    remove: (fn) => fns.delete(fn)
  };
  return {
    ticker,
    tick: (ms: number) => fns.forEach((fn) => fn({ deltaTime: ms / 16.6667, deltaMS: ms })),
    subscriberCount: () => fns.size
  };
}

describe("createFrameLoop", () => {
  it("fires a timer once after its delay elapses, then never again", () => {
    const ft = fakeTicker();
    const loop = createFrameLoop(ft.ticker);
    const fn = vi.fn();
    loop.timer(100, fn);

    ft.tick(50);
    expect(fn).not.toHaveBeenCalled();
    ft.tick(50);
    expect(fn).toHaveBeenCalledTimes(1);
    ft.tick(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("fires an interval every period", () => {
    const ft = fakeTicker();
    const loop = createFrameLoop(ft.ticker);
    const fn = vi.fn();
    loop.interval(100, fn);

    ft.tick(100);
    ft.tick(100);
    expect(fn).toHaveBeenCalledTimes(2);
    ft.tick(50);
    expect(fn).toHaveBeenCalledTimes(2);
    ft.tick(50);
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("caps interval catch-up after a long frame gap", () => {
    const ft = fakeTicker();
    const loop = createFrameLoop(ft.ticker);
    const fn = vi.fn();
    loop.interval(100, fn);

    ft.tick(1000);
    expect(fn).toHaveBeenCalledTimes(4);
  });

  it("cancel() stops a pending timer", () => {
    const ft = fakeTicker();
    const loop = createFrameLoop(ft.ticker);
    const fn = vi.fn();
    const handle = loop.timer(100, fn);

    handle.cancel();
    ft.tick(150);
    expect(fn).not.toHaveBeenCalled();
  });

  it("cancel() stops an interval", () => {
    const ft = fakeTicker();
    const loop = createFrameLoop(ft.ticker);
    const fn = vi.fn();
    const handle = loop.interval(100, fn);

    ft.tick(100);
    handle.cancel();
    ft.tick(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("stops re-firing an interval cancelled inside its own callback", () => {
    const ft = fakeTicker();
    const loop = createFrameLoop(ft.ticker);
    const fn = vi.fn(() => handle.cancel());
    const handle = loop.interval(100, fn);

    ft.tick(1000);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("routes handler errors to onError and keeps running", () => {
    const ft = fakeTicker();
    const onError = vi.fn();
    const loop = createFrameLoop(ft.ticker, { onError });
    const ok = vi.fn();
    loop.timer(50, () => {
      throw new Error("boom");
    });
    loop.timer(50, ok);

    ft.tick(50);
    expect(onError).toHaveBeenCalledTimes(1);
    expect(ok).toHaveBeenCalledTimes(1);
  });

  it("detaches from the ticker on destroy", () => {
    const ft = fakeTicker();
    const loop = createFrameLoop(ft.ticker);
    const fn = vi.fn();
    loop.timer(50, fn);

    loop.destroy();
    expect(ft.subscriberCount()).toBe(0);
    ft.tick(100);
    expect(fn).not.toHaveBeenCalled();
  });
});

describe("emptyFrameLoop", () => {
  it("returns inert, cancellable handles", () => {
    const loop = emptyFrameLoop();
    expect(() => {
      loop.timer(10, () => undefined).cancel();
      loop.interval(10, () => undefined).cancel();
      loop.destroy();
    }).not.toThrow();
  });
});
