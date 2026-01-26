/**
 * Keyboard key codes used for input binding.
 * Use Phaser.Input.Keyboard.KeyCodes.SPACE, etc.
 */
export type KeyCode = number;

/**
 * Gamepad button indices (standard mapping).
 * @see https://w3c.github.io/gamepad/#remapping
 */
export enum GamepadButton {
  A = 0,
  B = 1,
  X = 2,
  Y = 3,
  LB = 4,
  RB = 5,
  LT = 6,
  RT = 7,
  Back = 8,
  Start = 9,
  LeftStick = 10,
  RightStick = 11,
  DpadUp = 12,
  DpadDown = 13,
  DpadLeft = 14,
  DpadRight = 15,
}

/**
 * Gamepad axis indices.
 */
export enum GamepadAxis {
  LeftStickX = 0,
  LeftStickY = 1,
  RightStickX = 2,
  RightStickY = 3,
}

/**
 * Input binding for an action.
 */
export interface InputBinding {
  /** Keyboard keys */
  keys?: number[];
  /** Gamepad buttons */
  buttons?: GamepadButton[];
  /** Gamepad axis (for analog input) */
  axis?: {
    index: GamepadAxis;
    positive?: boolean; // true = positive direction, false = negative
  };
}

/**
 * Action state.
 */
export interface ActionState {
  isDown: boolean;
  justPressed: boolean;
  justReleased: boolean;
  value: number; // 0-1 for analog, 0 or 1 for digital
}
