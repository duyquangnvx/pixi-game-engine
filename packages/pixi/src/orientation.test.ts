import { afterEach, describe, expect, it, vi } from "vitest";
import { tryLockOrientation } from "./orientation";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("tryLockOrientation", () => {
  it("does nothing when no target is given", async () => {
    const lock = vi.fn();
    vi.stubGlobal("screen", { orientation: { lock } });

    await tryLockOrientation();
    expect(lock).not.toHaveBeenCalled();
  });

  it("resolves when the Screen Orientation API is unavailable", async () => {
    vi.stubGlobal("screen", {});
    await expect(tryLockOrientation("portrait")).resolves.toBeUndefined();
  });

  it("locks to the requested orientation when supported", async () => {
    const lock = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("screen", { orientation: { lock } });

    await tryLockOrientation("landscape");
    expect(lock).toHaveBeenCalledWith("landscape");
  });

  it("swallows a rejected lock (e.g. not in fullscreen)", async () => {
    const lock = vi.fn().mockRejectedValue(new Error("not fullscreen"));
    vi.stubGlobal("screen", { orientation: { lock } });

    await expect(tryLockOrientation("portrait")).resolves.toBeUndefined();
  });
});
