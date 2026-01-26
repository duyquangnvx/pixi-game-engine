/**
 * Type declarations for @esotericsoftware/spine-phaser
 * These types allow usage without requiring the package as a hard dependency.
 *
 * @see http://en.esotericsoftware.com/spine-phaser
 */

import Phaser from 'phaser';

/**
 * Spine skeleton instance.
 */
export interface SpineSkeleton {
  setSkinByName(skinName: string): void;
  setSlotsToSetupPose(): void;
  setToSetupPose(): void;
  setBonesToSetupPose(): void;
  findBone(boneName: string): SpineBone | null;
  findSlot(slotName: string): SpineSlot | null;
  data: SpineSkeletonData;
}

export interface SpineBone {
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  worldX: number;
  worldY: number;
}

export interface SpineSlot {
  attachment: SpineAttachment | null;
}

export interface SpineAttachment {
  name: string;
}

export interface SpineSkeletonData {
  findAnimation(name: string): SpineAnimation | null;
  animations: SpineAnimation[];
  skins: SpineSkin[];
}

export interface SpineAnimation {
  name: string;
  duration: number;
}

export interface SpineSkin {
  name: string;
}

/**
 * Animation state for controlling playback.
 */
export interface SpineAnimationState {
  setAnimation(trackIndex: number, animationName: string, loop: boolean): SpineTrackEntry;
  addAnimation(trackIndex: number, animationName: string, loop: boolean, delay: number): SpineTrackEntry;
  setEmptyAnimation(trackIndex: number, mixDuration: number): SpineTrackEntry;
  clearTrack(trackIndex: number): void;
  clearTracks(): void;
  addListener(listener: SpineAnimationStateListener): void;
  removeListener(listener: SpineAnimationStateListener): void;
  timeScale: number;
}

export interface SpineTrackEntry {
  trackIndex: number;
  animation: SpineAnimation;
  loop: boolean;
  delay: number;
  trackTime: number;
  trackEnd: number;
  animationStart: number;
  animationEnd: number;
  animationLast: number;
  nextAnimationLast: number;
  alpha: number;
  mixTime: number;
  mixDuration: number;
  timeScale: number;
}

export interface SpineAnimationStateListener {
  start?: (entry: SpineTrackEntry) => void;
  interrupt?: (entry: SpineTrackEntry) => void;
  end?: (entry: SpineTrackEntry) => void;
  dispose?: (entry: SpineTrackEntry) => void;
  complete?: (entry: SpineTrackEntry) => void;
  event?: (entry: SpineTrackEntry, event: SpineEvent) => void;
}

export interface SpineEvent {
  data: { name: string };
  intValue: number;
  floatValue: number;
  stringValue: string;
  volume: number;
  balance: number;
}

/**
 * Animation state data for mix times.
 */
export interface SpineAnimationStateData {
  setMix(fromName: string, toName: string, duration: number): void;
  getMix(from: SpineAnimation, to: SpineAnimation): number;
  defaultMix: number;
}

/**
 * SpineGameObject - Phaser game object wrapping skeleton.
 * Note: Uses separate interface to avoid conflict with Phaser.GameObjects.GameObject.state
 */
export interface SpineGameObject {
  skeleton: SpineSkeleton;
  state: SpineAnimationState;
  stateData: SpineAnimationStateData;
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  alpha: number;
  active: boolean;
  scene: Phaser.Scene;
  setPosition(x: number, y: number): this;
  setScale(x: number, y?: number): this;
  setAlpha(value: number): this;
  setTint(color: number): this;
  destroy(): void;
}

/**
 * SpinePlugin adds spine loader and factory to scenes.
 */
export interface SpinePlugin extends Phaser.Plugins.ScenePlugin {
  add: {
    spine(x: number, y: number, dataKey: string, atlasKey: string, boundsProvider?: unknown): SpineGameObject;
  };
  make: {
    spine(config: SpineGameObjectConfig): SpineGameObject;
  };
}

export interface SpineGameObjectConfig {
  x?: number;
  y?: number;
  dataKey: string;
  atlasKey: string;
}

/**
 * Extended scene with spine plugin.
 */
export interface SpineScene extends Phaser.Scene {
  spine?: SpinePlugin;
}

/**
 * Extended loader with spine methods.
 */
export interface SpineLoader extends Phaser.Loader.LoaderPlugin {
  spine?(key: string, jsonUrl: string, atlasUrl: string, preMultipliedAlpha?: boolean): this;
  spineJson?(key: string, url: string): this;
  spineAtlas?(key: string, url: string, preMultipliedAlpha?: boolean): this;
}
