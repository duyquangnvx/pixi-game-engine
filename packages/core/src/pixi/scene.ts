import { Container } from "pixi.js";
import type { ComponentType } from "react";
import type { AssetLoader } from "./asset-loader";
import type { InputFacade } from "../input/types";
import type { SceneContext, SceneScreenProps, ScheduleHandle } from "../types";

export abstract class BaseScene<Data = unknown> {
  static readonly key: string;
  static readonly assets?: string;
  static readonly Screen?: ComponentType<SceneScreenProps>;

  readonly world: Container = new Container();
  protected readonly services: SceneContext["services"];
  protected readonly store: SceneContext["store"];
  protected readonly view: SceneContext["viewport"];
  protected readonly input: InputFacade;
  private readonly scheduler: SceneContext["scheduler"];

  private readonly disposers: Array<() => void> = [];

  constructor(ctx: SceneContext) {
    this.services = ctx.services;
    this.store = ctx.store;
    this.view = ctx.viewport;
    this.input = ctx.input.facade((unsub) => this.onCleanup(unsub));
    this.scheduler = ctx.scheduler;
  }

  /** Run `fn` once after `ms` of game time; auto-cancelled on teardown. */
  protected timer(ms: number, fn: () => void): ScheduleHandle {
    const handle = this.scheduler.timer(ms, fn);
    this.onCleanup(() => handle.cancel());
    return handle;
  }

  /** Run `fn` every `ms` of game time; auto-cancelled on teardown. */
  protected interval(ms: number, fn: () => void): ScheduleHandle {
    const handle = this.scheduler.interval(ms, fn);
    this.onCleanup(() => handle.cancel());
    return handle;
  }

  async onPreload(loader: AssetLoader, bundle?: string): Promise<void> {
    if (bundle) await loader.loadBundle(bundle);
  }
  onCreate(_data: Data): void {}
  onUpdate(_dt: number): void {}
  onDestroy(): void {}

  spawn<T extends Container>(node: T, parent: Container = this.world): T {
    parent.addChild(node);
    this.onCleanup(() => node.destroy({ children: true }));
    return node;
  }

  onCleanup(fn: () => void): void {
    this.disposers.push(fn);
  }

  /** @internal Called by SceneManager during teardown. */
  _runDestroy(onError: (error: unknown) => void): void {
    for (const fn of [...this.disposers].reverse()) {
      try {
        fn();
      } catch (error: unknown) {
        onError(error);
      }
    }
    this.disposers.length = 0;
    try {
      this.world.destroy({ children: true });
    } catch (error: unknown) {
      onError(error);
    }
    try {
      this.onDestroy();
    } catch (error: unknown) {
      onError(error);
    }
  }
}

export interface SceneConstructor {
  new (ctx: SceneContext): BaseScene;
  readonly key: string;
  readonly assets?: string;
  readonly Screen?: ComponentType<SceneScreenProps>;
}
