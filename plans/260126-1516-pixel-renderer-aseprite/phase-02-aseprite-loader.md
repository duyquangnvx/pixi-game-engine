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
`packages/engine/src/utils/aseprite-loader.ts` (~100 lines)

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
import type { PixelSpriteData, PixelFrame, AnimationTag, PixelPalette, RGBAColor } from '../types/pixel-sprite.types';

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

## Risk: Browser Buffer
ase-parser uses Node.js Buffer. Solutions:
1. Add `buffer` polyfill to vite config
2. Or use alternative browser-compatible parser

## Todo
- [ ] Add ase-parser dependency
- [ ] Create aseprite-loader.ts
- [ ] Test with sample .aseprite file
- [ ] Verify browser compatibility
- [ ] Export from utils/index.ts

## Success Criteria
- Parse Aseprite file to PixelSpriteData
- Extract frames, palette, tags correctly
- Works in browser environment
