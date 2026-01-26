// Core systems
export { eventBus, createEventBus } from './core/event-bus';
export { ObjectPool } from './core/object-pool';

// Game objects
export { GameObject } from './game-objects/game-object';
export { Component } from './game-objects/component';
export { ComponentManager } from './game-objects/component-manager';

// Built-in components
export { Transform } from './components/transform';
export { SpriteRenderer } from './components/sprite-renderer';
export { Animator } from './components/animator';
export { SpineRenderer } from './components/spine-renderer';
export { Collider } from './components/collider';
export type { ColliderConfig, ColliderShape, ColliderEvents } from './components/collider';
export { RigidBody } from './components/rigid-body';
export type { RigidBodyConfig } from './components/rigid-body';

// Scenes
export { BaseScene } from './scenes/base-scene';
export { SceneManager } from './scenes/scene-manager';
export { LoadingScene } from './scenes/loading-scene';
export type { LoadingSceneConfig } from './scenes/loading-scene';
export { executeTransition, createTransition, DEFAULT_TRANSITIONS } from './scenes/transitions';

// Utilities
export { InputManager, GamepadButton, GamepadAxis } from './utils/input-manager';
export { AudioManager } from './utils/audio-manager';
export type { AudioConfig } from './utils/audio-manager';
export { StorageManager } from './utils/storage-manager';

// Debug tools
export { DebugOverlay } from './debug/debug-overlay';
export { Profiler } from './debug/profiler';
export { Logger, ScopedLogger, LogLevel } from './debug/logger';

// Types
export type { ComponentClass, GameObjectConfig } from './types/game-object.types';
export type { GameEvents } from './types/event.types';
export type { AnimationConfig, AnimationTransition, AnimatorEvents } from './types/animation.types';
export type { SpineConfig, SpineEvents, SpineEvent, AnimationMix } from './types/spine.types';
export type {
  SpineGameObject,
  SpineScene,
  SpineLoader,
  SpineSkeleton,
  SpineAnimationState,
} from './types/spine-plugin.types';
export type {
  TransitionType,
  TransitionConfig,
  AssetManifestItem,
  SceneData,
  LoadProgressCallback,
} from './types/scene.types';
export type { InputBinding, ActionState } from './types/input.types';
