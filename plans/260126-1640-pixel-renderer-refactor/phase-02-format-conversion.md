---
phase: 2
title: "Data Format Conversion Utilities"
status: pending
priority: P0
effort: 2h
---

# Phase 2: Format Conversion Utilities

## Context
- [Parent Plan](plan.md)
- Must convert between PixelSpriteData and Phaser's textures.generate() format

## Overview
Add utility functions to convert indexed pixel data to Phaser string format.

## Key Insight
Phaser's `textures.generate()` expects:
```typescript
{
  data: string[],   // ['..XX..', '.XOOX.', ...] - each char = palette index
  pixelWidth: 4,    // scale factor
  pixelHeight: 4,
  palette: {        // char -> hex color mapping
    '.': '',        // transparent (empty string)
    'X': '#000000',
    'O': '#ffffff',
  }
}
```

Our current format:
```typescript
{
  indexedData: Uint8Array,  // [0, 0, 1, 1, 0, 0, ...] - palette indices
  palette: { colors: [[r,g,b,a], ...] }
}
```

## Requirements
- Convert Uint8Array indices to char-per-pixel string rows
- Convert RGBAColor[] to Phaser palette object
- Support up to 16 colors (0-9, A-F chars)
- Handle transparency (alpha = 0 → empty string in palette)

## Architecture

### Index to Char Mapping
```
Index 0  → '0'
Index 1  → '1'
...
Index 9  → '9'
Index 10 → 'A'
Index 11 → 'B'
...
Index 15 → 'F'
```

### Conversion Functions
```typescript
// Convert frame data to string array
function frameToStringData(frame: PixelFrame): string[] {
  const rows: string[] = [];
  for (let y = 0; y < frame.height; y++) {
    let row = '';
    for (let x = 0; x < frame.width; x++) {
      const idx = frame.indexedData[y * frame.width + x];
      row += indexToChar(idx);
    }
    rows.push(row);
  }
  return rows;
}

// Convert palette to Phaser format
function paletteToPhaserFormat(palette: PixelPalette): Record<string, string> {
  const result: Record<string, string> = {};
  palette.colors.forEach((rgba, idx) => {
    const char = indexToChar(idx);
    if (rgba[3] === 0) {
      result[char] = ''; // transparent
    } else {
      result[char] = rgbaToHex(rgba);
    }
  });
  return result;
}
```

## Related Files
- `packages/engine/src/pixel-art/pixel-renderer.ts` - Add as private methods

## Implementation Steps

1. Add `indexToChar(idx: number): string` helper
2. Add `rgbaToHex(rgba: RGBAColor): string` helper
3. Add `frameToStringData(frame: PixelFrame): string[]`
4. Add `paletteToPhaserFormat(palette: PixelPalette): Record<string, string>`
5. Validate 16-color limit (throw error if palette.colors.length > 16)

## Todo
- [ ] Implement indexToChar mapping
- [ ] Implement rgbaToHex conversion
- [ ] Implement frameToStringData
- [ ] Implement paletteToPhaserFormat
- [ ] Add validation for 16-color limit

## Success Criteria
- All conversion functions work correctly
- Throws clear error if palette > 16 colors
- Unit testable (pure functions)

## Risk Assessment
- Medium - Core data transformation, must be correct

## Next Steps
Proceed to Phase 3: Core Refactor
