import { describe, expect, it } from "vitest";
import { createBridge } from "./bridge";

declare module "./scene-contract" {
  interface Commands {
    "math:double": (args: { value: number }) => number;
    noop: () => void;
  }
}

describe("createBridge", () => {
  it("seeds store with route plus provided initial state", () => {
    const bridge = createBridge({});
    expect(bridge.store.getState().route).toEqual([]);
  });

  it("routes a command to its handler and returns the typed result", async () => {
    const bridge = createBridge({});
    bridge.handle("math:double", ({ value }) => value * 2);
    const result = await bridge.invoke("math:double", { value: 21 });
    expect(result).toBe(42);
  });

  it("awaits an async handler before resolving", async () => {
    const bridge = createBridge({});
    bridge.handle("math:double", async ({ value }) => value * 2);
    await expect(bridge.invoke("math:double", { value: 4 })).resolves.toBe(8);
  });

  it("rejects when no handler is registered for the command", async () => {
    const bridge = createBridge({});
    await expect(bridge.invoke("noop")).rejects.toThrow(/no handler registered/i);
  });

  it("stops routing after the handle disposer runs", async () => {
    const bridge = createBridge({});
    const off = bridge.handle("noop", () => {});
    off();
    await expect(bridge.invoke("noop")).rejects.toThrow();
  });

  it("setRoute replaces the route stack in the store", () => {
    const bridge = createBridge({});
    bridge.setRoute([{ scene: "Menu", data: undefined }]);
    expect(bridge.store.getState().route).toEqual([{ scene: "Menu", data: undefined }]);
  });
});
