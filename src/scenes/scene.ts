import * as PIXI from 'pixi.js';
import { Game } from '../core/game';

export abstract class Scene extends PIXI.Container {
    /** Get game instance */
    protected get game(): Game {
        return Game.instance;
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
