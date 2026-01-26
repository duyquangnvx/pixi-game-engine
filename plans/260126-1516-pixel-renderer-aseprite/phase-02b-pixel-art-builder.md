---
phase: 2b
title: "PixelArt Builder (LLM-friendly)"
status: pending
priority: P0
effort: 0.25d
---

# Phase 2b: PixelArt Builder

## Context
- Parent: [plan.md](plan.md)
- Depends on: [Phase 1](phase-01-type-definitions.md)
- Purpose: LLM/AI-friendly pixel art generation

## Overview
Utility to create PixelSpriteData from ASCII string format. Optimized for LLM code generation.

## File to Create
`packages/engine/src/pixel-art/pixel-art-builder.ts` (~80 lines)

## Why This Matters
| Format | LLM Can Generate? | Readability |
|--------|-------------------|-------------|
| Aseprite binary | ❌ No | N/A |
| Uint8Array | ⚠️ Error-prone | Low |
| ASCII string | ✅ Excellent | High |

## API Design

```typescript
interface PixelArtConfig {
  frames: string[];           // ASCII art strings
  colorMap: Record<string, string | null>;  // char → hex color
  durations?: number[];       // ms per frame (default: 100)
  tags?: AnimationTag[];      // animation definitions
}

class PixelArtBuilder {
  static fromString(config: PixelArtConfig): PixelSpriteData;
}
```

## Usage Example

```typescript
// LLM can easily generate this
const hero = PixelArtBuilder.fromString({
  frames: [
    // idle frame 0
    `
    ..XX..
    .XSSX.
    XSBBSX
    XSBBSX
    .XSSX.
    ..XX..
    `,
    // idle frame 1 (slight movement)
    `
    ..XX..
    .XSSX.
    XSBBSX
    .XBBX.
    .XSSX.
    ..XX..
    `,
  ],
  colorMap: {
    '.': null,        // transparent
    'X': '#1a1a2e',   // outline
    'S': '#8a8aaa',   // body shadow
    'B': '#f0d0a0',   // body/skin
  },
  durations: [200, 200],
  tags: [
    { name: 'idle', from: 0, to: 1, direction: 'pingpong', repeat: 0 }
  ]
});
```

## Implementation

```typescript
import type { PixelSpriteData, PixelFrame, AnimationTag, PixelPalette, RGBAColor } from './pixel-sprite.types';

export interface PixelArtConfig {
  frames: string[];
  colorMap: Record<string, string | null>;
  durations?: number[];
  tags?: AnimationTag[];
}

export class PixelArtBuilder {
  /**
   * Create PixelSpriteData from ASCII string format.
   * LLM-friendly alternative to binary Aseprite files.
   */
  static fromString(config: PixelArtConfig): PixelSpriteData {
    const { frames: frameStrings, colorMap, durations = [], tags = [] } = config;

    // Build palette from colorMap
    const palette = this.buildPalette(colorMap);
    const charToIndex = this.buildCharToIndex(colorMap, palette);

    // Parse frames
    const frames = frameStrings.map((str, i) =>
      this.parseFrame(str, charToIndex, i, durations[i] ?? 100)
    );

    // Validate all frames same size
    const { width, height } = frames[0];
    if (frames.some(f => f.width !== width || f.height !== height)) {
      throw new Error('All frames must have same dimensions');
    }

    // Auto-create default tag if none provided
    const finalTags = tags.length > 0 ? tags : [{
      name: 'default',
      from: 0,
      to: frames.length - 1,
      direction: 'forward' as const,
      repeat: 0,
    }];

    return { width, height, frames, palette, tags: finalTags };
  }

  private static buildPalette(colorMap: Record<string, string | null>): PixelPalette {
    const colors: RGBAColor[] = [];

    for (const hex of Object.values(colorMap)) {
      if (hex === null) {
        colors.push([0, 0, 0, 0]); // transparent
      } else {
        colors.push(this.hexToRGBA(hex));
      }
    }

    return { colors };
  }

  private static buildCharToIndex(
    colorMap: Record<string, string | null>,
    palette: PixelPalette
  ): Map<string, number> {
    const map = new Map<string, number>();
    const chars = Object.keys(colorMap);

    chars.forEach((char, index) => {
      map.set(char, index);
    });

    return map;
  }

  private static parseFrame(
    str: string,
    charToIndex: Map<string, number>,
    index: number,
    duration: number
  ): PixelFrame {
    // Split into rows, trim whitespace, filter empty
    const rows = str.split('\n')
      .map(row => row.trim())
      .filter(row => row.length > 0);

    const height = rows.length;
    const width = rows[0].length;
    const indexedData = new Uint8Array(width * height);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const char = rows[y][x];
        const colorIndex = charToIndex.get(char);
        if (colorIndex === undefined) {
          throw new Error(`Unknown character '${char}' at (${x}, ${y})`);
        }
        indexedData[y * width + x] = colorIndex;
      }
    }

    return { index, duration, width, height, indexedData };
  }

  private static hexToRGBA(hex: string): RGBAColor {
    const h = hex.replace('#', '');
    return [
      parseInt(h.slice(0, 2), 16),
      parseInt(h.slice(2, 4), 16),
      parseInt(h.slice(4, 6), 16),
      255,
    ];
  }
}
```

## Todo
- [ ] Create pixel-art-builder.ts in pixel-art/
- [ ] Implement fromString() method
- [ ] Implement palette building from colorMap
- [ ] Implement frame parsing from ASCII
- [ ] Add validation (dimensions, unknown chars)
- [ ] Export from index.ts

## Success Criteria
- LLM can generate valid pixel art using ASCII strings
- Converts to PixelSpriteData correctly
- Validates frame dimensions consistency
- Throws clear errors for invalid input
