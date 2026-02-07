import * as PIXI from 'pixi.js';
import { AlertManager } from '../ui/alert/alert-manager';
import { AssetManager } from '../assets/asset-manager';
import { InputManager } from '../input/input-manager';
import { ModalManager } from '../ui/modal/modal-manager';
import { ParticleManager } from '../particles/particle-manager';
import { SceneManager } from '../scenes/scene-manager';
import { Signal } from './signal';
import { SoundManager } from '../sound/sound-manager';
import { SpineManager } from '../spine/spine-manager';
import { ToastManager } from '../ui/toast/toast-manager';
import { TweenManager } from '../tween/tween-manager';
import { UIManager } from '../ui/ui-manager';
import { Logger } from '../utils';

export type ScaleMode = 'none' | 'letterbox' | 'fill';

export interface GameConfig {
    width: number;
    height: number;
    backgroundColor?: number;
    antialias?: boolean;
    resolution?: number;
    autoDensity?: boolean;
    /** Scale mode for responsive resizing. Default: 'letterbox' */
    scaleMode?: ScaleMode;
    /** Auto-resize on window resize. Default: true */
    autoResize?: boolean;
}

export class Game {
    private static _instance: Game | null = null;

    /** Get the singleton Game instance. Throws if not initialized. */
    public static get instance(): Game {
        if (!Game._instance) {
            throw new Error('Game not initialized. Call Game.init() first.');
        }
        return Game._instance;
    }

    /** Initialize the Game singleton. Throws if already initialized. */
    public static init(config: GameConfig): Game {
        if (Game._instance) {
            throw new Error('Game already initialized. Call destroy() first to reinitialize.');
        }
        // Note: _instance is set inside the constructor before managers are created
        return new Game(config);
    }

    public readonly app: PIXI.Application;
    public readonly scenes: SceneManager;
    public readonly input: InputManager;
    public readonly assets: AssetManager;
    public readonly sound: SoundManager;
    public readonly particles: ParticleManager;
    public readonly tween: TweenManager;
    public readonly ui: UIManager;
    public readonly spine: SpineManager;
    public readonly toast: ToastManager;
    public readonly alert: AlertManager;
    public readonly modal: ModalManager;
    /** Logger instance for consistent logging across the game */
    public readonly logger = Logger;

    /** Signal emitted when game is paused */
    public readonly onPause = new Signal<void>();
    /** Signal emitted when game is resumed */
    public readonly onResume = new Signal<void>();
    /** Signal emitted when game is resized */
    public readonly onResize = new Signal<{ width: number; height: number; scale: number }>();
    /** Signal emitted when game is updated */
    public readonly onUpdate = new Signal<number>();

    /** Design resolution width (original config width) */
    public readonly designWidth: number;
    /** Design resolution height (original config height) */
    public readonly designHeight: number;
    /** Current scale mode */
    public scaleMode: ScaleMode;
    /** Current scale factor */
    private _scale = 1;

    private _isRunning = false;
    private readonly _resizeHandler: () => void;

    private constructor(config: GameConfig) {
        // Set singleton instance FIRST so managers can access Game.instance during construction
        Game._instance = this;

        // Store design resolution and scale mode
        this.designWidth = config.width;
        this.designHeight = config.height;
        this.scaleMode = config.scaleMode ?? 'letterbox';

        // Create PIXI Application
        this.app = new PIXI.Application({
            width: config.width,
            height: config.height,
            backgroundColor: config.backgroundColor ?? 0x000000,
            antialias: config.antialias ?? true,
            resolution: config.resolution ?? window.devicePixelRatio,
            autoDensity: config.autoDensity ?? true,
        });

        // Enable z-index sorting on stage for overlays (modals, alerts, toasts)
        this.app.stage.sortableChildren = true;

        // Initialize managers
        this.scenes = new SceneManager();
        this.input = new InputManager();
        this.assets = new AssetManager();
        this.sound = new SoundManager();
        this.particles = new ParticleManager();
        this.tween = new TweenManager();
        this.ui = new UIManager();
        this.spine = new SpineManager();
        this.toast = new ToastManager(this.app.stage);
        this.alert = new AlertManager(this.app.stage);
        this.modal = new ModalManager(this.app.stage);

        // Setup auto-resize listener (initial resize must be called by app after adding canvas to DOM)
        this._resizeHandler = () => this.resizeToWindow();
        if (config.autoResize !== false) {
            window.addEventListener('resize', this._resizeHandler);
        }

        // Start game loop
        this.app.ticker.add(this.update, this);
        this._isRunning = true;
    }

    private update(delta: number): void {
        this.onUpdate.emit(delta);

        // Update input (polls gamepads)
        this.input.update();

        // Update current scene
        this.scenes.update(delta);

        // Update particles
        this.particles.update(delta);

        // Clear per-frame input states
        this.input.postUpdate();
    }

    public get view(): PIXI.ICanvas {
        return this.app.view;
    }

    public get stage(): PIXI.Container {
        return this.app.stage;
    }

    /** Returns design resolution dimensions (use for positioning game elements) */
    public get screen(): PIXI.Rectangle {
        return new PIXI.Rectangle(0, 0, this.designWidth, this.designHeight);
    }

    /** Returns actual renderer/viewport dimensions */
    public get viewport(): PIXI.Rectangle {
        return this.app.screen;
    }

    public get isRunning(): boolean {
        return this._isRunning;
    }

    public pause(): void {
        this.app.ticker.stop();
        this._isRunning = false;
        this.onPause.emit();
    }

    public resume(): void {
        this.app.ticker.start();
        this._isRunning = true;
        this.onResume.emit();
    }

    /** Get current scale factor */
    public get scale(): number {
        return this._scale;
    }

    /**
     * Get bounds in stage coordinates that cover the full viewport (including letterbox areas).
     * Use this for fullscreen overlays, backdrops, modals that need to cover the entire screen.
     */
    public getFullscreenBounds(): { x: number; y: number; width: number; height: number } {
        const scale = this._scale || 1;
        const stagePos = this.app.stage.position;
        const resolution = this.app.renderer.resolution || 1;

        // Get renderer dimensions in CSS pixels
        const rendererWidth = this.app.renderer.width / resolution;
        const rendererHeight = this.app.renderer.height / resolution;

        // Convert to stage coordinates (inverse transform)
        return {
            x: -stagePos.x / scale,
            y: -stagePos.y / scale,
            width: rendererWidth / scale,
            height: rendererHeight / scale,
        };
    }

    /**
     * Resize to fit window while maintaining aspect ratio based on scaleMode
     */
    public resizeToWindow(): void {
        const parent = (this.app.view as HTMLCanvasElement).parentElement;
        const windowWidth = parent?.clientWidth ?? window.innerWidth;
        const windowHeight = parent?.clientHeight ?? window.innerHeight;
        this.resize(windowWidth, windowHeight);
    }

    /**
     * Resize game to fit target dimensions while maintaining aspect ratio
     */
    public resize(targetWidth: number, targetHeight: number): void {
        if (this.scaleMode === 'none') {
            // No scaling - just resize renderer
            this.app.renderer.resize(targetWidth, targetHeight);
            this._scale = 1;
            this.app.stage.scale.set(1);
            this.app.stage.position.set(0, 0);
            this.propagateResize(targetWidth, targetHeight);
            this.onResize.emit({ width: targetWidth, height: targetHeight, scale: 1 });
            return;
        }

        const designRatio = this.designWidth / this.designHeight;
        const targetRatio = targetWidth / targetHeight;

        let scale: number;

        if (this.scaleMode === 'letterbox') {
            // ShowAll/Letterbox: scale uniformly to fit entirely within target, may have bars
            scale = targetRatio > designRatio
                ? targetHeight / this.designHeight
                : targetWidth / this.designWidth;
        } else {
            // Fill: scale to cover entire target, may crop edges
            scale = targetRatio > designRatio
                ? targetWidth / this.designWidth
                : targetHeight / this.designHeight;
        }

        this._scale = scale;

        // Resize renderer to target dimensions
        this.app.renderer.resize(targetWidth, targetHeight);

        // Scale and center the stage
        this.app.stage.scale.set(scale);
        this.app.stage.position.set(
            (targetWidth - this.designWidth * scale) / 2,
            (targetHeight - this.designHeight * scale) / 2
        );

        this.propagateResize(targetWidth, targetHeight);
        this.onResize.emit({ width: targetWidth, height: targetHeight, scale });
    }

    /**
     * Propagate resize to all managers that need viewport dimensions
     * Note: Toast/BaseModal auto-resize via Game.instance.onResize signal
     */
    private propagateResize(_width: number, _height: number): void {
        // All UI managers now auto-resize via onResize signal
    }

    public destroy(): void {
        window.removeEventListener('resize', this._resizeHandler);
        this.app.ticker.remove(this.update, this);
        this.input.destroy();
        this.scenes.destroy();
        this.sound.destroy();
        this.particles.destroy();
        this.tween.destroy();
        this.toast.destroy();
        this.alert.destroy();
        this.modal.destroy();
        this.onPause.clear();
        this.onResume.clear();
        this.onResize.clear();
        this.app.destroy(true, { children: true, texture: true });
        this._isRunning = false;
        Game._instance = null;
    }
}
