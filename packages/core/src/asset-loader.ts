import { Assets } from "pixi.js";

export class AssetLoader {
  private _initialized = false;

  get initialized(): boolean {
    return this._initialized;
  }

  async init(manifestUrl: string): Promise<void> {
    await Assets.init({ manifest: manifestUrl });
    this._initialized = true;
  }

  async loadBundle(name: string): Promise<void> {
    if (!this._initialized) return;
    await Assets.loadBundle(name);
  }

  backgroundLoadBundle(name: string): void {
    if (!this._initialized) return;
    void Assets.backgroundLoadBundle(name);
  }
}
