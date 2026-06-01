import { describe, expect, it, vi } from "vitest";
import { createBridge } from "./bridge";

declare module "./types" {
  interface CommandMap {
    noop: { type: "noop" };
  }
}

describe("createBridge", () => {
  it("seeds store with route plus provided initial state", () => {
    const bridge = createBridge({});
    expect(bridge.store.getState().route).toEqual([]);
  });

  it("delivers dispatched commands to registered handlers", () => {
    const bridge = createBridge({});
    const handler = vi.fn();
    bridge.onCommand(handler);
    bridge.dispatch({ type: "noop" });
    expect(handler).toHaveBeenCalledWith({ type: "noop" });
  });

  it("stops delivering to a handler after its unsubscribe", () => {
    const bridge = createBridge({});
    const handler = vi.fn();
    const off = bridge.onCommand(handler);
    off();
    bridge.dispatch({ type: "noop" });
    expect(handler).not.toHaveBeenCalled();
  });

  it("setRoute replaces the route stack in the store", () => {
    const bridge = createBridge({});
    bridge.setRoute([{ scene: "Menu", data: undefined }]);
    expect(bridge.store.getState().route).toEqual([{ scene: "Menu", data: undefined }]);
  });
});
