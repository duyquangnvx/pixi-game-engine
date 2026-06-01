import type { Application } from "pixi.js";
import type { ViewConfig, ViewFit } from "../types";

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
 * coordinates map identically to both layers. Returns a disposer.
 */
export function applyView(
  app: Application,
  view: ViewConfig,
  mount: HTMLElement,
  uiRoot: HTMLElement
): () => void {
  const [designW, designH] = view.design;
  const mode: ViewFit = view.fit ?? "contain";

  uiRoot.style.width = `${designW}px`;
  uiRoot.style.height = `${designH}px`;

  const layout = (): void => {
    const boxW = mount.clientWidth;
    const boxH = mount.clientHeight;
    const scale = fit(designW, designH, boxW, boxH, mode);
    const tx = (boxW - designW * scale) / 2;
    const ty = (boxH - designH * scale) / 2;
    uiRoot.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
    app.stage.scale.set(scale);
    app.stage.position.set(tx, ty);
  };

  layout();

  if (typeof ResizeObserver === "undefined") {
    return () => undefined;
  }
  const observer = new ResizeObserver(() => layout());
  observer.observe(mount);
  return () => observer.disconnect();
}
