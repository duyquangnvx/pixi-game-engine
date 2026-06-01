import { tween, easeLinear } from "@studio/core";
import { BaseScene, type SceneConstructor } from "./base-scene";
import type { FrameInfo, GoOptions, SceneContext, Transition } from "@studio/core";
import type { SceneManagerHost, SceneStackEntry } from "./types";

export class SceneManager {
  private readonly registry = new Map<string, SceneConstructor>();
  private stack: SceneStackEntry[] = [];
  private readonly ticks = new Map<BaseScene, (frame: FrameInfo) => void>();
  private readonly listeners = new Set<() => void>();

  constructor(
    private readonly host: SceneManagerHost,
    private readonly onError: (error: unknown) => void = () => undefined
  ) {}

  register(ctor: SceneConstructor): void {
    this.registry.set(ctor.key, ctor);
  }

  get current(): BaseScene | null {
    return this.stack[this.stack.length - 1]?.instance ?? null;
  }

  getStack = (): readonly SceneStackEntry[] => this.stack;

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  async go(key: string, opt: GoOptions = {}): Promise<BaseScene> {
    const prev = this.stack[this.stack.length - 1] ?? null;
    const entry = await this.enter(key, opt);
    const transition = opt.transition ?? { type: "none" };

    if (prev && transition.type === "fade") {
      await this.fade(transition, (p) => {
        prev.instance.world.alpha = 1 - p;
        this.host.uiRoot.style.opacity = String(1 - p);
      });
    }

    this.teardownAll();
    this.stack = [entry];
    this.commit();

    if (transition.type === "fade") {
      entry.instance.world.alpha = 0;
      await this.fade(transition, (p) => {
        entry.instance.world.alpha = p;
        this.host.uiRoot.style.opacity = String(p);
      });
    } else {
      entry.instance.world.alpha = 1;
      this.host.uiRoot.style.opacity = "1";
    }
    return entry.instance;
  }

  async push(key: string, opt: GoOptions = {}): Promise<BaseScene> {
    const entry = await this.enter(key, opt);
    const transition = opt.transition ?? { type: "none" };
    this.stack = [...this.stack, entry];
    this.commit();
    if (transition.type === "fade") {
      entry.instance.world.alpha = 0;
      await this.fade(transition, (p) => { entry.instance.world.alpha = p; });
    } else {
      entry.instance.world.alpha = 1;
    }
    return entry.instance;
  }

  destroyAll(): void {
    this.teardownAll();
    this.commit();
  }

  /**
   * Hot-replace a scene class. Always refreshes the registry; if the changed
   * scene is on top of the stack, rebuilds it in place with the same data.
   */
  async reload(ctor: SceneConstructor): Promise<void> {
    this.registry.set(ctor.key, ctor);
    const top = this.stack[this.stack.length - 1];
    if (!top || top.key !== ctor.key) return;
    const { data } = top;
    this.teardown(top);
    this.stack = this.stack.slice(0, -1);
    const entry = await this.enter(ctor.key, { data });
    entry.instance.world.alpha = 1;
    this.stack = [...this.stack, entry];
    this.commit();
  }

  pop(): void {
    if (this.stack.length <= 1) return;
    const top = this.stack[this.stack.length - 1];
    if (!top) return;
    this.teardown(top);
    this.stack = this.stack.slice(0, -1);
    this.commit();
  }

  private async enter(key: string, opt: GoOptions): Promise<SceneStackEntry> {
    const Ctor = this.registry.get(key);
    if (!Ctor) throw new Error(`Scene "${key}" is not registered`);
    const ctx: SceneContext = {
      services: this.host.services,
      store: this.host.bridge.store,
      viewport: this.host.viewport,
      input: this.host.input,
      scheduler: this.host.scheduler
    };
    const instance = new Ctor(ctx);
    await instance.onPreload(this.host.loader, Ctor.assets);
    this.host.stage.addChild(instance.world);
    instance.world.alpha = 0;
    try {
      instance.onCreate(opt.data);
      const tick = (frame: FrameInfo): void => instance.onUpdate(frame.deltaTime);
      this.host.ticker.add(tick);
      this.ticks.set(instance, tick);
    } catch (error: unknown) {
      instance.world.removeFromParent();
      instance.world.destroy({ children: true });
      throw error;
    }
    const entry: SceneStackEntry = { key, data: opt.data, instance };
    if (Ctor.Screen) entry.Screen = Ctor.Screen;
    return entry;
  }

  private teardownAll(): void {
    for (const entry of [...this.stack].reverse()) this.teardown(entry);
    this.stack = [];
  }

  private teardown(entry: SceneStackEntry): void {
    const tick = this.ticks.get(entry.instance);
    if (tick) {
      this.host.ticker.remove(tick);
      this.ticks.delete(entry.instance);
    }
    entry.instance.world.removeFromParent();
    entry.instance._runDestroy(this.onError);
  }

  private commit(): void {
    this.host.bridge.setRoute(this.stack.map((e) => ({ scene: e.key, data: e.data })));
    for (const listener of this.listeners) listener();
  }

  private fade(transition: Extract<Transition, { type: "fade" }>, onProgress: (p: number) => void): Promise<void> {
    return tween(this.host.ticker, transition.duration, easeLinear, onProgress);
  }
}
