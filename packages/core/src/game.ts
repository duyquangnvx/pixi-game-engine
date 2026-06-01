import { Application } from "pixi.js";
import type { Root } from "react-dom/client";
import { createBridge, type Bridge } from "./bridge";
import { ServiceRegistry } from "./services";
import { AssetLoader } from "./pixi/asset-loader";
import { SceneManager } from "./pixi/scene-manager";
import { registerGame, unregisterGame } from "./pixi/hmr";
import { applyView, type ViewHandle } from "./pixi/view";
import { createDomInputSource } from "./pixi/input-source";
import { createInputRuntime, emptyInputRuntime } from "./input/runtime";
import { createFrameLoop, emptyFrameLoop } from "./scheduler";
import { mountDevFps } from "./pixi/dev-fps";
import { tryLockOrientation } from "./pixi/orientation";
import { mountOverlay } from "./react/mount";
import { injectBaseStyles } from "./react/styles";
import type { InputRuntime } from "./input/types";
import type { FrameLoop, GameConfig, SceneManagerHost } from "./types";

export class Game {
  readonly config: Readonly<GameConfig>;
  readonly app: Application = new Application();
  readonly services: ServiceRegistry = new ServiceRegistry();
  readonly bridge: Bridge;
  readonly loader: AssetLoader = new AssetLoader();
  readonly scenes: SceneManager;

  uiRoot: HTMLElement | null = null;
  private reactRoot: Root | null = null;
  private viewHandle: ViewHandle | null = null;
  private inputRuntime: InputRuntime = emptyInputRuntime();
  private frameLoop: FrameLoop = emptyFrameLoop();
  private disposeDevFps: (() => void) | null = null;
  private started = false;

  constructor(config: GameConfig) {
    this.config = Object.freeze({ ...config });
    this.bridge = createBridge(config.initialState);

    const self = this;
    const host: SceneManagerHost = {
      get stage() { return self.app.stage; },
      get ticker() { return self.app.ticker; },
      get uiRoot() {
        if (!self.uiRoot) throw new Error("uiRoot is not mounted yet");
        return self.uiRoot;
      },
      get viewport() {
        if (!self.viewHandle) throw new Error("viewport is not available until the game has started");
        return self.viewHandle.viewport;
      },
      get input() { return self.inputRuntime; },
      get scheduler() { return self.frameLoop; },
      bridge: this.bridge,
      loader: this.loader,
      services: this.services
    };

    this.scenes = new SceneManager(host, config.hooks?.onError);
    for (const ctor of config.scenes) this.scenes.register(ctor);
    registerGame(this);
  }

  async start(): Promise<void> {
    if (this.started) return;
    this.started = true;

    const selector = this.config.mount ?? "#app";
    const mount = document.querySelector<HTMLElement>(selector);
    if (!mount) throw new Error(`Mount "${selector}" not found`);
    mount.style.position = "relative";

    await this.app.init({
      background: this.config.view.background ?? "#000000",
      antialias: true,
      autoDensity: true,
      resolution: window.devicePixelRatio,
      resizeTo: mount
    });
    mount.appendChild(this.app.canvas);

    injectBaseStyles();
    const uiRoot = document.createElement("div");
    uiRoot.id = "ui-root";
    mount.appendChild(uiRoot);
    this.uiRoot = uiRoot;

    this.viewHandle = applyView(this.app, this.config.view, mount, uiRoot);

    const onError = this.config.hooks?.onError;
    this.frameLoop = createFrameLoop(this.app.ticker, onError ? { onError } : {});

    if (this.config.input) {
      this.inputRuntime = createInputRuntime({
        map: this.config.input,
        source: createDomInputSource(this.app.canvas),
        viewport: this.viewHandle.viewport,
        ...(onError ? { onError } : {})
      });
    }

    if (this.config.dev?.fps) this.disposeDevFps = mountDevFps(this.app.ticker, mount);
    if (this.config.view.orientation) void tryLockOrientation(this.config.view.orientation);

    if (this.config.manifest) await this.loader.init(this.config.manifest);

    this.reactRoot = mountOverlay(uiRoot, this);

    for (const plugin of this.config.plugins ?? []) await plugin.install(this);
    await this.config.hooks?.onReady?.(this);

    await this.scenes.go(this.config.initialScene);
  }

  stop(): void {
    unregisterGame(this);
    this.scenes.destroyAll();
    this.inputRuntime.destroy();
    this.frameLoop.destroy();
    this.disposeDevFps?.();
    this.viewHandle?.dispose();
    this.reactRoot?.unmount();
    this.app.destroy(true, { children: true });
  }
}

export function createGame(config: GameConfig): Game {
  return new Game(config);
}
