import { Engine } from '../core/engine';

export interface PointerState {
    x: number;
    y: number;
    isDown: boolean;
    button: number;
}

export class PointerManager {
    private _x = 0;
    private _y = 0;
    private _isDown = false;
    private _justPressed = false;
    private _justReleased = false;
    private _button = 0;

    constructor() {
        this.onPointerMove = this.onPointerMove.bind(this);
        this.onPointerDown = this.onPointerDown.bind(this);
        this.onPointerUp = this.onPointerUp.bind(this);

        const view = Engine.view as HTMLCanvasElement;
        view.addEventListener('pointermove', this.onPointerMove);
        view.addEventListener('pointerdown', this.onPointerDown);
        view.addEventListener('pointerup', this.onPointerUp);
        view.addEventListener('pointerleave', this.onPointerUp);
    }

    private getCanvasCoords(event: PointerEvent): { x: number; y: number } {
        const view = Engine.view as HTMLCanvasElement;
        const rect = view.getBoundingClientRect();
        const scaleX = Engine.screen.width / rect.width;
        const scaleY = Engine.screen.height / rect.height;

        return {
            x: (event.clientX - rect.left) * scaleX,
            y: (event.clientY - rect.top) * scaleY,
        };
    }

    private onPointerMove(event: PointerEvent): void {
        const coords = this.getCanvasCoords(event);
        this._x = coords.x;
        this._y = coords.y;
    }

    private onPointerDown(event: PointerEvent): void {
        const coords = this.getCanvasCoords(event);
        this._x = coords.x;
        this._y = coords.y;
        this._isDown = true;
        this._justPressed = true;
        this._button = event.button;
    }

    private onPointerUp(_event: PointerEvent): void {
        this._isDown = false;
        this._justReleased = true;
    }

    /** Update pointer state (call once per frame) */
    public update(): void {
        this._justPressed = false;
        this._justReleased = false;
    }

    /** Pointer X position in game coordinates */
    public get x(): number {
        return this._x;
    }

    /** Pointer Y position in game coordinates */
    public get y(): number {
        return this._y;
    }

    /** Check if pointer is currently down */
    public get isDown(): boolean {
        return this._isDown;
    }

    /** Check if pointer was just pressed this frame */
    public get justPressed(): boolean {
        return this._justPressed;
    }

    /** Check if pointer was just released this frame */
    public get justReleased(): boolean {
        return this._justReleased;
    }

    /** Get current mouse button (0=left, 1=middle, 2=right) */
    public get button(): number {
        return this._button;
    }

    /** Get pointer position as object */
    public get position(): { x: number; y: number } {
        return { x: this._x, y: this._y };
    }

    /** Clean up event listeners */
    public destroy(): void {
        const view = Engine.view as HTMLCanvasElement;
        view.removeEventListener('pointermove', this.onPointerMove);
        view.removeEventListener('pointerdown', this.onPointerDown);
        view.removeEventListener('pointerup', this.onPointerUp);
        view.removeEventListener('pointerleave', this.onPointerUp);
    }
}
