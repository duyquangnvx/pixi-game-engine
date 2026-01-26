import { Component, PixelRenderer, PixelPalette, RGBAColor } from '@pge/core';

export interface PaletteCyclerConfig {
  renderer: PixelRenderer;
  cycleSpeed?: number;
  colorIndices?: number[];
}

/**
 * Component that cycles colors in a pixel renderer's palette for effects
 */
export class PaletteCycler extends Component {
  priority = 10;

  private renderer: PixelRenderer;
  private basePalette!: PixelPalette;
  private cycleSpeed: number;
  private colorIndices: number[];
  private timer = 0;
  private offset = 0;
  private isCycling = false;

  constructor(config: PaletteCyclerConfig) {
    super();
    this.renderer = config.renderer;
    this.cycleSpeed = config.cycleSpeed ?? 200;
    this.colorIndices = config.colorIndices ?? [1, 2, 3];
  }

  onAttach(): void {
    this.captureBasePalette();
  }

  private captureBasePalette(): void {
    // Access current palette via sprite data
    const spriteData = (this.renderer as unknown as { spriteData: { palette: PixelPalette } }).spriteData;
    this.basePalette = { colors: spriteData.palette.colors.map((c) => [...c] as RGBAColor) };
  }

  start(): void {
    this.isCycling = true;
    this.offset = 0;
    this.captureBasePalette();
  }

  stop(): void {
    this.isCycling = false;
    this.renderer.setPalette(this.basePalette);
  }

  get cycling(): boolean {
    return this.isCycling;
  }

  update(dt: number): void {
    if (!this.isCycling) return;

    this.timer += dt;
    if (this.timer >= this.cycleSpeed) {
      this.timer = 0;
      this.offset = (this.offset + 1) % this.colorIndices.length;
      this.applyShiftedPalette();
    }
  }

  private applyShiftedPalette(): void {
    const newColors: RGBAColor[] = this.basePalette.colors.map((c) => [...c] as RGBAColor);
    const indices = this.colorIndices;

    // Rotate colors at specified indices
    for (let i = 0; i < indices.length; i++) {
      const srcIdx = indices[(i + this.offset) % indices.length];
      const dstIdx = indices[i];
      if (srcIdx < this.basePalette.colors.length && dstIdx < newColors.length) {
        newColors[dstIdx] = [...this.basePalette.colors[srcIdx]] as RGBAColor;
      }
    }

    this.renderer.setPalette({ colors: newColors });
  }
}
