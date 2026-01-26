import Phaser from 'phaser';
import {
  GameObject,
  SceneManager,
  DebugOverlay,
  Logger,
  InputManager,
  AudioManager,
  StorageManager,
} from '@pge/core';
import { SCENES, COLORS } from '../constants';
import { UIButton } from '../prefabs/ui-button';

/**
 * Playground scene demonstrating Transform hierarchy, Input, Audio, and Storage
 */
export class PlaygroundScene extends Phaser.Scene {
  private inputManager!: InputManager;
  private audioManager!: AudioManager;
  private storageManager!: StorageManager;

  private parentObj!: GameObject;
  private inputDisplay!: Phaser.GameObjects.Text;
  private volumeText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: SCENES.PLAYGROUND });
  }

  create(): void {
    new DebugOverlay(this);
    const sceneManager = new SceneManager(this.game);

    // Initialize managers
    this.inputManager = new InputManager(this);
    this.audioManager = new AudioManager(this);
    this.storageManager = new StorageManager('pge-demo');

    // Title
    this.add.text(400, 30, 'Playground', {
      fontSize: '28px',
      color: '#fff',
    }).setOrigin(0.5);

    // Back button
    new UIButton(this, 70, 30, '< Back', () => {
      sceneManager.goto(SCENES.MENU, {}, 'fade');
    }, 100);

    this.createHierarchyDemo();
    this.createInputDemo();
    this.createAudioDemo();

    Logger.info('Playground', 'Scene loaded');
  }

  private createHierarchyDemo(): void {
    // Section title
    this.add.text(150, 90, 'Transform Hierarchy', {
      fontSize: '16px',
      color: '#aaa',
    }).setOrigin(0.5);

    // Parent object
    this.parentObj = new GameObject(this, 150, 220, { name: 'Parent' });
    const parentGfx = this.add.rectangle(0, 0, 30, 30, COLORS.accent);
    this.parentObj.add(parentGfx);
    this.add.existing(this.parentObj);

    // Child 1 (orbiting)
    const child1 = this.add.rectangle(60, 0, 15, 15, 0x00ff00);
    this.parentObj.add(child1);

    // Child 2 (opposite side)
    const child2 = this.add.rectangle(-60, 0, 15, 15, 0x0088ff);
    this.parentObj.add(child2);

    this.add.text(150, 340, 'Parent rotates\nchildren follow', {
      fontSize: '12px',
      color: '#666',
      align: 'center',
    }).setOrigin(0.5);
  }

  private createInputDemo(): void {
    // Section title
    this.add.text(400, 90, 'Input Manager', {
      fontSize: '16px',
      color: '#aaa',
    }).setOrigin(0.5);

    // Register input bindings
    this.inputManager.bindAction('move_up', {
      keys: [Phaser.Input.Keyboard.KeyCodes.W, Phaser.Input.Keyboard.KeyCodes.UP],
    });
    this.inputManager.bindAction('move_down', {
      keys: [Phaser.Input.Keyboard.KeyCodes.S, Phaser.Input.Keyboard.KeyCodes.DOWN],
    });
    this.inputManager.bindAction('move_left', {
      keys: [Phaser.Input.Keyboard.KeyCodes.A, Phaser.Input.Keyboard.KeyCodes.LEFT],
    });
    this.inputManager.bindAction('move_right', {
      keys: [Phaser.Input.Keyboard.KeyCodes.D, Phaser.Input.Keyboard.KeyCodes.RIGHT],
    });
    this.inputManager.bindAction('action', {
      keys: [Phaser.Input.Keyboard.KeyCodes.SPACE],
    });

    // Display
    this.inputDisplay = this.add.text(400, 220, 'Press WASD/Arrows/Space', {
      fontSize: '18px',
      color: '#fff',
      align: 'center',
    }).setOrigin(0.5);

    this.add.text(400, 340, 'Actions bound:\nmove_up/down/left/right\naction', {
      fontSize: '12px',
      color: '#666',
      align: 'center',
    }).setOrigin(0.5);
  }

  private createAudioDemo(): void {
    // Section title
    this.add.text(650, 90, 'Audio + Storage', {
      fontSize: '16px',
      color: '#aaa',
    }).setOrigin(0.5);

    // Load saved volume
    const savedVol = this.storageManager.load<number>('sfxVolume', 1);
    this.audioManager.setSfxVolume(savedVol ?? 1);

    // Volume display
    this.volumeText = this.add.text(650, 180, `SFX Vol: ${Math.round(this.audioManager.sfxVolume * 100)}%`, {
      fontSize: '18px',
      color: '#fff',
    }).setOrigin(0.5);

    // Volume controls
    this.add.text(650, 230, 'Press [ - ] or [ + ] to adjust', {
      fontSize: '12px',
      color: '#888',
    }).setOrigin(0.5);

    // Key handlers
    this.input.keyboard!.on('keydown-MINUS', () => this.adjustVolume(-0.1));
    this.input.keyboard!.on('keydown-PLUS', () => this.adjustVolume(0.1));
    this.input.keyboard!.on('keydown-EQUAL', () => this.adjustVolume(0.1)); // = key (shift for +)

    this.add.text(650, 340, 'StorageManager saves\nvolume preference', {
      fontSize: '12px',
      color: '#666',
      align: 'center',
    }).setOrigin(0.5);

    // Feature list
    this.add.text(400, 500, 'Features: GameObject, InputManager, AudioManager, StorageManager, DebugOverlay', {
      fontSize: '11px',
      color: '#444',
    }).setOrigin(0.5);
  }

  private adjustVolume(delta: number): void {
    const newVol = Phaser.Math.Clamp(this.audioManager.sfxVolume + delta, 0, 1);
    this.audioManager.setSfxVolume(newVol);
    this.storageManager.save('sfxVolume', newVol);
    this.volumeText.setText(`SFX Vol: ${Math.round(newVol * 100)}%`);
    Logger.info('Playground', `Volume: ${Math.round(newVol * 100)}%`);
  }

  update(_time: number, _delta: number): void {
    // Rotate parent (children follow)
    this.parentObj.rotation += 0.02;

    // Update input display
    const actions: string[] = [];
    if (this.inputManager.isActionDown('move_up')) actions.push('UP');
    if (this.inputManager.isActionDown('move_down')) actions.push('DOWN');
    if (this.inputManager.isActionDown('move_left')) actions.push('LEFT');
    if (this.inputManager.isActionDown('move_right')) actions.push('RIGHT');
    if (this.inputManager.isActionDown('action')) actions.push('ACTION');

    this.inputDisplay.setText(actions.length > 0 ? actions.join(' + ') : 'Press WASD/Arrows/Space');
  }
}
