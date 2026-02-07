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

export interface EngineConfig {
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

export class Engine {
    private constructor() {}

    private static _app: PIXI.Application;
    private static _scenes: SceneManager;
    private static _input: InputManager;
    private static _assets: AssetManager;
    private static _sound: SoundManager;
    private static _particles: ParticleManager;
    private static _tween: TweenManager;
    private static _ui: UIManager;
    private static _spine: SpineManager;
    private static _toast: ToastManager;
    private static _alert: AlertManager;
    private static _modal: ModalManager;

    /** Signal emitted when engine is paused */
    public static readonly onPause = new Signal<void>();
    /** Signal emitted when engine is resumed */
    public static readonly onResume = new Signal<void>();
    /** Signal emitted when engine is resized */
    public static readonly onResize = new Signal<{ width: number; height: number; scale: number }>();
    /** Signal emitted when engine is updated */
    public static readonly onUpdate = new Signal<number>();

    /** Design resolution width (original config width) */
    private static _designWidth: number;
    /** Design resolution height (original config height) */
    private static _designHeight: number;
    /** Current scale mode */
    private static _scaleMode: ScaleMode;
    /** Current scale factor */
    private static _scale = 1;

    private static _isRunning = false;
    private static _resizeHandler: () => void;
    private static _initialized = false;

    /** Logger instance for consistent logging across the engine */
    public static readonly logger = Logger;

    public static get scenes(): SceneManager { return Engine._scenes; }
    public static get input(): InputManager { return Engine._input; }
    public static get assets(): AssetManager { return Engine._assets; }
    public static get sound(): SoundManager { return Engine._sound; }
    public static get particles(): ParticleManager { return Engine._particles; }
    public static get tween(): TweenManager { return Engine._tween; }
    public static get ui(): UIManager { return Engine._ui; }
    public static get spine(): SpineManager { return Engine._spine; }
    public static get toast(): ToastManager { return Engine._toast; }
    public static get alert(): AlertManager { return Engine._alert; }
    public static get modal(): ModalManager { return Engine._modal; }

    public static get app(): PIXI.Application { return Engine._app; }

    public static get view(): PIXI.ICanvas {
        return Engine._app.view;
    }

    public static get stage(): PIXI.Container {
        return Engine._app.stage;
    }

    /** Returns design resolution dimensions (use for positioning game elements) */
    public static get screen(): PIXI.Rectangle {
        return new PIXI.Rectangle(0, 0, Engine._designWidth, Engine._designHeight);
    }

    /** Returns actual renderer/viewport dimensions */
    public static get viewport(): PIXI.Rectangle {
        return Engine._app.screen;
    }

    public static get isRunning(): boolean {
        return Engine._isRunning;
    }

    /** Design resolution width (original config width) */
    public static get designWidth(): number {
        return Engine._designWidth;
    }

    /** Design resolution height (original config height) */
    public static get designHeight(): number {
        return Engine._designHeight;
    }

    /** Current scale mode */
    public static get scaleMode(): ScaleMode {
        return Engine._scaleMode;
    }

    public static set scaleMode(value: ScaleMode) {
        Engine._scaleMode = value;
    }

    /** Get current scale factor */
    public static get scale(): number {
        return Engine._scale;
    }

    /** Initialize the Engine. Throws if already initialized. */
    public static init(config: EngineConfig): void {
        if (Engine._initialized) {
            throw new Error('Engine already initialized. Call destroy() first to reinitialize.');
        }
        Engine._initialized = true;

        // Store design resolution and scale mode
        Engine._designWidth = config.width;
        Engine._designHeight = config.height;
        Engine._scaleMode = config.scaleMode ?? 'letterbox';

        // Create PIXI Application
        Engine._app = new PIXI.Application({
            width: config.width,
            height: config.height,
            backgroundColor: config.backgroundColor ?? 0x000000,
            antialias: config.antialias ?? true,
            resolution: config.resolution ?? window.devicePixelRatio,
            autoDensity: config.autoDensity ?? true,
        });

        // Enable z-index sorting on stage for overlays (modals, alerts, toasts)
        Engine._app.stage.sortableChildren = true;

        // Initialize managers
        Engine._scenes = new SceneManager();
        Engine._input = new InputManager();
        Engine._assets = new AssetManager();
        Engine._sound = new SoundManager();
        Engine._particles = new ParticleManager();
        Engine._tween = new TweenManager();
        Engine._ui = new UIManager();
        Engine._spine = new SpineManager();
        Engine._toast = new ToastManager(Engine._app.stage);
        Engine._alert = new AlertManager(Engine._app.stage);
        Engine._modal = new ModalManager(Engine._app.stage);

        // Setup auto-resize listener (initial resize must be called by app after adding canvas to DOM)
        Engine._resizeHandler = () => Engine.resizeToWindow();
        if (config.autoResize !== false) {
            window.addEventListener('resize', Engine._resizeHandler);
        }

        // Start game loop
        Engine._app.ticker.add(Engine.update);
        Engine._isRunning = true;
    }

    private static update(delta: number): void {
        Engine.onUpdate.emit(delta);

        // Update input (polls gamepads)
        Engine._input.update();

        // Update current scene
        Engine._scenes.update(delta);

        // Update particles
        Engine._particles.update(delta);

        // Clear per-frame input states
        Engine._input.postUpdate();
    }

    public static pause(): void {
        Engine._app.ticker.stop();
        Engine._isRunning = false;
        Engine.onPause.emit();
    }

    public static resume(): void {
        Engine._app.ticker.start();
        Engine._isRunning = true;
        Engine.onResume.emit();
    }

    /**
     * Get bounds in stage coordinates that cover the full viewport (including letterbox areas).
     * Use this for fullscreen overlays, backdrops, modals that need to cover the entire screen.
     */
    public static getFullscreenBounds(): { x: number; y: number; width: number; height: number } {
        const scale = Engine._scale || 1;
        const stagePos = Engine._app.stage.position;
        const resolution = Engine._app.renderer.resolution || 1;

        // Get renderer dimensions in CSS pixels
        const rendererWidth = Engine._app.renderer.width / resolution;
        const rendererHeight = Engine._app.renderer.height / resolution;

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
    public static resizeToWindow(): void {
        const parent = (Engine._app.view as HTMLCanvasElement).parentElement;
        const windowWidth = parent?.clientWidth ?? window.innerWidth;
        const windowHeight = parent?.clientHeight ?? window.innerHeight;
        Engine.resize(windowWidth, windowHeight);
    }

    /**
     * Resize engine to fit target dimensions while maintaining aspect ratio
     */
    public static resize(targetWidth: number, targetHeight: number): void {
        if (Engine._scaleMode === 'none') {
            // No scaling - just resize renderer
            Engine._app.renderer.resize(targetWidth, targetHeight);
            Engine._scale = 1;
            Engine._app.stage.scale.set(1);
            Engine._app.stage.position.set(0, 0);
            Engine.onResize.emit({ width: targetWidth, height: targetHeight, scale: 1 });
            return;
        }

        const designRatio = Engine._designWidth / Engine._designHeight;
        const targetRatio = targetWidth / targetHeight;

        let scale: number;

        if (Engine._scaleMode === 'letterbox') {
            // ShowAll/Letterbox: scale uniformly to fit entirely within target, may have bars
            scale = targetRatio > designRatio
                ? targetHeight / Engine._designHeight
                : targetWidth / Engine._designWidth;
        } else {
            // Fill: scale to cover entire target, may crop edges
            scale = targetRatio > designRatio
                ? targetWidth / Engine._designWidth
                : targetHeight / Engine._designHeight;
        }

        Engine._scale = scale;

        // Resize renderer to target dimensions
        Engine._app.renderer.resize(targetWidth, targetHeight);

        // Scale and center the stage
        Engine._app.stage.scale.set(scale);
        Engine._app.stage.position.set(
            (targetWidth - Engine._designWidth * scale) / 2,
            (targetHeight - Engine._designHeight * scale) / 2
        );

        Engine.onResize.emit({ width: targetWidth, height: targetHeight, scale });
    }

    public static destroy(): void {
        if (!Engine._initialized) return;

        window.removeEventListener('resize', Engine._resizeHandler);
        Engine._app.ticker.remove(Engine.update);
        Engine._input.destroy();
        Engine._scenes.destroy();
        Engine._sound.destroy();
        Engine._particles.destroy();
        Engine._tween.destroy();
        Engine._toast.destroy();
        Engine._alert.destroy();
        Engine._modal.destroy();
        Engine.onPause.clear();
        Engine.onResume.clear();
        Engine.onResize.clear();
        Engine._app.destroy(true, { children: true, texture: true });
        Engine._isRunning = false;
        Engine._initialized = false;
    }
}
