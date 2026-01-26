import Phaser from 'phaser';
import type { AssetManifestItem } from '../types/scene.types';
import type { SpineLoader } from '../types/spine-plugin.types';

/**
 * Configurable loading scene template.
 * Extend and customize for your game's loading screen.
 *
 * @example
 * class MyLoadingScene extends LoadingScene {
 *   constructor() {
 *     super('LoadingScene', {
 *       backgroundColor: 0x1a1a2e,
 *       barColor: 0x4ecca3,
 *       barWidth: 400,
 *       barHeight: 20,
 *     });
 *   }
 * }
 */
export interface LoadingSceneConfig {
  /** Background color */
  backgroundColor?: number;
  /** Progress bar fill color */
  barColor?: number;
  /** Progress bar background color */
  barBgColor?: number;
  /** Bar width in pixels */
  barWidth?: number;
  /** Bar height in pixels */
  barHeight?: number;
  /** Show percentage text */
  showPercentage?: boolean;
  /** Show current file being loaded */
  showFileName?: boolean;
}

export class LoadingScene extends Phaser.Scene {
  protected config: Required<LoadingSceneConfig>;
  protected progressBar!: Phaser.GameObjects.Graphics;
  protected progressBg!: Phaser.GameObjects.Graphics;
  protected percentText?: Phaser.GameObjects.Text;
  protected fileText?: Phaser.GameObjects.Text;

  /** Assets to load - set before starting scene */
  private assetsToLoad: AssetManifestItem[] = [];
  /** Scene to start after loading */
  private nextScene: string = '';
  /** Data to pass to next scene */
  private nextSceneData: Record<string, unknown> = {};

  constructor(key = 'LoadingScene', config: LoadingSceneConfig = {}) {
    super({ key });

    this.config = {
      backgroundColor: config.backgroundColor ?? 0x000000,
      barColor: config.barColor ?? 0x4ecca3,
      barBgColor: config.barBgColor ?? 0x333333,
      barWidth: config.barWidth ?? 400,
      barHeight: config.barHeight ?? 20,
      showPercentage: config.showPercentage ?? true,
      showFileName: config.showFileName ?? true,
    };
  }

  /**
   * Initialize with assets to load and next scene.
   */
  init(data: { assets?: AssetManifestItem[]; nextScene: string; nextSceneData?: Record<string, unknown> }): void {
    this.assetsToLoad = data.assets ?? [];
    this.nextScene = data.nextScene;
    this.nextSceneData = data.nextSceneData ?? {};
  }

  create(): void {
    const { width, height } = this.cameras.main;
    const { barWidth, barHeight, barBgColor, showPercentage, showFileName } = this.config;

    // Background
    this.cameras.main.setBackgroundColor(this.config.backgroundColor);

    // Progress bar background
    const barX = (width - barWidth) / 2;
    const barY = height / 2;

    this.progressBg = this.add.graphics();
    this.progressBg.fillStyle(barBgColor, 1);
    this.progressBg.fillRect(barX, barY, barWidth, barHeight);

    // Progress bar
    this.progressBar = this.add.graphics();

    // Percentage text
    if (showPercentage) {
      this.percentText = this.add.text(width / 2, barY - 30, '0%', {
        fontSize: '24px',
        color: '#ffffff',
      });
      this.percentText.setOrigin(0.5);
    }

    // File name text
    if (showFileName) {
      this.fileText = this.add.text(width / 2, barY + barHeight + 20, '', {
        fontSize: '14px',
        color: '#888888',
      });
      this.fileText.setOrigin(0.5);
    }

    // Load events
    this.load.on('progress', this.onProgress, this);
    this.load.on('fileprogress', this.onFileProgress, this);
    this.load.on('complete', this.onComplete, this);

    // Load assets
    this.loadAssets();
    this.load.start();
  }

  private loadAssets(): void {
    for (const asset of this.assetsToLoad) {
      switch (asset.type) {
        case 'image':
          this.load.image(asset.key, asset.url);
          break;
        case 'spritesheet':
          this.load.spritesheet(asset.key, asset.url, asset.frameConfig);
          break;
        case 'audio':
          this.load.audio(asset.key, asset.url);
          break;
        case 'json':
          this.load.json(asset.key, asset.url);
          break;
        case 'atlas':
          this.load.atlas(asset.key, asset.url, asset.atlasUrl);
          break;
        case 'spine': {
          const spineLoader = this.load as SpineLoader;
          if (spineLoader.spine && asset.atlasUrl) {
            spineLoader.spine(asset.key, asset.url, asset.atlasUrl);
          }
          break;
        }
      }
    }
  }

  protected onProgress(value: number): void {
    const { width, height } = this.cameras.main;
    const { barWidth, barHeight, barColor } = this.config;

    const barX = (width - barWidth) / 2;
    const barY = height / 2;

    this.progressBar.clear();
    this.progressBar.fillStyle(barColor, 1);
    this.progressBar.fillRect(barX, barY, barWidth * value, barHeight);

    if (this.percentText) {
      this.percentText.setText(`${Math.round(value * 100)}%`);
    }
  }

  protected onFileProgress(file: Phaser.Loader.File): void {
    if (this.fileText) {
      this.fileText.setText(`Loading: ${file.key}`);
    }
  }

  protected onComplete(): void {
    this.scene.start(this.nextScene, this.nextSceneData);
  }
}
