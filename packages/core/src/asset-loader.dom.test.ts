import { describe, expect, it } from "vitest";
import { AssetLoader } from "./asset-loader";

describe("AssetLoader (v1 stub)", () => {
  it("loadBundle resolves to a no-op when uninitialized", async () => {
    const loader = new AssetLoader();
    await expect(loader.loadBundle("menu")).resolves.toBeUndefined();
  });

  it("reports initialized state", () => {
    const loader = new AssetLoader();
    expect(loader.initialized).toBe(false);
  });
});
