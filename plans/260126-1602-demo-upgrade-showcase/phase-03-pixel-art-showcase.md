# Phase 3: Pixel-Art Showcase (PRIORITY)

## Context
- Parent: [plan.md](plan.md)
- Depends: Phase 2
- Uses: PixelRenderer, PixelArtBuilder, palette swapping
- Research: [pixel-art-research.md](research/pixel-art-research.md)

## Overview
| Field | Value |
|-------|-------|
| Priority | P0 |
| Status | Pending |
| Est | 3h |

Dedicated scene showcasing all pixel-art module features.

## Key Insights
- PixelArtBuilder creates sprites from ASCII strings (LLM-friendly)
- PixelRenderer supports animation tags, palette swap
- Runtime palette swap = instant skin/theme changes
- No external assets needed - all procedural

## Requirements
- Animated pixel character using PixelArtBuilder
- Multiple palette presets (normal, fire, ice, gold)
- 1-4 keys swap palettes in real-time
- Palette cycling effect (animated colors)
- Display current palette info

## Architecture
```
PixelArtScene
├── PixelCharacter (prefab)
│   ├── PixelRenderer (spriteData from PixelArtBuilder)
│   └── PaletteCycler (optional auto-cycling)
├── Palette Selector (1-4 keys)
└── Info Panel (current palette, frame info)
```

## Related Files
- `scenes/pixel-art-scene.ts` - Create
- `prefabs/pixel-character.ts` - Create
- `components/palette-cycler.ts` - Create

## Implementation Steps

### 1. Create pixel-character.ts prefab
```typescript
import { GameObject, PixelRenderer, PixelArtBuilder, PixelSpriteData, PixelPalette } from '@pge/core';
import Phaser from 'phaser';

// Define character as ASCII art (LLM-friendly format)
const CHARACTER_FRAMES = [
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
  // Frame 1: walk
  `
  ..0110..
  ..1221..
  .012210.
  .122221.
  ..3333..
  .33..33.
  .34..43.
  ..44..4.
  `,
];

// Color palettes for swapping
export const PALETTES = {
  normal: {
    colors: [
      [0, 0, 0, 0],       // 0: transparent
      [255, 200, 150, 255], // 1: skin
      [100, 100, 200, 255], // 2: eyes
      [50, 50, 150, 255],   // 3: shirt
      [80, 80, 80, 255],    // 4: pants
    ] as [number, number, number, number][],
  },
  fire: {
    colors: [
      [0, 0, 0, 0],
      [255, 100, 50, 255],  // orange skin
      [255, 255, 0, 255],   // yellow eyes
      [200, 50, 0, 255],    // red shirt
      [100, 30, 0, 255],    // dark pants
    ] as [number, number, number, number][],
  },
  ice: {
    colors: [
      [0, 0, 0, 0],
      [200, 230, 255, 255], // pale skin
      [100, 200, 255, 255], // blue eyes
      [50, 150, 200, 255],  // cyan shirt
      [30, 80, 120, 255],   // dark blue pants
    ] as [number, number, number, number][],
  },
  gold: {
    colors: [
      [0, 0, 0, 0],
      [255, 220, 100, 255], // golden skin
      [255, 255, 200, 255], // bright eyes
      [200, 150, 50, 255],  // bronze shirt
      [150, 100, 30, 255],  // brown pants
    ] as [number, number, number, number][],
  },
};

export class PixelCharacter extends GameObject {
  private pixelRenderer!: PixelRenderer;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'PixelCharacter');

    // Build sprite data from ASCII strings
    const spriteData = PixelArtBuilder.fromString({
      frames: CHARACTER_FRAMES.map(f => f.trim()),
      colorMap: {
        '.': null,  // transparent
        '0': '#000000', // outline (maps to index 0 but alpha 0)
        '1': '#ffc896', // skin
        '2': '#6464c8', // eyes
        '3': '#3232c8', // shirt
        '4': '#505050', // pants
      },
      durations: [500, 500], // ms per frame
      tags: [{ name: 'idle', from: 0, to: 1, direction: 'pingpong', repeat: 0 }],
    });

    this.pixelRenderer = this.addComponent(new PixelRenderer({
      spriteData,
      scale: 8, // 8x upscale for visibility
      defaultAnimation: 'idle',
      autoPlay: true,
    }));
  }

  setPalette(palette: PixelPalette): void {
    this.pixelRenderer.setPalette(palette);
  }

  get renderer(): PixelRenderer {
    return this.pixelRenderer;
  }
}
```

### 2. Create palette-cycler.ts component
```typescript
import { Component, PixelRenderer, PixelPalette, RGBAColor } from '@pge/core';

export interface PaletteCyclerConfig {
  renderer: PixelRenderer;
  cycleSpeed?: number; // ms per shift
  colorIndices?: number[]; // which palette indices to cycle
}

export class PaletteCycler extends Component {
  priority = 10;
  private renderer: PixelRenderer;
  private basePalette!: PixelPalette;
  private cycleSpeed: number;
  private colorIndices: number[];
  private timer = 0;
  private offset = 0;
  private enabled = false;

  constructor(config: PaletteCyclerConfig) {
    super();
    this.renderer = config.renderer;
    this.cycleSpeed = config.cycleSpeed ?? 200;
    this.colorIndices = config.colorIndices ?? [1, 2, 3]; // default: cycle colors 1-3
  }

  onAttach(): void {
    // Store original palette
    this.basePalette = { colors: [...this.renderer['currentPalette'].colors] };
  }

  start(): void {
    this.enabled = true;
    this.offset = 0;
  }

  stop(): void {
    this.enabled = false;
    this.renderer.setPalette(this.basePalette);
  }

  update(dt: number): void {
    if (!this.enabled) return;

    this.timer += dt;
    if (this.timer >= this.cycleSpeed) {
      this.timer = 0;
      this.offset = (this.offset + 1) % this.colorIndices.length;
      this.applyShiftedPalette();
    }
  }

  private applyShiftedPalette(): void {
    const newColors: RGBAColor[] = [...this.basePalette.colors];
    const indices = this.colorIndices;

    // Rotate colors at specified indices
    for (let i = 0; i < indices.length; i++) {
      const srcIdx = indices[(i + this.offset) % indices.length];
      const dstIdx = indices[i];
      newColors[dstIdx] = this.basePalette.colors[srcIdx];
    }

    this.renderer.setPalette({ colors: newColors });
  }
}
```

### 3. Create pixel-art-scene.ts
```typescript
import Phaser from 'phaser';
import { SceneManager, DebugOverlay, Logger, InputManager } from '@pge/core';
import { SCENES, COLORS } from '../constants';
import { PixelCharacter, PALETTES } from '../prefabs/pixel-character';
import { PaletteCycler } from '../components/palette-cycler';
import { UIButton } from '../prefabs/ui-button';

export class PixelArtScene extends Phaser.Scene {
  private character!: PixelCharacter;
  private paletteCycler!: PaletteCycler;
  private currentPaletteName = 'normal';
  private infoText!: Phaser.GameObjects.Text;
  private logger = new Logger('PixelArt');

  constructor() {
    super({ key: SCENES.PIXEL_ART });
  }

  create(): void {
    new DebugOverlay(this);
    const sceneManager = new SceneManager(this);

    // Title
    this.add.text(400, 30, '🎨 Pixel Art Showcase', {
      fontSize: '28px', color: '#fff'
    }).setOrigin(0.5);

    // Create character at center
    this.character = new PixelCharacter(this, 400, 250);
    this.add.existing(this.character);

    // Palette cycler component
    this.paletteCycler = this.character.addComponent(
      new PaletteCycler({ renderer: this.character.renderer })
    );

    // Controls info
    this.add.text(400, 400,
      'Press 1-4 to swap palette | C to toggle color cycling', {
      fontSize: '16px', color: '#aaa'
    }).setOrigin(0.5);

    // Palette buttons
    const paletteNames = ['normal', 'fire', 'ice', 'gold'];
    paletteNames.forEach((name, i) => {
      this.add.text(200 + i * 120, 480, `${i+1}: ${name}`, {
        fontSize: '14px', color: i === 0 ? '#fff' : '#666'
      }).setName(`palette_${name}`);
    });

    // Info display
    this.infoText = this.add.text(400, 540, '', {
      fontSize: '12px', color: '#888'
    }).setOrigin(0.5);
    this.updateInfo();

    // Back button
    new UIButton(this, 70, 30, '← Back', () => {
      sceneManager.goto(SCENES.MENU, { transition: 'slide' });
    });

    // Input handling
    this.setupInput();

    this.logger.info('Pixel Art Scene loaded');
  }

  private setupInput(): void {
    const keys = this.input.keyboard!;

    // Palette swap: 1-4
    keys.on('keydown-ONE', () => this.setPalette('normal'));
    keys.on('keydown-TWO', () => this.setPalette('fire'));
    keys.on('keydown-THREE', () => this.setPalette('ice'));
    keys.on('keydown-FOUR', () => this.setPalette('gold'));

    // Toggle cycling: C
    keys.on('keydown-C', () => {
      if (this.paletteCycler['enabled']) {
        this.paletteCycler.stop();
        this.logger.info('Palette cycling stopped');
      } else {
        this.paletteCycler.start();
        this.logger.info('Palette cycling started');
      }
      this.updateInfo();
    });
  }

  private setPalette(name: keyof typeof PALETTES): void {
    this.currentPaletteName = name;
    this.character.setPalette(PALETTES[name]);
    this.logger.info(`Palette: ${name}`);
    this.updatePaletteHighlight();
    this.updateInfo();
  }

  private updatePaletteHighlight(): void {
    ['normal', 'fire', 'ice', 'gold'].forEach(name => {
      const text = this.children.getByName(`palette_${name}`) as Phaser.GameObjects.Text;
      if (text) text.setColor(name === this.currentPaletteName ? '#fff' : '#666');
    });
  }

  private updateInfo(): void {
    const cycling = this.paletteCycler['enabled'] ? 'ON' : 'OFF';
    this.infoText.setText(
      `Palette: ${this.currentPaletteName} | Cycling: ${cycling} | Frame: ${this.character.renderer.frameIndex}`
    );
  }

  update(): void {
    this.updateInfo();
  }
}
```

## Todo
- [ ] Create pixel-character.ts with ASCII sprite definition
- [ ] Create palette-cycler.ts component
- [ ] Create pixel-art-scene.ts with controls
- [ ] Define 4 color palettes (normal, fire, ice, gold)
- [ ] Test palette swapping and cycling

## Success Criteria
- Character renders at 8x scale
- Animation plays (idle pingpong)
- 1-4 keys swap palette instantly
- C key toggles color cycling effect
- Info panel updates in real-time

## Risk Assessment
- Medium: PixelArtBuilder string parsing
- Low: Palette swap is straightforward

## Security
- No user input beyond keyboard
- No network/storage operations

## Next Steps
→ Phase 4: Playground Scene
