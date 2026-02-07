import { Engine } from '../core/engine';
import type { Scene } from './scene';

type SceneClass = new () => Scene;

export class SceneManager {
    private scenes: Map<string, SceneClass> = new Map();
    private currentScene: Scene | null = null;
    private currentSceneName: string | null = null;

    constructor() {}

    /** Register a scene class with a name */
    public add(name: string, SceneClass: SceneClass): void {
        this.scenes.set(name, SceneClass);
    }

    /** Remove a scene registration */
    public remove(name: string): void {
        this.scenes.delete(name);
    }

    /** Start a scene by name */
    public async start(name: string): Promise<void> {
        const SceneClass = this.scenes.get(name);
        if (!SceneClass) {
            throw new Error(`Scene "${name}" not found`);
        }

        const previousName = this.currentSceneName;

        // Exit current scene
        if (this.currentScene) {
            this.currentScene.onExit();
            Engine.stage.removeChild(this.currentScene);
            this.currentScene.destroy({ children: true });
        }

        // Create and enter new scene
        const scene = new SceneClass();
        this.currentScene = scene;
        this.currentSceneName = name;

        Engine.stage.addChild(scene);
        await scene.onEnter();

        Engine.onSceneChange.emit({ from: previousName, to: name });
    }

    /** Get current scene name */
    public get current(): string | null {
        return this.currentSceneName;
    }

    /** Get current scene instance */
    public get currentInstance(): Scene | null {
        return this.currentScene;
    }

    /** Update current scene */
    public update(delta: number): void {
        if (this.currentScene) {
            this.currentScene.onUpdate(delta);
        }
    }

    /** Check if a scene is registered */
    public has(name: string): boolean {
        return this.scenes.has(name);
    }

    /** Destroy scene manager */
    public destroy(): void {
        if (this.currentScene) {
            this.currentScene.onExit();
            this.currentScene.destroy({ children: true });
            this.currentScene = null;
        }
        this.scenes.clear();
    }
}
