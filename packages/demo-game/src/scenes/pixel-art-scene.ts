import Phaser from 'phaser';
import { SceneManager, DebugOverlay, Logger } from '@pge/core';
import { SCENES } from '../constants';
import { PixelCharacter, PALETTES, CharacterType } from '../prefabs/pixel-characters';
import { PaletteCycler } from '../components/palette-cycler';
import { UIButton } from '../prefabs/ui-button';

const PALETTE_NAMES = ['normal', 'fire', 'ice', 'gold'] as const;
const CHARACTER_TYPES: CharacterType[] = ['warrior', 'mage', 'robot'];

/**
 * Pixel art showcase demonstrating PixelRenderer, PixelArtBuilder, and palette swap
 */
export class PixelArtScene extends Phaser.Scene {
  private characters: PixelCharacter[] = [];
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
    this.add.text(400, 30, 'Pixel Art Showcase', {
      fontSize: '28px',
      color: '#fff',
    }).setOrigin(0.5);

    // Back button
    new UIButton(this, 70, 30, '< Back', () => {
      sceneManager.goto(SCENES.MENU, {}, 'slide-right');
    }, 100);

    // Create 3 characters
    CHARACTER_TYPES.forEach((charType, i) => {
      const x = 200 + i * 200;
      const char = new PixelCharacter(this, x, 230, charType);
      this.add.existing(char);
      this.characters.push(char);

      // Add palette cycler component
      const cycler = char.addComponent(new PaletteCycler({ renderer: char.renderer }));
      this.paletteCyclers.push(cycler);

      // Character label
      this.add.text(x, 350, charType.toUpperCase(), {
        fontSize: '14px',
        color: '#aaa',
      }).setOrigin(0.5);
    });

    // Controls info
    this.add.text(400, 420, 'Press 1-4 to swap palette | C to toggle color cycling', {
      fontSize: '16px',
      color: '#aaa',
    }).setOrigin(0.5);

    // Palette labels
    PALETTE_NAMES.forEach((name, i) => {
      const text = this.add.text(150 + i * 150, 470, `${i + 1}: ${name}`, {
        fontSize: '14px',
        color: i === 0 ? '#fff' : '#666',
      }).setOrigin(0.5);
      this.paletteTexts.push(text);
    });

    // Info display
    this.infoText = this.add.text(400, 530, '', {
      fontSize: '12px',
      color: '#888',
    }).setOrigin(0.5);
    this.updateInfo();

    this.setupInput();
    Logger.info('PixelArt', 'Scene loaded with 3 characters');
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
    const frames = this.characters.map((c) => c.renderer.frameIndex).join(', ');
    this.infoText.setText(`Palette: ${this.currentPaletteName} | Cycling: ${cycling} | Frames: [${frames}]`);
  }

  update(): void {
    this.updateInfo();
  }
}
