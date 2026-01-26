import Phaser from 'phaser';
import { Component } from '../game-objects/component';

/**
 * Component for rendering sprites.
 * Manages Phaser.GameObjects.Sprite lifecycle.
 *
 * @example
 * const player = new GameObject(scene, 100, 200);
 * const renderer = player.addComponent(new SpriteRenderer('player'));
 * renderer.tint = 0xff0000;
 */
export class SpriteRenderer extends Component {
  private sprite: Phaser.GameObjects.Sprite | null = null;
  private _textureKey: string;
  private _frame?: string | number;

  /** Tint color (0xFFFFFF = white/no tint) */
  private _tint = 0xffffff;

  /** Horizontal flip */
  private _flipX = false;

  /** Vertical flip */
  private _flipY = false;

  /** Render alpha (0-1) */
  private _alpha = 1;

  /** Depth/z-index for rendering order */
  private _depth = 0;

  /** Origin point (0-1) */
  private _origin = { x: 0.5, y: 0.5 };

  priority = 0; // Low priority - render after transforms

  constructor(textureKey: string, frame?: string | number) {
    super();
    this._textureKey = textureKey;
    this._frame = frame;
  }

  onAttach(): void {
    this.createSprite();
  }

  private createSprite(): void {
    this.sprite = this.scene.add.sprite(0, 0, this._textureKey, this._frame);
    this.sprite.setOrigin(this._origin.x, this._origin.y);
    this.sprite.setTint(this._tint);
    this.sprite.setFlip(this._flipX, this._flipY);
    this.sprite.setAlpha(this._alpha);
    this.sprite.setDepth(this._depth);

    // Add to owner container for proper positioning
    this.owner.add(this.sprite);
  }

  onDetach(): void {
    if (this.sprite) {
      this.sprite.destroy();
      this.sprite = null;
    }
  }

  /** Get underlying Phaser sprite */
  getSprite(): Phaser.GameObjects.Sprite | null {
    return this.sprite;
  }

  /** Change texture */
  setTexture(key: string, frame?: string | number): void {
    this._textureKey = key;
    this._frame = frame;
    if (this.sprite) {
      this.sprite.setTexture(key, frame);
    }
  }

  /** Set frame (for spritesheets) */
  setFrame(frame: string | number): void {
    this._frame = frame;
    if (this.sprite) {
      this.sprite.setFrame(frame);
    }
  }

  get tint(): number {
    return this._tint;
  }

  set tint(value: number) {
    this._tint = value;
    if (this.sprite) {
      this.sprite.setTint(value);
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

  get alpha(): number {
    return this._alpha;
  }

  set alpha(value: number) {
    this._alpha = value;
    if (this.sprite) {
      this.sprite.setAlpha(value);
    }
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

  setOrigin(x: number, y?: number): void {
    this._origin.x = x;
    this._origin.y = y ?? x;
    if (this.sprite) {
      this.sprite.setOrigin(this._origin.x, this._origin.y);
    }
  }

  /** Get sprite width (0 if no sprite) */
  get width(): number {
    return this.sprite?.width ?? 0;
  }

  /** Get sprite height (0 if no sprite) */
  get height(): number {
    return this.sprite?.height ?? 0;
  }
}
