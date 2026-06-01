import type { ViewState, Viewport } from "../types";

/**
 * Build a scene-facing {@link Viewport} over a live transform reader. The
 * reader is consulted on every access so conversions always reflect the
 * current resize state; outputs are fresh objects.
 */
export function createViewport(read: () => ViewState): Viewport {
  return {
    get scale() {
      return read().scale;
    },
    get design() {
      return read().design;
    },
    get css() {
      return read().css;
    },
    get orientation() {
      return read().orientation;
    },
    viewportToDesign(x, y) {
      const { scale, offsetX, offsetY } = read();
      return { x: (x - offsetX) / scale, y: (y - offsetY) / scale };
    },
    designToViewport(x, y) {
      const { scale, offsetX, offsetY } = read();
      return { x: x * scale + offsetX, y: y * scale + offsetY };
    }
  };
}
