import { GameObject, PixelRenderer, PixelArtBuilder, PixelPalette, RGBAColor, PixelSpriteData } from '@pge/core';
import Phaser from 'phaser';

// ═══════════════════════════════════════════════════════════════════════════
// CHARACTERS
// ═══════════════════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════════════════
// CREATURES & OBJECTS (vibe-game style)
// ═══════════════════════════════════════════════════════════════════════════

// === SLIME (animated bounce) ===
const SLIME_FRAMES = [
  // Frame 0: normal
  `
........
..1111..
.111111.
11011011
11111111
12222221
.222222.
..2222..
`,
  // Frame 1: squished
  `
........
........
.111111.
11011011
11111111
12222221
22222222
.222222.
`,
];

const SLIME_COLOR_MAP = {
  '.': null,
  '0': '#000000', // black eyes
  '1': '#2ecc71',
  '2': '#27ae60',
};

// === COIN - exact match vibe-game ===
const COIN_FRAMES = [
  `
..1111..
.122111.
12211111
12111111
11111111
11111131
.111131.
..1111..
`,
  `
..1111..
.111111.
11222111
11222111
11111111
11111131
.111131.
..1111..
`,
];

const COIN_COLOR_MAP = {
  '.': null,
  '1': '#ffd700', // gold
  '2': '#ffec8b', // highlight
  '3': '#b8860b', // shadow
};

// === BAT (flying) - exact match vibe-game ===
const BAT_FRAMES = [
  // Wings down
  `
........
1......1
11.22.11
11233211
.122221.
..2222..
...22...
........
`,
  // Wings up
  `
11....11
1..22..1
..2332..
..2222..
..2222..
...22...
........
........
`,
];

const BAT_COLOR_MAP = {
  '.': null,
  '1': '#4a4a4a',
  '2': '#2a2a2a',
  '3': '#ff0000',
};

// === GHOST - exact match vibe-game ===
const GHOST_FRAMES = [
  `
..1111..
.111111.
11211211
11111111
11133111
11111111
1.1.1.1.
........
`,
  `
..1111..
.111111.
11211211
11111111
11133111
11111111
.1.1.1.1
........
`,
];

const GHOST_COLOR_MAP = {
  '.': null,
  '1': '#ffffff',
  '2': '#000000', // eyes
  '3': '#aaaaaa', // mouth
};

// === HEART ===
const HEART_FRAMES = [
  `
.11..11.
12112112
11111111
11111111
.111111.
..1111..
...11...
........
`,
];

const HEART_COLOR_MAP = {
  '.': null,
  '1': '#ff0000',
  '2': '#ff6666',
};

// === FIREBALL - exact match vibe-game ===
const FIREBALL_FRAMES = [
  `
...33...
..3113..
.312213.
43122134
43111134
.433334.
..4444..
........
`,
  `
..3333..
.311113.
43122134
43122134
.431134.
..4334..
...44...
........
`,
];

const FIREBALL_COLOR_MAP = {
  '.': null,
  '1': '#ffff00', // yellow
  '2': '#ffffff', // white center
  '3': '#ff6600', // orange
  '4': '#ff0000', // red outer
};

// === GEM ===
const GEM_FRAMES = [
  `
...11...
..1221..
.123321.
12344321
11233211
.112211.
..1111..
...11...
`,
];

const GEM_COLOR_MAP = {
  '.': null,
  '1': '#9b59b6',
  '2': '#bb77d6',
  '3': '#ddaaff',
  '4': '#ffffff',
};

// === STAR (twinkling) ===
const STAR_FRAMES = [
  `
...11...
..1221..
.123321.
12344321
12344321
.123321.
..1221..
...11...
`,
  `
........
...11...
..1221..
.123321.
.123321.
..1221..
...11...
........
`,
];

const STAR_COLOR_MAP = {
  '.': null,
  '1': '#ffff00',
  '2': '#ffffaa',
  '3': '#ffffff',
  '4': '#ffffff',
};

// === TREE ===
const TREE_FRAMES = [
  `
...11...
..1111..
.112211.
11222211
.111111.
...33...
...33...
...33...
`,
];

const TREE_COLOR_MAP = {
  '.': null,
  '1': '#228b22',
  '2': '#2e8b2e',
  '3': '#8b4513',
};

// === DRAGON (complex animated) ===
const DRAGON_FRAMES = [
  // Wings up
  `
11....11
21.33.12
..3443..
.344443.
.344443.
..3443..
..3..3..
.53..35.
`,
  // Wings mid
  `
.11..11.
21.33.12
2.3443.2
.344443.
.344443.
..3443..
..3..3..
.53..35.
`,
  // Breathing fire
  `
...33...
..3443..
11346762
2134776.
21344412
..3443..
..3..3..
.53..35.
`,
];

const DRAGON_COLOR_MAP = {
  '.': null,
  '1': '#8b0000',
  '2': '#ff4500',
  '3': '#228b22',
  '4': '#32cd32',
  '5': '#ffa500',
  '6': '#ff0000',
  '7': '#ff6600',
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

interface SpriteConfig {
  frames: string[];
  colorMap: Record<string, string | null>;
  durations?: number[];
  direction?: 'forward' | 'reverse' | 'pingpong';
}

function buildSpriteData(config: SpriteConfig): PixelSpriteData {
  const frameCount = config.frames.length;
  const durations = config.durations ?? Array(frameCount).fill(200);
  return PixelArtBuilder.fromString({
    frames: config.frames.map((f) => f.trim()),
    colorMap: config.colorMap,
    durations,
    tags: [{ name: 'idle', from: 0, to: frameCount - 1, direction: config.direction ?? 'pingpong', repeat: 0 }],
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

  private getSpriteData(charType: CharacterType): PixelSpriteData {
    switch (charType) {
      case 'warrior':
        return buildSpriteData({ frames: WARRIOR_FRAMES, colorMap: WARRIOR_COLOR_MAP, durations: [500, 500] });
      case 'mage':
        return buildSpriteData({ frames: MAGE_FRAMES, colorMap: MAGE_COLOR_MAP, durations: [500, 500] });
      case 'robot':
        return buildSpriteData({ frames: ROBOT_FRAMES, colorMap: ROBOT_COLOR_MAP, durations: [500, 500] });
    }
  }

  setPalette(palette: PixelPalette): void {
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

// ═══════════════════════════════════════════════════════════════════════════
// CREATURE SPRITES (vibe-game style)
// ═══════════════════════════════════════════════════════════════════════════

export type CreatureType = 'slime' | 'coin' | 'bat' | 'ghost' | 'heart' | 'fireball' | 'gem' | 'star' | 'tree' | 'dragon';

const CREATURE_CONFIGS: Record<CreatureType, SpriteConfig> = {
  slime: { frames: SLIME_FRAMES, colorMap: SLIME_COLOR_MAP, durations: [300, 300] },
  coin: { frames: COIN_FRAMES, colorMap: COIN_COLOR_MAP, durations: [150, 150] },
  bat: { frames: BAT_FRAMES, colorMap: BAT_COLOR_MAP, durations: [120, 120] },
  ghost: { frames: GHOST_FRAMES, colorMap: GHOST_COLOR_MAP, durations: [400, 400] },
  heart: { frames: HEART_FRAMES, colorMap: HEART_COLOR_MAP },
  fireball: { frames: FIREBALL_FRAMES, colorMap: FIREBALL_COLOR_MAP, durations: [100, 100] },
  gem: { frames: GEM_FRAMES, colorMap: GEM_COLOR_MAP },
  star: { frames: STAR_FRAMES, colorMap: STAR_COLOR_MAP, durations: [200, 200] },
  tree: { frames: TREE_FRAMES, colorMap: TREE_COLOR_MAP },
  dragon: { frames: DRAGON_FRAMES, colorMap: DRAGON_COLOR_MAP, durations: [250, 250, 400] },
};

/**
 * Generic pixel creature/object prefab (vibe-game style)
 */
export class PixelCreature extends GameObject {
  private pixelRenderer: PixelRenderer;
  private creatureType: CreatureType;

  constructor(scene: Phaser.Scene, x: number, y: number, type: CreatureType, scale = 4) {
    super(scene, x, y, { name: `Creature_${type}` });
    this.creatureType = type;

    const config = CREATURE_CONFIGS[type];
    const spriteData = buildSpriteData(config);

    this.pixelRenderer = this.addComponent(
      new PixelRenderer({
        spriteData,
        scale,
        defaultAnimation: 'idle',
        autoPlay: config.frames.length > 1,
      })
    );
  }

  get renderer(): PixelRenderer {
    return this.pixelRenderer;
  }

  get creatureKind(): CreatureType {
    return this.creatureType;
  }
}

export const ALL_CREATURE_TYPES: CreatureType[] = ['slime', 'coin', 'bat', 'ghost', 'heart', 'fireball', 'gem', 'star', 'tree', 'dragon'];
