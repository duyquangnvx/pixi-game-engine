import { GamepadManager } from './gamepad';
import { KeyboardManager } from './keyboard';
import { PointerManager } from './pointer';

export class InputManager {
    public readonly keyboard: KeyboardManager;
    public readonly pointer: PointerManager;
    public readonly gamepad: GamepadManager;

    constructor() {
        this.keyboard = new KeyboardManager();
        this.pointer = new PointerManager();
        this.gamepad = new GamepadManager();
    }

    /** Update all input managers (call once per frame at start) */
    public update(): void {
        this.gamepad.update();
        // Note: keyboard and pointer update at end of frame
    }

    /** Post-update to clear per-frame states */
    public postUpdate(): void {
        this.keyboard.update();
        this.pointer.update();
    }

    /** Clean up all input managers */
    public destroy(): void {
        this.keyboard.destroy();
        this.pointer.destroy();
        this.gamepad.destroy();
    }
}
