import Phaser from 'phaser';
import { SceneManager, DebugOverlay, Logger } from '@pge/core';
import { SCENES } from '../constants';
import { PixelCharacter, PALETTES, CharacterType, PixelCreature, ALL_CREATURE_TYPES, CreatureType } from '../prefabs/pixel-characters';
import { PaletteCycler } from '../components/palette-cycler';
import { UIButton } from '../prefabs/ui-button';

const PALETTE_NAMES = ['normal', 'fire', 'ice', 'gold'] as const;
const CHARACTER_TYPES: CharacterType[] = ['warrior', 'mage', 'robot'];

/**
 * Pixel art showcase demonstrating PixelRenderer, PixelArtBuilder, and palette swap
 * Includes vibe-game style creatures
 */
export class PixelArtScene extends Phaser.Scene {
  private characters: PixelCharacter[] = [];
  private creatures: PixelCreature[] = [];
  private paletteCyclers: PaletteCycler[] = [];
  private currentPaletteName = 'normal';
  private infoText!: Phaser.GameObjects.Text;
  private paletteTexts: Phaser.GameObjects.Text[] = [];

  constructor() {
    super({ key: SCENES.PIXEL_ART });
  }

  create(): void {
    new DebugOverlay(this);
    const sceneManager = new SceneManager(this.game);

    // Title
    this.add.text(400, 25, 'Pixel Art Showcase', {
      fontSize: '24px',
      color: '#fff',
    }).setOrigin(0.5);

    // Back button
    new UIButton(this, 70, 25, '< Back', () => {
      sceneManager.goto(SCENES.MENU, {}, 'slide-right');
    }, 100);

    // Section: Characters
    this.add.text(400, 60, '── Characters ──', { fontSize: '14px', color: '#666' }).setOrigin(0.5);

    // Create 3 characters
    CHARACTER_TYPES.forEach((charType, i) => {
      const x = 200 + i * 200;
      const char = new PixelCharacter(this, x, 140, charType);
      this.add.existing(char);
      this.characters.push(char);

      // Add palette cycler component
      const cycler = char.addComponent(new PaletteCycler({ renderer: char.renderer }));
      this.paletteCyclers.push(cycler);

      // Character label
      this.add.text(x, 220, charType.toUpperCase(), { fontSize: '12px', color: '#888' }).setOrigin(0.5);
    });

    // Section: Creatures (vibe-game style)
    this.add.text(400, 250, '── Creatures (vibe-game style) ──', { fontSize: '14px', color: '#666' }).setOrigin(0.5);

    // Create creatures in 2 rows of 5
    const creaturesPerRow = 5;
    ALL_CREATURE_TYPES.forEach((type, i) => {
      const row = Math.floor(i / creaturesPerRow);
      const col = i % creaturesPerRow;
      const x = 120 + col * 140;
      const y = 320 + row * 100;

      const creature = new PixelCreature(this, x, y, type, 4);
      this.add.existing(creature);
      this.creatures.push(creature);

      // Creature label
      this.add.text(x, y + 45, type, { fontSize: '10px', color: '#777' }).setOrigin(0.5);
    });

    // Controls info
    this.add.text(400, 490, 'Press 1-4 to swap character palette | C to toggle cycling', {
      fontSize: '14px',
      color: '#aaa',
    }).setOrigin(0.5);

    // Palette labels
    PALETTE_NAMES.forEach((name, i) => {
      const text = this.add.text(150 + i * 150, 525, `${i + 1}: ${name}`, {
        fontSize: '12px',
        color: i === 0 ? '#fff' : '#666',
      }).setOrigin(0.5);
      this.paletteTexts.push(text);
    });

    // Info display
    this.infoText = this.add.text(400, 560, '', { fontSize: '11px', color: '#888' }).setOrigin(0.5);
    this.updateInfo();

    this.setupInput();
    Logger.info('PixelArt', `Scene loaded: ${CHARACTER_TYPES.length} characters, ${ALL_CREATURE_TYPES.length} creatures`);
  }

  private setupInput(): void {
    const keys = this.input.keyboard!;

    // Palette swap: 1-4
    keys.on('keydown-ONE', () => this.setPalette('normal'));
    keys.on('keydown-TWO', () => this.setPalette('fire'));
    keys.on('keydown-THREE', () => this.setPalette('ice'));
    keys.on('keydown-FOUR', () => this.setPalette('gold'));

    // Toggle cycling: C
    keys.on('keydown-C', () => this.toggleCycling());
  }

  private setPalette(name: keyof typeof PALETTES): void {
    this.currentPaletteName = name;
    this.characters.forEach((char) => char.setPalette(PALETTES[name]));
    Logger.info('PixelArt', `Palette: ${name}`);
    this.updatePaletteHighlight();
    this.updateInfo();
  }

  private toggleCycling(): void {
    const isCycling = this.paletteCyclers[0]?.cycling;
    this.paletteCyclers.forEach((cycler) => {
      if (isCycling) cycler.stop();
      else cycler.start();
    });
    Logger.info('PixelArt', `Palette cycling ${isCycling ? 'stopped' : 'started'}`);
    this.updateInfo();
  }

  private updatePaletteHighlight(): void {
    PALETTE_NAMES.forEach((name, i) => {
      this.paletteTexts[i].setColor(name === this.currentPaletteName ? '#fff' : '#666');
    });
  }

  private updateInfo(): void {
    const cycling = this.paletteCyclers[0]?.cycling ? 'ON' : 'OFF';
    const charFrames = this.characters.map((c) => c.renderer.frameIndex).join(',');
    this.infoText.setText(`Palette: ${this.currentPaletteName} | Cycling: ${cycling} | Char frames: [${charFrames}] | Creatures: ${this.creatures.length}`);
  }

  update(): void {
    this.updateInfo();
  }
}
