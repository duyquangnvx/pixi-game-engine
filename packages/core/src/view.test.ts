import { describe, expect, it } from "vitest";
import { fit } from "./view";

describe("fit", () => {
  it("contain picks the smaller axis scale (letterbox)", () => {
    // design 1280x720 into 1280x1000 -> width-bound, scale 1
    expect(fit(1280, 720, 1280, 1000, "contain")).toBe(1);
    // into 640x720 -> width-bound, scale 0.5
    expect(fit(1280, 720, 640, 720, "contain")).toBe(0.5);
  });

  it("cover picks the larger axis scale (crop)", () => {
    expect(fit(1280, 720, 1280, 1000, "cover")).toBeCloseTo(1000 / 720, 5);
  });
});
