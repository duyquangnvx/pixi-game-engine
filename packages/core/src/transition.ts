import type { FrameInfo, TickerLike } from "./types";

export type Ease = (t: number) => number;

export const easeLinear: Ease = (t) => t;
export const easeInOutQuad: Ease = (t) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

export function tween(
  ticker: TickerLike,
  durationMs: number,
  ease: Ease,
  onProgress: (t: number) => void
): Promise<void> {
  return new Promise<void>((resolve) => {
    if (durationMs <= 0) {
      onProgress(1);
      resolve();
      return;
    }
    let elapsed = 0;
    const step = (frame: FrameInfo): void => {
      elapsed += frame.deltaMS;
      const p = Math.min(elapsed / durationMs, 1);
      onProgress(ease(p));
      if (p >= 1) {
        ticker.remove(step);
        resolve();
      }
    };
    ticker.add(step);
  });
}
