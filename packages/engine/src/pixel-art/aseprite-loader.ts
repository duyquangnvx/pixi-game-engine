import Aseprite from 'ase-parser';
import type {
  PixelSpriteData,
  PixelFrame,
  AnimationTag,
  PixelPalette,
  RGBAColor,
} from './pixel-sprite.types';

/**
 * Utility class to parse Aseprite (.ase/.aseprite) files into PixelSpriteData format.
 * Handles both Indexed and RGBA color modes.
 */
export class AsepriteLoader {
  /**
   * Parse Aseprite buffer into PixelSpriteData
   */
  static parse(buffer: ArrayBuffer, filename: string): PixelSpriteData {
    const nodeBuffer = Buffer.from(buffer);
    const ase = new Aseprite(nodeBuffer, filename);
    ase.parse();

    // Handle RGBA vs Indexed color mode
    const isIndexed = ase.colorDepth === 8;

    if (isIndexed) {
      return {
        width: ase.width,
        height: ase.height,
        frames: this.extractFramesIndexed(ase),
        palette: this.extractPalette(ase),
        tags: this.extractTags(ase),
      };
    }

    // RGBA mode - need to convert to indexed
    return this.parseRGBAMode(ase);
  }

  private static parseRGBAMode(ase: Aseprite): PixelSpriteData {
    const { width, height } = ase;
    const colorMap = new Map<string, number>();
    const colors: RGBAColor[] = [[0, 0, 0, 0]]; // Index 0 = transparent
    const frames: PixelFrame[] = [];

    for (let i = 0; i < ase.frames.length; i++) {
      const frame = ase.frames[i];
      const rgbaData = this.compositeFrame(ase, i);
      const indexedData = new Uint8Array(width * height);

      for (let p = 0; p < rgbaData.length; p += 4) {
        const r = rgbaData[p];
        const g = rgbaData[p + 1];
        const b = rgbaData[p + 2];
        const a = rgbaData[p + 3];
        const key = `${r},${g},${b},${a}`;

        if (!colorMap.has(key)) {
          colorMap.set(key, colors.length);
          colors.push([r, g, b, a]);
        }
        indexedData[p / 4] = colorMap.get(key)!;
      }

      frames.push({
        index: i,
        duration: frame.frameDuration,
        width,
        height,
        indexedData,
      });
    }

    return {
      width,
      height,
      frames,
      palette: { colors },
      tags: this.extractTags(ase),
    };
  }

  private static extractFramesIndexed(ase: Aseprite): PixelFrame[] {
    const frames: PixelFrame[] = [];
    const { width, height } = ase;

    for (let i = 0; i < ase.frames.length; i++) {
      const frame = ase.frames[i];
      const indexedData = this.compositeFrameIndexed(ase, i);

      frames.push({
        index: i,
        duration: frame.frameDuration,
        width,
        height,
        indexedData,
      });
    }

    return frames;
  }

  private static compositeFrame(ase: Aseprite, frameIndex: number): Uint8Array {
    const { width, height } = ase;
    const result = new Uint8Array(width * height * 4);
    const frame = ase.frames[frameIndex];

    // Composite all cels for this frame
    for (const cel of frame.cels) {
      const layer = ase.layers[cel.layerIndex];
      if (!layer || !layer.flags.visible) continue;

      const celData = cel.rawCelData;
      if (!celData) continue;

      const celW = cel.w;
      const celH = cel.h;
      const celX = cel.xpos;
      const celY = cel.ypos;

      for (let y = 0; y < celH; y++) {
        for (let x = 0; x < celW; x++) {
          const srcIdx = (y * celW + x) * 4;
          const dstX = celX + x;
          const dstY = celY + y;

          if (dstX < 0 || dstX >= width || dstY < 0 || dstY >= height) continue;

          const dstIdx = (dstY * width + dstX) * 4;
          const alpha = celData[srcIdx + 3];

          if (alpha > 0) {
            result[dstIdx] = celData[srcIdx];
            result[dstIdx + 1] = celData[srcIdx + 1];
            result[dstIdx + 2] = celData[srcIdx + 2];
            result[dstIdx + 3] = alpha;
          }
        }
      }
    }

    return result;
  }

  private static compositeFrameIndexed(ase: Aseprite, frameIndex: number): Uint8Array {
    const { width, height } = ase;
    const result = new Uint8Array(width * height);
    const frame = ase.frames[frameIndex];

    for (const cel of frame.cels) {
      const layer = ase.layers[cel.layerIndex];
      if (!layer || !layer.flags.visible) continue;

      const celData = cel.rawCelData;
      if (!celData) continue;

      const celW = cel.w;
      const celH = cel.h;
      const celX = cel.xpos;
      const celY = cel.ypos;

      for (let y = 0; y < celH; y++) {
        for (let x = 0; x < celW; x++) {
          const srcIdx = y * celW + x;
          const dstX = celX + x;
          const dstY = celY + y;

          if (dstX < 0 || dstX >= width || dstY < 0 || dstY >= height) continue;

          const dstIdx = dstY * width + dstX;
          const paletteIdx = celData[srcIdx];

          if (paletteIdx !== 0) {
            result[dstIdx] = paletteIdx;
          }
        }
      }
    }

    return result;
  }

  private static extractPalette(ase: Aseprite): PixelPalette {
    const colors: RGBAColor[] = [];
    const palette = ase.palette;

    if (palette?.colors) {
      for (const color of palette.colors) {
        colors.push([color.red, color.green, color.blue, color.alpha]);
      }
    }

    return { colors };
  }

  private static extractTags(ase: Aseprite): AnimationTag[] {
    if (!ase.tags || ase.tags.length === 0) {
      // Auto-create 'default' tag with all frames
      return [
        {
          name: 'default',
          from: 0,
          to: ase.frames.length - 1,
          direction: 'forward',
          repeat: 0, // infinite loop
        },
      ];
    }

    return ase.tags.map((tag) => ({
      name: tag.name,
      from: tag.from,
      to: tag.to,
      direction: this.mapDirection(tag.animDirection),
      repeat: tag.repeat ?? 0,
    }));
  }

  private static mapDirection(dir: string): 'forward' | 'reverse' | 'pingpong' {
    const lower = dir.toLowerCase();
    if (lower.includes('reverse')) return 'reverse';
    if (lower.includes('ping')) return 'pingpong';
    return 'forward';
  }
}
