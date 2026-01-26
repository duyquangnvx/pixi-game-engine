import { GameObject, PixelRenderer, PixelArtBuilder, PixelPalette, RGBAColor } from '@pge/core';
import Phaser from 'phaser';

// === WARRIOR CHARACTER ===
const WARRIOR_FRAMES = [
  // Frame 0: idle
  `
..0110..
..1221..
.012210.
.122221.
..3333..
.334433.
.34..43.
.44..44.
`,
  // Frame 1: idle breath
  `
..0110..
..1221..
.012210.
.122221.
..3333..
.33..33.
.34..43.
..44.44.
`,
];

const WARRIOR_COLOR_MAP = {
  '.': null,
  '0': '#000000',
  '1': '#ffc896',
  '2': '#6464c8',
  '3': '#3232c8',
  '4': '#505050',
};

// === MAGE CHARACTER ===
const MAGE_FRAMES = [
  // Frame 0: idle
  `
...55...
..5115..
..1221..
.512215.
..3333..
.335533.
..3443..
..44.44.
`,
  // Frame 1: cast
  `
...55...
..5115..
..1221..
5512215.
..3333..
.33..33.
..3443..
.44...44
`,
];

const MAGE_COLOR_MAP = {
  '.': null,
  '1': '#e8d0b0',
  '2': '#9050c8',
  '3': '#4020a0',
  '4': '#302050',
  '5': '#c080ff',
};

// === ROBOT CHARACTER ===
const ROBOT_FRAMES = [
  // Frame 0: idle
  `
.011110.
.122221.
.133331.
.122221.
..2222..
.244442.
.24..42.
.44..44.
`,
  // Frame 1: blink
  `
.011110.
.100001.
.133331.
.122221.
..2222..
.244442.
..4..4..
.44..44.
`,
];

const ROBOT_COLOR_MAP = {
  '.': null,
  '0': '#404040',
  '1': '#808080',
  '2': '#c0c0c0',
  '3': '#00ff00',
  '4': '#606060',
};

// === PALETTE PRESETS ===
export const PALETTES: Record<string, PixelPalette> = {
  normal: {
    colors: [
      [0, 0, 0, 0],
      [255, 200, 150, 255],
      [100, 100, 200, 255],
      [50, 50, 150, 255],
      [80, 80, 80, 255],
      [192, 128, 255, 255],
    ],
  },
  fire: {
    colors: [
      [0, 0, 0, 0],
      [255, 100, 50, 255],
      [255, 200, 0, 255],
      [200, 50, 0, 255],
      [100, 30, 0, 255],
      [255, 150, 50, 255],
    ],
  },
  ice: {
    colors: [
      [0, 0, 0, 0],
      [200, 230, 255, 255],
      [100, 200, 255, 255],
      [50, 150, 200, 255],
      [30, 80, 120, 255],
      [180, 220, 255, 255],
    ],
  },
  gold: {
    colors: [
      [0, 0, 0, 0],
      [255, 220, 100, 255],
      [255, 180, 50, 255],
      [200, 150, 50, 255],
      [150, 100, 30, 255],
      [255, 200, 80, 255],
    ],
  },
};

function buildSpriteData(frames: string[], colorMap: Record<string, string | null>) {
  return PixelArtBuilder.fromString({
    frames: frames.map((f) => f.trim()),
    colorMap,
    durations: [500, 500],
    tags: [{ name: 'idle', from: 0, to: 1, direction: 'pingpong', repeat: 0 }],
  });
}

export type CharacterType = 'warrior' | 'mage' | 'robot';

/**
 * Pixel character prefab with palette swap support
 */
export class PixelCharacter extends GameObject {
  private pixelRenderer!: PixelRenderer;
  private characterType: CharacterType;

  constructor(scene: Phaser.Scene, x: number, y: number, charType: CharacterType = 'warrior') {
    super(scene, x, y, { name: `PixelChar_${charType}` });
    this.characterType = charType;

    const spriteData = this.getSpriteData(charType);

    this.pixelRenderer = this.addComponent(
      new PixelRenderer({
        spriteData,
        scale: 8,
        defaultAnimation: 'idle',
        autoPlay: true,
      })
    );
  }

  private getSpriteData(charType: CharacterType) {
    switch (charType) {
      case 'warrior':
        return buildSpriteData(WARRIOR_FRAMES, WARRIOR_COLOR_MAP);
      case 'mage':
        return buildSpriteData(MAGE_FRAMES, MAGE_COLOR_MAP);
      case 'robot':
        return buildSpriteData(ROBOT_FRAMES, ROBOT_COLOR_MAP);
    }
  }

  setPalette(palette: PixelPalette): void {
    // Extend palette to match sprite's palette size
    const extended: RGBAColor[] = [];
    for (let i = 0; i < 6; i++) {
      extended.push(palette.colors[i] ?? [0, 0, 0, 0]);
    }
    this.pixelRenderer.setPalette({ colors: extended });
  }

  get renderer(): PixelRenderer {
    return this.pixelRenderer;
  }

  get charType(): CharacterType {
    return this.characterType;
  }
}
