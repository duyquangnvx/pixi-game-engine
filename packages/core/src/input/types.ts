/**
 * Curated subset of `KeyboardEvent.code` values most games need. The
 * `(string & {})` arm preserves autocomplete on the named members while still
 * accepting any other code ("F1", "NumpadEnter", …).
 */
export type KeyCode =
  | "Space"
  | "Enter"
  | "Escape"
  | "Tab"
  | "ArrowUp"
  | "ArrowDown"
  | "ArrowLeft"
  | "ArrowRight"
  | "KeyW"
  | "KeyA"
  | "KeyS"
  | "KeyD"
  | "KeyE"
  | "KeyQ"
  | "ShiftLeft"
  | "ShiftRight"
  | (string & {});

export type PointerGesture = "down" | "up" | "tap";

/** A button-style action: triggered by keys and/or a pointer gesture. */
export interface ButtonBinding {
  keys?: readonly KeyCode[];
  pointer?: PointerGesture;
}

/** A 2D axis built from opposing key pairs: `[negative, positive]`. */
export interface AxisBinding {
  x?: readonly [KeyCode, KeyCode];
  y?: readonly [KeyCode, KeyCode];
}

export type InputBinding = ButtonBinding | { axis: AxisBinding };

export type InputMapDef = Record<string, InputBinding>;

/**
 * Maps a concrete binding map to its action-kind registry, for declaration
 * merging into {@link InputActions}: axis bindings become `"axis"`, the rest
 * `"button"`.
 */
export type InferInputActions<M extends InputMapDef> = {
  [K in keyof M]: M[K] extends { axis: AxisBinding } ? "axis" : "button";
};

/**
 * Action-name registry. Empty by design — games augment it (typically via
 * `InferInputActions<typeof input>`) so action names are type-checked:
 *
 * ```ts
 * declare module "@studio/core" {
 *   interface InputActions extends InferInputActions<typeof input> {}
 * }
 * ```
 */
export interface InputActions {}

type AnyName = keyof InputActions & string;

/** Names of button actions (or `string` when {@link InputActions} is empty). */
export type ButtonName = [AnyName] extends [never]
  ? string
  : { [K in keyof InputActions]: InputActions[K] extends "axis" ? never : K }[keyof InputActions] & string;

/** Names of axis actions (or `string` when {@link InputActions} is empty). */
export type AxisName = [AnyName] extends [never]
  ? string
  : { [K in keyof InputActions]: InputActions[K] extends "axis" ? K : never }[keyof InputActions] & string;

export interface ActionEvent {
  type: "down" | "up" | "tap";
  /** Pointer position in design space; absent for keyboard-triggered actions. */
  designX?: number;
  designY?: number;
}

export interface AxisValue {
  x: number;
  y: number;
}

export interface RawPointerEvent {
  type: "down" | "move" | "up" | "cancel" | "tap";
  pointerId: number;
  /** Canvas-relative CSS pixels. */
  viewportX: number;
  viewportY: number;
}

export interface RawKeyboardEvent {
  type: "down" | "up";
  code: string;
  repeat: boolean;
}

/** Raw input transport. The Pixi layer implements this over DOM listeners. */
// (RawPointerEvent / RawKeyboardEvent / InputEventSource are re-exported from
//  the package barrel so the Pixi DOM source can implement this contract.)
export interface InputEventSource {
  onPointer(listener: (e: RawPointerEvent) => void): () => void;
  onKey(listener: (e: RawKeyboardEvent) => void): () => void;
  destroy(): void;
}

/** Scene-facing input surface. Registrations auto-clean with the scene. */
export interface InputFacade {
  onDown(action: ButtonName, handler: (e: ActionEvent) => void): void;
  onUp(action: ButtonName, handler: (e: ActionEvent) => void): void;
  onTap(action: ButtonName, handler: (e: ActionEvent) => void): void;
  onAxis(name: AxisName, handler: (e: AxisValue) => void): void;
  /** Whether a key-bound action is currently held. Pointer gestures are event-only. */
  isDown(action: ButtonName): boolean;
  axis(name: AxisName): AxisValue;
}

/**
 * Per-game input engine. `facade(register)` mints a scene-scoped
 * {@link InputFacade}; every subscription it makes is handed to `register`
 * (a scene's cleanup hook) so it unsubscribes on teardown.
 */
export interface InputRuntime {
  facade(register: (unsub: () => void) => void): InputFacade;
  destroy(): void;
}
