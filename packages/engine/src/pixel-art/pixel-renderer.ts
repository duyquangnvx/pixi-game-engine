import Phaser from 'phaser';
import EventEmitter from 'eventemitter3';
import { Component } from '../game-objects/component';
import type {
  PixelSpriteData,
  PixelPalette,
  AnimationTag,
  PixelRendererConfig,
  PixelRendererEvents,
} from './pixel-sprite.types';

/**
 * Component for rendering indexed palette pixel art with animation and palette swapping.
 * Uses Phaser DynamicTexture for efficient pixel updates.
 *
 * @example
 * const renderer = obj.addComponent(new PixelRenderer({
 *   spriteData,
 *   scale: 4,
 *   defaultAnimation: 'idle',
 * }));
 * renderer.play('walk');
 * renderer.setPalette(FIRE_SKIN_PALETTE);
 */
export class PixelRenderer extends Component {
  priority = 0;

  readonly events = new EventEmitter<PixelRendererEvents>();

  private spriteData: PixelSpriteData;
  private currentPalette: PixelPalette;
  private dynamicTexture: Phaser.Textures.DynamicTexture | null = null;
  private sprite: Phaser.GameObjects.Sprite | null = null;
  private currentTag: AnimationTag | null = null;
  private currentFrameIndex = 0;
  private frameTimer = 0;
  private isPlaying = false;
  private isPaused = false;
  private pingpongReverse = false;

  private _scale: number;
  private _flipX = false;
  private _flipY = false;
  private _timeScale = 1;
  private _depth = 0;
  private _alpha = 1;
  private _origin = { x: 0.5, y: 0.5 };

  private textureKey: string;
  private repeatCount = 0;

  constructor(config: PixelRendererConfig) {
    super();
    this.spriteData = config.spriteData;
    this.currentPalette = { ...config.spriteData.palette };
    this._scale = config.scale ?? 1;
    this._timeScale = config.timeScale ?? 1;
    this.textureKey = `pixel_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    if (config.autoPlay !== false && config.defaultAnimation) {
      // Will play after attach
      this.currentTag =
        this.spriteData.tags.find((t) => t.name === config.defaultAnimation) ?? null;
    }
  }

  onAttach(): void {
    this.createTexture();
    this.createSprite();
    this.renderCurrentFrame();

    if (this.currentTag) {
      this.isPlaying = true;
    }
  }

  private createTexture(): void {
    const { width, height } = this.spriteData;
    this.dynamicTexture = this.scene.textures.addDynamicTexture(
      this.textureKey,
      width,
      height
    );
  }

  private createSprite(): void {
    this.sprite = this.scene.add.sprite(0, 0, this.textureKey);
    this.sprite.setOrigin(this._origin.x, this._origin.y);
    this.sprite.setScale(this._scale);
    this.sprite.setFlip(this._flipX, this._flipY);
    this.sprite.setDepth(this._depth);
    this.sprite.setAlpha(this._alpha);
    this.sprite.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
    this.owner.add(this.sprite);
  }

  private renderCurrentFrame(): void {
    if (!this.dynamicTexture) return;

    const frame = this.spriteData.frames[this.currentFrameIndex];
    if (!frame) return;

    const { width, height, indexedData } = frame;
    const rgbaData = new Uint8ClampedArray(width * height * 4);

    for (let i = 0; i < indexedData.length; i++) {
      const colorIdx = indexedData[i];
      const color = this.currentPalette.colors[colorIdx] ?? [0, 0, 0, 0];
      const offset = i * 4;
      rgbaData[offset] = color[0];
      rgbaData[offset + 1] = color[1];
      rgbaData[offset + 2] = color[2];
      rgbaData[offset + 3] = color[3];
    }

    // Use canvas context to put image data
    const ctx = this.dynamicTexture.context;
    ctx.putImageData(new ImageData(rgbaData, width, height), 0, 0);
    this.dynamicTexture.dirty = true;
  }

  update(dt: number): void {
    if (!this.isPlaying || this.isPaused || !this.currentTag) return;

    const frame = this.spriteData.frames[this.currentFrameIndex];
    if (!frame) return;

    this.frameTimer += dt * this._timeScale;

    if (this.frameTimer >= frame.duration) {
      this.frameTimer -= frame.duration;
      this.advanceFrame();
    }
  }

  private advanceFrame(): void {
    if (!this.currentTag) return;

    const { from, to, direction, repeat } = this.currentTag;
    let nextIndex = this.currentFrameIndex;

    if (direction === 'forward') {
      nextIndex++;
      if (nextIndex > to) {
        if (repeat !== 0 && ++this.repeatCount >= repeat) {
          this.onAnimationComplete();
          return;
        }
        nextIndex = from;
      }
    } else if (direction === 'reverse') {
      nextIndex--;
      if (nextIndex < from) {
        if (repeat !== 0 && ++this.repeatCount >= repeat) {
          this.onAnimationComplete();
          return;
        }
        nextIndex = to;
      }
    } else {
      // pingpong
      if (this.pingpongReverse) {
        nextIndex--;
        if (nextIndex < from) {
          if (repeat !== 0 && ++this.repeatCount >= repeat) {
            this.onAnimationComplete();
            return;
          }
          nextIndex = from + 1;
          this.pingpongReverse = false;
        }
      } else {
        nextIndex++;
        if (nextIndex > to) {
          nextIndex = to - 1;
          this.pingpongReverse = true;
        }
      }
    }

    this.setFrameInternal(nextIndex);
  }

  private setFrameInternal(index: number): void {
    const prevIndex = this.currentFrameIndex;
    this.currentFrameIndex = index;
    this.renderCurrentFrame();

    if (prevIndex !== index && this.currentTag) {
      this.events.emit('frameChange', index, this.currentTag.name);
    }
  }

  private onAnimationComplete(): void {
    this.isPlaying = false;
    if (this.currentTag) {
      this.events.emit('animationComplete', this.currentTag.name);
    }
  }

  // Public API

  play(tagName: string, restart = false): void {
    const tag = this.spriteData.tags.find((t) => t.name === tagName);
    if (!tag) {
      console.warn(`PixelRenderer: Animation tag "${tagName}" not found`);
      return;
    }

    if (!restart && this.currentTag?.name === tagName && this.isPlaying) {
      return;
    }

    this.currentTag = tag;
    this.currentFrameIndex = tag.direction === 'reverse' ? tag.to : tag.from;
    this.frameTimer = 0;
    this.repeatCount = 0;
    this.pingpongReverse = false;
    this.isPlaying = true;
    this.isPaused = false;
    this.renderCurrentFrame();
  }

  stop(): void {
    this.isPlaying = false;
    this.isPaused = false;
    this.currentTag = null;
  }

  pause(): void {
    this.isPaused = true;
  }

  resume(): void {
    this.isPaused = false;
  }

  setFrame(index: number): void {
    if (index < 0 || index >= this.spriteData.frames.length) {
      console.warn(`PixelRenderer: Frame index ${index} out of bounds`);
      return;
    }
    this.setFrameInternal(index);
  }

  setPalette(palette: PixelPalette): void {
    if (palette.colors.length !== this.spriteData.palette.colors.length) {
      throw new Error(
        `Palette size mismatch: expected ${this.spriteData.palette.colors.length}, ` +
          `got ${palette.colors.length}`
      );
    }
    this.currentPalette = palette;
    this.renderCurrentFrame();
    this.events.emit('paletteChange', palette);
  }

  setSpriteData(data: PixelSpriteData): void {
    this.spriteData = data;
    this.currentPalette = { ...data.palette };
    this.currentFrameIndex = 0;
    this.frameTimer = 0;
    this.currentTag = null;
    this.isPlaying = false;

    // Recreate texture if dimensions changed
    if (this.dynamicTexture) {
      this.scene.textures.remove(this.textureKey);
      this.createTexture();
      if (this.sprite) {
        this.sprite.setTexture(this.textureKey);
      }
    }

    this.renderCurrentFrame();
  }

  get current(): string | null {
    return this.currentTag?.name ?? null;
  }

  get frameIndex(): number {
    return this.currentFrameIndex;
  }

  get scale(): number {
    return this._scale;
  }

  set scale(value: number) {
    this._scale = value;
    if (this.sprite) {
      this.sprite.setScale(value);
    }
  }

  get flipX(): boolean {
    return this._flipX;
  }

  set flipX(value: boolean) {
    this._flipX = value;
    if (this.sprite) {
      this.sprite.setFlipX(value);
    }
  }

  get flipY(): boolean {
    return this._flipY;
  }

  set flipY(value: boolean) {
    this._flipY = value;
    if (this.sprite) {
      this.sprite.setFlipY(value);
    }
  }

  get timeScale(): number {
    return this._timeScale;
  }

  set timeScale(value: number) {
    this._timeScale = value;
  }

  get depth(): number {
    return this._depth;
  }

  set depth(value: number) {
    this._depth = value;
    if (this.sprite) {
      this.sprite.setDepth(value);
    }
  }

  get alpha(): number {
    return this._alpha;
  }

  set alpha(value: number) {
    this._alpha = value;
    if (this.sprite) {
      this.sprite.setAlpha(value);
    }
  }

  setOrigin(x: number, y?: number): void {
    this._origin.x = x;
    this._origin.y = y ?? x;
    if (this.sprite) {
      this.sprite.setOrigin(this._origin.x, this._origin.y);
    }
  }

  getSprite(): Phaser.GameObjects.Sprite | null {
    return this.sprite;
  }

  onDetach(): void {
    this.stop();
    this.events.removeAllListeners();

    if (this.sprite) {
      this.sprite.destroy();
      this.sprite = null;
    }

    if (this.dynamicTexture) {
      this.scene.textures.remove(this.textureKey);
      this.dynamicTexture = null;
    }
  }
}
