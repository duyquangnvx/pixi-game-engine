import { Logger } from '../utils/logger';

export interface GamepadState {
    connected: boolean;
    buttons: boolean[];
    axes: number[];
}

export class GamepadManager {
    private gamepads: Map<number, Gamepad> = new Map();
    private prevButtons: Map<number, boolean[]> = new Map();

    constructor() {
        this.onGamepadConnected = this.onGamepadConnected.bind(this);
        this.onGamepadDisconnected = this.onGamepadDisconnected.bind(this);

        window.addEventListener('gamepadconnected', this.onGamepadConnected);
        window.addEventListener('gamepaddisconnected', this.onGamepadDisconnected);
    }

    private onGamepadConnected(event: GamepadEvent): void {
        this.gamepads.set(event.gamepad.index, event.gamepad);
        Logger.info('Gamepad', `Connected: ${event.gamepad.id}`);
    }

    private onGamepadDisconnected(event: GamepadEvent): void {
        this.gamepads.delete(event.gamepad.index);
        this.prevButtons.delete(event.gamepad.index);
        Logger.info('Gamepad', `Disconnected: ${event.gamepad.id}`);
    }

    /** Update gamepad state (call once per frame) */
    public update(): void {
        // Get fresh gamepad state
        const gamepads = navigator.getGamepads();
        for (const gamepad of gamepads) {
            if (gamepad) {
                this.gamepads.set(gamepad.index, gamepad);
            }
        }
    }

    /** Get gamepad by index (0-3) */
    public get(index: number): Gamepad | null {
        return this.gamepads.get(index) ?? null;
    }

    /** Check if a gamepad is connected */
    public isConnected(index: number): boolean {
        return this.gamepads.has(index);
    }

    /** Check if a button is pressed on gamepad */
    public isButtonDown(index: number, button: number): boolean {
        const gamepad = this.gamepads.get(index);
        if (!gamepad || button >= gamepad.buttons.length) return false;
        return gamepad.buttons[button].pressed;
    }

    /** Get axis value (-1 to 1) */
    public getAxis(index: number, axis: number): number {
        const gamepad = this.gamepads.get(index);
        if (!gamepad || axis >= gamepad.axes.length) return 0;
        return gamepad.axes[axis];
    }

    /** Get left stick as normalized vector */
    public getLeftStick(index: number): { x: number; y: number } {
        return {
            x: this.getAxis(index, 0),
            y: this.getAxis(index, 1),
        };
    }

    /** Get right stick as normalized vector */
    public getRightStick(index: number): { x: number; y: number } {
        return {
            x: this.getAxis(index, 2),
            y: this.getAxis(index, 3),
        };
    }

    /** Get number of connected gamepads */
    public get count(): number {
        return this.gamepads.size;
    }

    /** Clean up event listeners */
    public destroy(): void {
        window.removeEventListener('gamepadconnected', this.onGamepadConnected);
        window.removeEventListener('gamepaddisconnected', this.onGamepadDisconnected);
        this.gamepads.clear();
        this.prevButtons.clear();
    }
}
