import { describe, expect, it, vi } from "vitest";
import { createStore } from "./store";

describe("createStore", () => {
  it("returns current state from getState", () => {
    const store = createStore({ count: 0 });
    expect(store.getState()).toEqual({ count: 0 });
  });

  it("replaces state immutably via updater and notifies subscribers", () => {
    const store = createStore({ count: 0 });
    const before = store.getState();
    const listener = vi.fn();
    store.subscribe(listener);

    store.setState((prev) => ({ count: prev.count + 1 }));

    expect(store.getState()).toEqual({ count: 1 });
    expect(before).toEqual({ count: 0 }); // old reference untouched
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("stops notifying after unsubscribe", () => {
    const store = createStore({ count: 0 });
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    unsubscribe();
    store.setState((prev) => ({ count: prev.count + 1 }));
    expect(listener).not.toHaveBeenCalled();
  });
});
