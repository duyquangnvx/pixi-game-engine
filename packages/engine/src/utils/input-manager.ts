import Phaser from 'phaser';
import type { InputBinding, ActionState, GamepadButton, GamepadAxis } from '../types/input.types';

/**
 * Manages input actions with keyboard and gamepad support.
 * Bind named actions to keys/buttons and query state.
 *
 * @example
 * const input = new InputManager(scene);
 * input.bindAction('jump', { keys: [Phaser.Input.Keyboard.KeyCodes.SPACE], buttons: [0] });
 * input.bindAction('move', { axis: { index: 0 } }); // Left stick X
 *
 * // In update:
 * if (input.isActionJustPressed('jump')) player.jump();
 * const moveX = input.getAxis('move');
 */
export class InputManager {
  private scene: Phaser.Scene;
  private bindings = new Map<string, InputBinding>();
  private prevStates = new Map<string, boolean>();
  private keyboard: Phaser.Input.Keyboard.KeyboardPlugin | null = null;

  /** Deadzone for analog sticks (0-1) */
  deadzone = 0.15;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.keyboard = scene.input.keyboard;

    // Update previous states each frame
    scene.events.on('update', this.updatePrevStates, this);
    scene.events.once('shutdown', this.destroy, this);
  }

  /**
   * Bind an action to input sources.
   */
  bindAction(name: string, binding: InputBinding): void {
    this.bindings.set(name, binding);
    this.prevStates.set(name, false);
  }

  /**
   * Remove action binding.
   */
  unbindAction(name: string): void {
    this.bindings.delete(name);
    this.prevStates.delete(name);
  }

  /**
   * Check if action is currently held down.
   */
  isActionDown(name: string): boolean {
    const binding = this.bindings.get(name);
    if (!binding) return false;

    return this.checkKeys(binding) || this.checkButtons(binding) || this.checkAxisAsButton(binding);
  }

  /**
   * Check if action was just pressed this frame.
   */
  isActionJustPressed(name: string): boolean {
    const isDown = this.isActionDown(name);
    const wasDown = this.prevStates.get(name) ?? false;
    return isDown && !wasDown;
  }

  /**
   * Check if action was just released this frame.
   */
  isActionJustReleased(name: string): boolean {
    const isDown = this.isActionDown(name);
    const wasDown = this.prevStates.get(name) ?? false;
    return !isDown && wasDown;
  }

  /**
   * Get analog value for action (-1 to 1 for axis, 0 or 1 for digital).
   */
  getAxis(name: string): number {
    const binding = this.bindings.get(name);
    if (!binding) return 0;

    // Check gamepad axis first
    if (binding.axis) {
      const value = this.getGamepadAxis(binding.axis.index);
      if (Math.abs(value) > this.deadzone) {
        return value;
      }
    }

    // Fall back to digital input
    if (this.checkKeys(binding) || this.checkButtons(binding)) {
      return binding.axis?.positive === false ? -1 : 1;
    }

    return 0;
  }

  /**
   * Get full action state.
   */
  getActionState(name: string): ActionState {
    const isDown = this.isActionDown(name);
    const wasDown = this.prevStates.get(name) ?? false;

    return {
      isDown,
      justPressed: isDown && !wasDown,
      justReleased: !isDown && wasDown,
      value: this.getAxis(name),
    };
  }

  private checkKeys(binding: InputBinding): boolean {
    if (!binding.keys || !this.keyboard) return false;

    for (const keyCode of binding.keys) {
      const key = this.keyboard.addKey(keyCode, false);
      if (key.isDown) return true;
    }

    return false;
  }

  private checkButtons(binding: InputBinding): boolean {
    if (!binding.buttons) return false;

    const gamepad = this.getGamepad();
    if (!gamepad) return false;

    for (const buttonIndex of binding.buttons) {
      const button = gamepad.buttons[buttonIndex];
      if (button?.pressed) return true;
    }

    return false;
  }

  private checkAxisAsButton(binding: InputBinding): boolean {
    if (!binding.axis) return false;

    const value = this.getGamepadAxis(binding.axis.index);
    const threshold = 0.5;

    if (binding.axis.positive === true) {
      return value > threshold;
    } else if (binding.axis.positive === false) {
      return value < -threshold;
    }

    return Math.abs(value) > threshold;
  }

  private getGamepadAxis(axisIndex: GamepadAxis): number {
    const gamepad = this.getGamepad();
    if (!gamepad) return 0;

    return gamepad.axes[axisIndex] ?? 0;
  }

  private getGamepad(): Gamepad | null {
    const gamepads = navigator.getGamepads();
    for (const gamepad of gamepads) {
      if (gamepad?.connected) return gamepad;
    }
    return null;
  }

  private updatePrevStates(): void {
    for (const name of this.bindings.keys()) {
      this.prevStates.set(name, this.isActionDown(name));
    }
  }

  /**
   * Check if any gamepad is connected.
   */
  get hasGamepad(): boolean {
    return this.getGamepad() !== null;
  }

  private destroy(): void {
    this.scene.events.off('update', this.updatePrevStates, this);
    this.bindings.clear();
    this.prevStates.clear();
  }
}

export { GamepadButton, GamepadAxis } from '../types/input.types';
