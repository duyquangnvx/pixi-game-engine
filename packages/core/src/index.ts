export { createBridge, type Bridge } from "./bridge";
export { createStore, type Store } from "./store";
export { ServiceRegistry, type ServiceKey } from "./services";
export { defineInput } from "./input/define-input";
export { createFrameLoop, emptyFrameLoop } from "./scheduler";
export { createInputRuntime, emptyInputRuntime } from "./input/runtime";
export { createViewport } from "./viewport";
export { tween, easeLinear, easeInOutQuad, type Ease } from "./transition";

export type { FrameInfo, TickerLike, FrameLoop, ScheduleHandle } from "./scheduler";
export type { ViewFit, Orientation, ViewConfig, ViewState, Viewport } from "./viewport";
export type {
  RouteEntry,
  GameState,
  CommandMap,
  Command,
  SceneContext,
  Transition,
  GoOptions,
  SceneMap,
  SceneKey
} from "./scene-contract";
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
  AxisName,
  RawPointerEvent,
  RawKeyboardEvent,
  InputEventSource
} from "./input/types";
