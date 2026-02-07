import * as PIXI from 'pixi.js';
import { Logger } from '../utils/logger';
import type { AssetManifest, ProgressCallback } from './types';

export class AssetManager {
    private initialized = false;

    /** Initialize assets with a manifest */
    public async init(options: { manifest: string | AssetManifest }): Promise<void> {
        if (this.initialized) {
            Logger.warn('AssetManager', 'Already initialized');
            return;
        }

        await PIXI.Assets.init(options);
        this.initialized = true;
    }

    /** Load a bundle by name with optional progress callback */
    public async loadBundle(name: string, onProgress?: ProgressCallback): Promise<void> {
        await PIXI.Assets.loadBundle(name, onProgress);
    }

    /** Load multiple bundles */
    public async loadBundles(names: string[], onProgress?: ProgressCallback): Promise<void> {
        await PIXI.Assets.loadBundle(names, onProgress);
    }

    /** Background load a bundle (non-blocking) */
    public backgroundLoadBundle(name: string): void {
        PIXI.Assets.backgroundLoadBundle(name);
    }

    /** Load a single asset by alias */
    public async load<T>(alias: string): Promise<T> {
        return (await PIXI.Assets.load(alias)) as T;
    }

    /** Get a loaded asset by alias */
    public get<T>(alias: string): T {
        return PIXI.Assets.get(alias) as T;
    }

    /** Check if an asset is loaded */
    public has(alias: string): boolean {
        return PIXI.Assets.cache.has(alias);
    }

    /** Unload an asset */
    public async unload(alias: string): Promise<void> {
        await PIXI.Assets.unload(alias);
    }

    /** Unload a bundle */
    public async unloadBundle(name: string): Promise<void> {
        await PIXI.Assets.unloadBundle(name);
    }

    /** Add an asset to the resolver */
    public add(alias: string, src: string): void {
        PIXI.Assets.add({ alias, src });
    }

    /** Get the underlying PIXI.Assets instance */
    public get assets(): typeof PIXI.Assets {
        return PIXI.Assets;
    }
}
