export type ViewFit = "contain" | "cover";

export type Orientation = "portrait" | "landscape";

export interface ViewConfig {
  design: readonly [number, number];
  fit?: ViewFit;
  background?: string;
  /** Orientation to attempt locking on start (best-effort; ignored where unsupported). */
  orientation?: Orientation;
}

/**
 * Live view transform: how design coordinates map onto canvas-relative CSS
 * pixels under the current fit/resize. Reassigned (never mutated) on resize.
 */
export interface ViewState {
  readonly scale: number;
  readonly offsetX: number;
  readonly offsetY: number;
  readonly design: Readonly<{ width: number; height: number }>;
  readonly css: Readonly<{ width: number; height: number }>;
  readonly orientation: Orientation;
}

/**
 * Scene-facing view: read the current transform and convert between viewport
 * space (canvas-relative CSS pixels, e.g. a pointer event) and design space.
 */
export interface Viewport {
  readonly scale: number;
  readonly design: Readonly<{ width: number; height: number }>;
  readonly css: Readonly<{ width: number; height: number }>;
  readonly orientation: Orientation;
  viewportToDesign(x: number, y: number): { x: number; y: number };
  designToViewport(x: number, y: number): { x: number; y: number };
}

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
