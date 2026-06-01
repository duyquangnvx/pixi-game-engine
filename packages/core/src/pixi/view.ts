import type { Application } from "pixi.js";
import type { ViewConfig, ViewFit, ViewState, Viewport } from "../types";
import { createViewport } from "./viewport";

export interface ViewHandle {
  readonly viewport: Viewport;
  dispose(): void;
}

export function fit(
  designW: number,
  designH: number,
  boxW: number,
  boxH: number,
  mode: ViewFit
): number {
  const sx = boxW / designW;
  const sy = boxH / designH;
  return mode === "cover" ? Math.max(sx, sy) : Math.min(sx, sy);
}

/**
 * Lay out canvas world and #ui-root with one shared scale so design
 * coordinates map identically to both layers. The returned handle exposes a
 * live {@link Viewport} for coordinate conversion and a disposer.
 */
export function applyView(
  app: Application,
  view: ViewConfig,
  mount: HTMLElement,
  uiRoot: HTMLElement
): ViewHandle {
  const [designW, designH] = view.design;
  const mode: ViewFit = view.fit ?? "contain";
  const design = { width: designW, height: designH } as const;

  uiRoot.style.width = `${designW}px`;
  uiRoot.style.height = `${designH}px`;

  let state: ViewState = { scale: 1, offsetX: 0, offsetY: 0, design, css: { width: 0, height: 0 } };
  const viewport = createViewport(() => state);

  const layout = (): void => {
    const boxW = mount.clientWidth;
    const boxH = mount.clientHeight;
    const scale = fit(designW, designH, boxW, boxH, mode);
    const tx = (boxW - designW * scale) / 2;
    const ty = (boxH - designH * scale) / 2;
    state = { scale, offsetX: tx, offsetY: ty, design, css: { width: boxW, height: boxH } };
    uiRoot.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
    app.stage.scale.set(scale);
    app.stage.position.set(tx, ty);
  };

  layout();

  if (typeof ResizeObserver === "undefined") {
    return { viewport, dispose: () => undefined };
  }
  const observer = new ResizeObserver(() => layout());
  observer.observe(mount);
  return { viewport, dispose: () => observer.disconnect() };
}
