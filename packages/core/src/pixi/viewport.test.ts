import { describe, expect, it } from "vitest";
import { createViewport } from "./viewport";
import type { ViewState } from "../types";

const state = (over: Partial<ViewState> = {}): ViewState => ({
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  design: { width: 1280, height: 720 },
  css: { width: 1280, height: 720 },
  orientation: "landscape",
  ...over
});

describe("createViewport", () => {
  it("viewportToDesign inverts the scale + offset transform", () => {
    const vp = createViewport(() => state({ scale: 2, offsetX: 100, offsetY: 50, css: { width: 2660, height: 1490 } }));

    expect(vp.viewportToDesign(100, 50)).toEqual({ x: 0, y: 0 });
    expect(vp.viewportToDesign(2660, 1490)).toEqual({ x: 1280, y: 720 });
  });

  it("designToViewport round-trips with viewportToDesign", () => {
    const vp = createViewport(() => state({ scale: 1.5, offsetX: 30, offsetY: -10 }));

    const design = vp.viewportToDesign(400, 300);
    expect(vp.designToViewport(design.x, design.y)).toEqual({ x: 400, y: 300 });
  });

  it("reads the latest transform from the live reader on every call", () => {
    let scale = 1;
    const vp = createViewport(() => state({ scale }));

    expect(vp.viewportToDesign(50, 50)).toEqual({ x: 50, y: 50 });
    scale = 2;
    expect(vp.viewportToDesign(50, 50)).toEqual({ x: 25, y: 25 });
    expect(vp.scale).toBe(2);
  });

  it("exposes the current design, css sizes, and orientation", () => {
    const vp = createViewport(() => state({ css: { width: 1900, height: 1000 }, orientation: "portrait" }));

    expect(vp.design).toEqual({ width: 1280, height: 720 });
    expect(vp.css).toEqual({ width: 1900, height: 1000 });
    expect(vp.orientation).toBe("portrait");
  });
});
