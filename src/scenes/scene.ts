import * as PIXI from 'pixi.js';
import { Engine } from '../core/engine';

export abstract class Scene extends PIXI.Container {
    /** Get engine class for static access */
    protected get engine(): typeof Engine {
        return Engine;
    }

    /** Called when scene becomes active */
    public abstract onEnter(): void | Promise<void>;

    /** Called every frame while scene is active */
    public abstract onUpdate(delta: number): void;

    /** Called when scene is about to be replaced */
    public abstract onExit(): void;

    /** Called when scene is paused (another scene pushed on top) */
    public onPause(): void {
        // Override if needed
    }

    /** Called when scene is resumed (top scene popped) */
    public onResume(): void {
        // Override if needed
    }
}
