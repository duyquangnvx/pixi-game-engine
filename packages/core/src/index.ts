export { BaseScene, type SceneConstructor } from "./pixi/scene";
export { SceneManager } from "./pixi/scene-manager";
export { createBridge, type Bridge } from "./bridge";
export { createStore, type Store } from "./store";
export { ServiceRegistry, type ServiceKey } from "./services";
export { AssetLoader } from "./pixi/asset-loader";
export { hotReplaceScene } from "./pixi/hmr";
export { applyView, fit } from "./pixi/view";
export { defineInput } from "./input/define-input";
export { createFrameLoop } from "./scheduler";
export { tryLockOrientation } from "./pixi/orientation";
export { tween, easeLinear, easeInOutQuad, type Ease } from "./transition";

// Test-support / null-object helpers + symbols the extracted game.ts needs.
// The Pixi-layer symbols below are TEMPORARY here (Pixi is still nested in
// core this step) and relocate to @studio/pixi's barrel in Task 3.
export { createViewport } from "./pixi/viewport";
export { emptyFrameLoop } from "./scheduler";
export { createInputRuntime, emptyInputRuntime } from "./input/runtime";
export { registerGame, unregisterGame } from "./pixi/hmr";
export { createDomInputSource } from "./pixi/input-source";
export { mountDevFps } from "./pixi/dev-fps";
export { type ViewHandle } from "./pixi/view";

export type {
  GameState,
  Command,
  CommandMap,
  RouteEntry,
  ViewConfig,
  ViewFit,
  ViewState,
  Viewport,
  Transition,
  GoOptions,
  SceneContext,
  SceneScreenProps,
  SceneStackEntry,
  SceneManagerHost,
  TickerLike,
  FrameInfo,
  FrameLoop,
  ScheduleHandle,
  Orientation
} from "./types";
export type {
  InputActions,
  InputBinding,
  InputMapDef,
  InputFacade,
  InputRuntime,
  InferInputActions,
  KeyCode,
  ButtonBinding,
  AxisBinding,
  ActionEvent,
  AxisValue,
  ButtonName,
  AxisName
} from "./input/types";
