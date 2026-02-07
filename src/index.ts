// Core
export { Engine, Signal } from './core';
export type { EngineConfig, ScaleMode, SignalBinding } from './core';

// Scenes
export { Scene, SceneManager } from './scenes';

// Input
export { InputManager, KeyboardManager, PointerManager, GamepadManager } from './input';

// Assets
export { AssetManager } from './assets';
export type { AssetBundle, AssetEntry, AssetManifest } from './assets';

// Sound
export { SoundManager } from './sound';

// Particles
export { ParticleManager } from './particles';

// Tween
export { TweenManager } from './tween';

// Spine
export { SpineManager } from './spine';

// UI
export {
    UIManager,
    BaseModal,
    ModalManager,
    AlertManager,
    ToastManager,
    createTheme,
    TOAST_PRESETS,
    getPreset,
    getDefaultColors,
} from './ui';
export type {
    BaseModalConfig,
    CloseButtonPosition,
    ModalAnimation,
    ModalButtonConfig,
    AlertButton,
    AlertConfig,
    AlertType,
    ToastColorSet,
    ToastConfig,
    ToastManagerConfig,
    ToastTheme,
    ToastThemePreset,
    ToastType,
} from './ui';

// Animations
export { CountAnimator, TextCountRenderer, COUNT_PRESETS, getCountPreset } from './animations';
export type { CountAnimatorConfig, CountPreset, ICountRenderer } from './animations';

// Utils
export { Logger, LoggerClass } from './utils';
export type { LogLevel } from './utils';

// Re-export PIXI for convenience
export * as PIXI from 'pixi.js';
export type { ISkeletonData } from 'pixi-spine';
export { Spine } from 'pixi-spine';
