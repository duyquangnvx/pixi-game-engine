/**
 * RGBA color tuple [r, g, b, a] where each value is 0-255
 */
export type RGBAColor = [number, number, number, number];

/**
 * Indexed color palette for pixel art
 */
export interface PixelPalette {
  colors: RGBAColor[];
}

/**
 * Single frame of pixel art animation
 */
export interface PixelFrame {
  index: number;
  duration: number;
  width: number;
  height: number;
  indexedData: Uint8Array;
}

/**
 * Animation tag defining a named sequence
 */
export interface AnimationTag {
  name: string;
  from: number;
  to: number;
  direction: 'forward' | 'reverse' | 'pingpong';
  repeat: number;
}

/**
 * Complete pixel sprite data structure
 */
export interface PixelSpriteData {
  width: number;
  height: number;
  frames: PixelFrame[];
  palette: PixelPalette;
  tags: AnimationTag[];
}

/**
 * Configuration for PixelRenderer component
 */
export interface PixelRendererConfig {
  spriteData: PixelSpriteData;
  scale?: number;
  defaultAnimation?: string;
  autoPlay?: boolean;
  /** Animation speed multiplier (default: 1). Use 0.5 for slow-mo, 2 for fast */
  timeScale?: number;
}

/**
 * Events emitted by PixelRenderer
 */
export interface PixelRendererEvents {
  animationComplete: (tag: string) => void;
  frameChange: (frameIndex: number, tag: string) => void;
  paletteChange: (palette: PixelPalette) => void;
}
