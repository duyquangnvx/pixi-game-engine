---
phase: 2
title: "Aseprite Loader"
status: pending
priority: P0
effort: 0.5d
---

# Phase 2: Aseprite Loader

## Context
- Parent: [plan.md](plan.md)
- Depends on: [Phase 1](phase-01-type-definitions.md)
- Pattern: `packages/engine/src/utils/storage-manager.ts`

## Overview
Utility class to parse Aseprite (.ase/.aseprite) files into PixelSpriteData format.

## File to Create
`packages/engine/src/pixel-art/aseprite-loader.ts` (~100 lines)

## Dependencies
Add to `packages/engine/package.json`:
```json
"dependencies": {
  "ase-parser": "^1.1.0"
}
```

## Implementation

```typescript
import Aseprite from 'ase-parser';
import type { PixelSpriteData, PixelFrame, AnimationTag, PixelPalette, RGBAColor } from './pixel-sprite.types';

export class AsepriteLoader {
  /**
   * Parse Aseprite buffer into PixelSpriteData
   */
  static parse(buffer: ArrayBuffer, filename: string): PixelSpriteData {
    const nodeBuffer = Buffer.from(buffer);
    const ase = new Aseprite(nodeBuffer, filename);
    ase.parse();

    return {
      width: ase.width,
      height: ase.height,
      frames: this.extractFrames(ase),
      palette: this.extractPalette(ase),
      tags: this.extractTags(ase),
    };
  }

  private static extractFrames(ase: Aseprite): PixelFrame[] {
    // Composite all cels per frame into indexed data
  }

  private static extractPalette(ase: Aseprite): PixelPalette {
    // Extract colors from Aseprite palette
  }

  private static extractTags(ase: Aseprite): AnimationTag[] {
    // Map Aseprite tags to AnimationTag format
  }
}
```

## Key Logic
1. `parse()` - Entry point, creates Aseprite instance and parses
2. `extractFrames()` - Composites layers/cels into single indexed array per frame
3. `extractPalette()` - Converts Aseprite palette to RGBAColor array
4. `extractTags()` - Maps animation tags with direction handling

## Validated Decisions

### RGBA Mode Handling
If Aseprite file uses RGBA mode instead of Indexed:
- Extract all unique colors from pixels
- Build palette automatically from unique colors
- Convert RGBA pixels to palette indices
```typescript
private static rgbaToIndexed(rgbaData: Uint8Array, width: number, height: number): { indexedData: Uint8Array; palette: PixelPalette } {
  const colorMap = new Map<string, number>(); // 'r,g,b,a' -> index
  const colors: RGBAColor[] = [[0, 0, 0, 0]]; // Index 0 = transparent
  const indexedData = new Uint8Array(width * height);

  for (let i = 0; i < rgbaData.length; i += 4) {
    const key = `${rgbaData[i]},${rgbaData[i+1]},${rgbaData[i+2]},${rgbaData[i+3]}`;
    if (!colorMap.has(key)) {
      colorMap.set(key, colors.length);
      colors.push([rgbaData[i], rgbaData[i+1], rgbaData[i+2], rgbaData[i+3]]);
    }
    indexedData[i / 4] = colorMap.get(key)!;
  }
  return { indexedData, palette: { colors } };
}
```

### Auto-create 'default' Tag
If no tags defined in Aseprite file:
```typescript
private static extractTags(ase: Aseprite): AnimationTag[] {
  if (!ase.tags || ase.tags.length === 0) {
    // Auto-create 'default' tag with all frames
    return [{
      name: 'default',
      from: 0,
      to: ase.frames.length - 1,
      direction: 'forward',
      repeat: 0, // infinite loop
    }];
  }
  // ... normal tag extraction
}
```

## Risk: Browser Buffer
**Decision:** Add buffer polyfill to Vite config (handled in Phase 4)

## Todo
- [ ] Add ase-parser dependency
- [ ] Create aseprite-loader.ts in pixel-art/
- [ ] Implement RGBA→Indexed auto-conversion
- [ ] Implement 'default' tag auto-creation
- [ ] Test with sample .aseprite file
- [ ] Verify browser compatibility

## Success Criteria
- Parse Aseprite file to PixelSpriteData
- Extract frames, palette, tags correctly
- Works in browser environment
