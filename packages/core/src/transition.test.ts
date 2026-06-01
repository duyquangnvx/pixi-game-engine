import { describe, expect, it } from "vitest";
import { easeLinear, easeInOutQuad, tween } from "./transition";
import type { FrameInfo } from "./scheduler";

/** Fake ticker: records the callback so the test can drive frames manually. */
function makeFakeTicker() {
  let cb: ((frame: FrameInfo) => void) | null = null;
  return {
    ticker: {
      add: (fn: (frame: FrameInfo) => void) => { cb = fn; },
      remove: (fn: (frame: FrameInfo) => void) => { if (cb === fn) cb = null; }
    },
    frame(deltaMS: number) {
      if (cb) cb({ deltaTime: deltaMS / 16.6667, deltaMS });
    },
    get attached() { return cb !== null; }
  };
}

describe("easing", () => {
  it("easeLinear is identity at endpoints and midpoint", () => {
    expect(easeLinear(0)).toBe(0);
    expect(easeLinear(0.5)).toBe(0.5);
    expect(easeLinear(1)).toBe(1);
  });
  it("easeInOutQuad pins endpoints", () => {
    expect(easeInOutQuad(0)).toBe(0);
    expect(easeInOutQuad(1)).toBe(1);
  });
});

describe("tween", () => {
  it("reports eased progress each frame and resolves at completion", async () => {
    const fake = makeFakeTicker();
    const seen: number[] = [];
    const done = tween(fake.ticker, 100, easeLinear, (p) => seen.push(p));

    fake.frame(50); // 50ms -> 0.5
    fake.frame(50); // 100ms -> 1.0 (resolves, detaches)

    await done;
    expect(seen).toEqual([0.5, 1]);
    expect(fake.attached).toBe(false);
  });

  it("clamps progress at 1 even if total elapsed overshoots", async () => {
    const fake = makeFakeTicker();
    let last = -1;
    const done = tween(fake.ticker, 100, easeLinear, (p) => { last = p; });
    fake.frame(250);
    await done;
    expect(last).toBe(1);
  });
});
