import type {
  PixelSpriteData,
  PixelFrame,
  AnimationTag,
  PixelPalette,
  RGBAColor,
} from './pixel-sprite.types';

/**
 * Configuration for building pixel art from ASCII strings
 */
export interface PixelArtConfig {
  frames: string[];
  colorMap: Record<string, string | null>;
  durations?: number[];
  tags?: AnimationTag[];
}

/**
 * Utility to create PixelSpriteData from ASCII string format.
 * Optimized for LLM code generation - easy to read and write.
 *
 * @example
 * const hero = PixelArtBuilder.fromString({
 *   frames: [`
 *     ..XX..
 *     .XSSX.
 *     XSBBSX
 *   `],
 *   colorMap: {
 *     '.': null,        // transparent
 *     'X': '#1a1a2e',   // outline
 *     'S': '#8a8aaa',   // shadow
 *     'B': '#f0d0a0',   // body
 *   },
 * });
 */
export class PixelArtBuilder {
  /**
   * Create PixelSpriteData from ASCII string format.
   */
  static fromString(config: PixelArtConfig): PixelSpriteData {
    const { frames: frameStrings, colorMap, durations = [], tags = [] } = config;

    if (frameStrings.length === 0) {
      throw new Error('At least one frame is required');
    }

    // Build palette from colorMap
    const palette = this.buildPalette(colorMap);
    const charToIndex = this.buildCharToIndex(colorMap);

    // Parse frames
    const frames = frameStrings.map((str, i) =>
      this.parseFrame(str, charToIndex, i, durations[i] ?? 100)
    );

    // Validate all frames have same dimensions
    const { width, height } = frames[0];
    for (let i = 1; i < frames.length; i++) {
      if (frames[i].width !== width || frames[i].height !== height) {
        throw new Error(
          `Frame ${i} dimensions (${frames[i].width}x${frames[i].height}) ` +
            `differ from frame 0 (${width}x${height})`
        );
      }
    }

    // Auto-create default tag if none provided
    const finalTags: AnimationTag[] =
      tags.length > 0
        ? tags
        : [
            {
              name: 'default',
              from: 0,
              to: frames.length - 1,
              direction: 'forward',
              repeat: 0,
            },
          ];

    return { width, height, frames, palette, tags: finalTags };
  }

  private static buildPalette(colorMap: Record<string, string | null>): PixelPalette {
    const colors: RGBAColor[] = [];
    // Sort keys to ensure transparent (null) is always first at index 0
    const sortedEntries = this.getSortedEntries(colorMap);

    for (const [, hex] of sortedEntries) {
      if (hex === null) {
        colors.push([0, 0, 0, 0]); // transparent
      } else {
        colors.push(this.hexToRGBA(hex));
      }
    }

    return { colors };
  }

  private static buildCharToIndex(colorMap: Record<string, string | null>): Map<string, number> {
    const map = new Map<string, number>();
    // Sort keys to ensure transparent (null) is always first at index 0
    const sortedEntries = this.getSortedEntries(colorMap);

    sortedEntries.forEach(([char], index) => {
      map.set(char, index);
    });

    return map;
  }

  /**
   * Sort colorMap entries: null values first (transparent), then by key
   */
  private static getSortedEntries(
    colorMap: Record<string, string | null>
  ): [string, string | null][] {
    return Object.entries(colorMap).sort(([, a], [, b]) => {
      // null (transparent) always comes first
      if (a === null && b !== null) return -1;
      if (a !== null && b === null) return 1;
      return 0;
    });
  }

  private static parseFrame(
    str: string,
    charToIndex: Map<string, number>,
    index: number,
    duration: number
  ): PixelFrame {
    // Split into rows, trim whitespace, filter empty
    const rows = str
      .split('\n')
      .map((row) => row.trim())
      .filter((row) => row.length > 0);

    if (rows.length === 0) {
      throw new Error(`Frame ${index} is empty`);
    }

    const height = rows.length;
    const width = rows[0].length;

    // Validate all rows have same width
    for (let y = 0; y < height; y++) {
      if (rows[y].length !== width) {
        throw new Error(
          `Frame ${index} row ${y} has ${rows[y].length} chars, expected ${width}`
        );
      }
    }

    const indexedData = new Uint8Array(width * height);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const char = rows[y][x];
        const colorIndex = charToIndex.get(char);

        if (colorIndex === undefined) {
          throw new Error(`Unknown character '${char}' at frame ${index} (${x}, ${y})`);
        }

        indexedData[y * width + x] = colorIndex;
      }
    }

    return { index, duration, width, height, indexedData };
  }

  private static hexToRGBA(hex: string): RGBAColor {
    const h = hex.replace('#', '');

    if (h.length === 3) {
      // Short form #RGB -> #RRGGBB
      return [
        parseInt(h[0] + h[0], 16),
        parseInt(h[1] + h[1], 16),
        parseInt(h[2] + h[2], 16),
        255,
      ];
    }

    return [
      parseInt(h.slice(0, 2), 16),
      parseInt(h.slice(2, 4), 16),
      parseInt(h.slice(4, 6), 16),
      h.length === 8 ? parseInt(h.slice(6, 8), 16) : 255,
    ];
  }
}
