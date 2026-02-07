// Core

// Signals
export { Signal } from './signals/signal';
export type { SignalBinding } from './signals/signal';

// Animations
export { CountAnimator, TextCountRenderer, COUNT_PRESETS, getCountPreset } from './animations';
export type { CountAnimatorConfig, CountPreset, ICountRenderer } from './animations';

// Re-export PIXI for convenience
export * as PIXI from 'pixi.js';
export type { ISkeletonData } from 'pixi-spine';
export { Spine } from 'pixi-spine';
// Alert
export { AlertManager } from './alert/alert-manager';
export type { AlertButton, AlertConfig, AlertType } from './alert/alert-manager';
// Modal
export { BaseModal } from './modal/base-modal';
export type {
    BaseModalConfig,
    CloseButtonPosition,
    ModalAnimation,
    ModalButtonConfig,
} from './modal/base-modal';
export { ModalManager } from './modal/modal-manager';
// Assets
export { AssetManager } from './assets/asset-manager';
export type { AssetBundle, AssetEntry, AssetManifest } from './assets/types';
export type { GameConfig, ScaleMode } from './core/game';
export { Game } from './core/game';
export { GamepadManager } from './input/gamepad';
// Input
export { InputManager } from './input/input-manager';
export { KeyboardManager } from './input/keyboard';
export { PointerManager } from './input/pointer';
// Particles
export { ParticleManager } from './particles/particle-manager';
// Scenes
export { Scene } from './scenes/scene';
export { SceneManager } from './scenes/scene-manager';
// Sound
export { SoundManager } from './sound/sound-manager';
// Spine
export { SpineManager } from './spine/spine-manager';
// Toast
export { createTheme, ToastManager, TOAST_PRESETS, getPreset, getDefaultColors } from './toast';
export type {
    ToastColorSet,
    ToastConfig,
    ToastManagerConfig,
    ToastTheme,
    ToastThemePreset,
    ToastType,
} from './toast';
// Tween
export { TweenManager } from './tween/tween-manager';
// UI
export { UIManager } from './ui/ui-manager';
// Utils
export { Logger, LoggerClass } from './utils';
export type { LogLevel } from './utils';
