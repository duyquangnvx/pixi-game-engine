/**
 * Transition types for scene switching.
 */
export type TransitionType = 'none' | 'fade' | 'slide-left' | 'slide-right' | 'slide-up' | 'slide-down';

/**
 * Configuration for scene transitions.
 */
export interface TransitionConfig {
  type: TransitionType;
  duration?: number;
  ease?: string;
  color?: number;
}

/**
 * Asset manifest item for preloading.
 */
export interface AssetManifestItem {
  key: string;
  type: 'image' | 'spritesheet' | 'audio' | 'json' | 'atlas' | 'spine';
  url: string;
  /** For spritesheets */
  frameConfig?: Phaser.Types.Loader.FileTypes.ImageFrameConfig;
  /** For atlas/spine */
  atlasUrl?: string;
}

/**
 * Scene initialization data.
 */
export interface SceneData {
  [key: string]: unknown;
}

/**
 * Loading progress callback.
 */
export type LoadProgressCallback = (progress: number, file?: string) => void;
