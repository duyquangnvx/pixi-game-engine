import { Container } from "pixi.js";
import type { ComponentType } from "react";
import type { AssetLoader } from "./asset-loader";
import type { SceneContext, SceneScreenProps } from "./types";

export abstract class BaseScene<Data = unknown> {
  static readonly key: string;
  static readonly assets?: string;
  static readonly Screen?: ComponentType<SceneScreenProps>;

  readonly world: Container = new Container();
  protected readonly services: SceneContext["services"];
  protected readonly store: SceneContext["store"];

  private readonly disposers: Array<() => void> = [];

  constructor(ctx: SceneContext) {
    this.services = ctx.services;
    this.store = ctx.store;
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
    this.world.destroy({ children: true });
    this.onDestroy();
  }
}

export interface SceneConstructor {
  new (ctx: SceneContext): BaseScene;
  readonly key: string;
  readonly assets?: string;
  readonly Screen?: ComponentType<SceneScreenProps>;
}
