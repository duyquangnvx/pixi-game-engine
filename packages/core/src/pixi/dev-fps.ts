import type { FrameInfo, TickerLike } from "../types";

const STYLE = [
  "position:absolute",
  "top:4px",
  "left:4px",
  "padding:2px 6px",
  "font:12px/14px monospace",
  "color:#0f0",
  "background:rgba(0,0,0,0.6)",
  "border-radius:3px",
  "pointer-events:none",
  "z-index:9999"
].join(";");

const SAMPLE_MS = 500;

/**
 * Mount a small FPS counter (averaged over ~{@link SAMPLE_MS}) into `parent`.
 * Returns a disposer that detaches from the ticker and removes the element.
 */
export function mountDevFps(ticker: TickerLike, parent: HTMLElement): () => void {
  const el = document.createElement("div");
  el.dataset["devFps"] = "1";
  el.setAttribute("style", STYLE);
  el.textContent = "FPS: --";
  parent.appendChild(el);

  let frames = 0;
  let acc = 0;
  const tick = (frame: FrameInfo): void => {
    frames += 1;
    acc += frame.deltaMS;
    if (acc >= SAMPLE_MS) {
      el.textContent = `FPS: ${Math.round((frames * 1000) / acc)}`;
      frames = 0;
      acc = 0;
    }
  };
  ticker.add(tick);

  let disposed = false;
  return () => {
    if (disposed) return;
    disposed = true;
    ticker.remove(tick);
    el.remove();
  };
}
