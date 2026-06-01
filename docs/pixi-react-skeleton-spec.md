# PixiJS + React-overlay skeleton spec (DX reference draft)

> Bản nháp **để tham khảo DX**, song song với [`project-skeleton-spec.md`](./project-skeleton-spec.md) (bản cocos2d-js).
> Mục tiêu: giữ nguyên *triết lý DX* của cocos-harness (contract-first, type-safe assets, scene lifecycle, agent-observable) nhưng thay engine bằng **PixiJS v8 (game-world) + React DOM (UI overlay)**.
> Đây **không phải** thiết kế chốt — nó là điểm khởi đầu cho session thiết kế riêng (xem [`pixi-react-harness-requirements.md`](./pixi-react-harness-requirements.md)).

---

## 0. Quyết định kiến trúc nền (đã chốt)

**DOM overlay**, không phải `@pixi/react` reconciler:

```
┌─────────────────────────────────────────────┐
│  #app (mount root, position: relative)        │
│                                               │
│   ┌─────────────────────────────────────┐    │  ← Layer 1: Pixi canvas (game world)
│   │  <canvas>  PixiJS Application         │    │     sprite, animation, particle, gameplay
│   │            world Container per-scene  │    │
│   └─────────────────────────────────────┘    │
│   ┌─────────────────────────────────────┐    │  ← Layer 2: React DOM overlay
│   │  #ui-root (position: absolute, top:0) │    │     menu / shop / inventory / HUD / dialog
│   │            React render tree          │    │     pointer-events tuỳ vùng
│   └─────────────────────────────────────┘    │
│                                               │
└─────────────────────────────────────────────┘
        ▲ Bridge: 1 store (single source of truth) + command bus ▲
```

**Vì sao DOM overlay là lựa chọn đúng cho mục tiêu GDD-nặng-UI + coding agent:**

| Tiêu chí | DOM overlay (chọn) | `@pixi/react` (toàn canvas) |
| --- | --- | --- |
| Author UI (menu/shop/inventory) bằng LLM | HTML/CSS/Flexbox — agent cực thạo | Phải vẽ layout bằng Pixi primitive — dễ sai toạ độ |
| Verify bằng tool | DOM inspectable → Playwright / chrome-devtools MCP (đã có sẵn trong repo) | Cần custom scene-tree introspection như cocos |
| Accessibility / text / scroll / input | Native của browser | Phải tự build |
| Responsive | CSS media/clamp/flex | Tự tính scale |
| Game-world (animation, gameplay, FX) | Pixi canvas — đúng việc | Pixi canvas |

→ **Phân vai rõ ràng:** Pixi lo *thế giới game*, React lo *giao diện*. Phần lớn scene trong một GDD (menu, shop, inventory, character, settings) là **pure-React, không cần Pixi world** — đây là điểm DX lớn nhất: agent viết TSX thuần, không đụng canvas.

`@pixi/react` chỉ là *optional escape hatch* khi muốn khai báo node in-world bằng JSX; không phải xương sống.

---

## 1. File structure

```
my-game/
├── src/
│   ├── core/                      # wrapper engine-agnostic (tách @studio/core sau)
│   │   ├── game.ts                # createGame + Game (boot Pixi App + React root)
│   │   ├── scene.ts               # BaseScene: world(Container) + Screen(React)
│   │   ├── scene-manager.ts       # go/push/pop + transition (canvas + DOM atomic)
│   │   ├── asset-loader.ts        # wrap Pixi Assets (bundle/backgroundLoad)
│   │   ├── services.ts            # ServiceRegistry (DI, type-safe key)
│   │   ├── bridge.ts              # store + command bus (Pixi ↔ React)
│   │   ├── view.ts                # resize/fit policy, design resolution → canvas + #ui-root
│   │   ├── plugins.ts             # GamePlugin interface
│   │   ├── react/                 # GameProvider, useGame, useScene, useStore, <Overlay>
│   │   └── index.ts
│   ├── scenes/                    # mỗi scene 1 folder: scene.ts (world) + Screen.tsx (UI)
│   │   ├── boot/
│   │   ├── menu/                  # vd: pure-React, world rỗng
│   │   └── game/                  # có Pixi world + HUD React
│   ├── ui/                        # shared React components (Button, Panel, Modal, …)
│   ├── services/                  # AudioService, SaveService, …
│   ├── plugins/
│   ├── gen/
│   │   ├── assets.gen.ts          # codegen từ AssetPack manifest (gitignore)
│   │   └── scenes.gen.ts          # (tuỳ chọn) union key của scene
│   └── main.tsx
├── raw-assets/                    # nguồn art thô → AssetPack xử lý
├── public/assets/                 # AssetPack output (optimized + manifest.json)
├── .assetpack.js                  # cấu hình AssetPack pipeline
├── scripts/gen-assets.ts          # manifest.json → assets.gen.ts (typed)
├── vite.config.ts
├── index.html                     # <div id="app"> + <div id="ui-root">
└── package.json
```

**Stack chốt cho draft:** Vite + TypeScript strict, PixiJS v8, React 19 + React DOM, AssetPack 1.x (asset pipeline chính chủ Pixi), Zustand (hoặc store nhỏ tự viết) cho bridge.

---

## 2. Core: `createGame` + `Game`

Khác cocos: `Game` boot **đồng thời** Pixi `Application` (canvas) và React root (overlay), rồi nối chúng qua `bridge`.

```ts
// src/core/game.ts
import { Application } from "pixi.js";
import { createRoot, type Root } from "react-dom/client";
import { SceneManager } from "./scene-manager";
import { AssetLoader } from "./asset-loader";
import { ServiceRegistry } from "./services";
import { createBridge, type Bridge } from "./bridge";
import { applyView } from "./view";
import { mountOverlay } from "./react/mount";
import type { GameConfig } from "./types";

export class Game {
  readonly config: Readonly<GameConfig>;
  readonly app: Application;           // 🔓 escape hatch: Pixi
  readonly scenes: SceneManager;
  readonly loader: AssetLoader;
  readonly services: ServiceRegistry;
  readonly bridge: Bridge;             // store + command bus

  private _reactRoot!: Root;
  private _started = false;

  constructor(config: GameConfig) {
    this.config = Object.freeze({ ...config });
    this.app = new Application();
    this.services = new ServiceRegistry();
    this.bridge = createBridge();
    this.loader = new AssetLoader();
    this.scenes = new SceneManager(this);
    config.scenes.forEach((s) => this.scenes.register(s));
  }

  async start(): Promise<void> {
    if (this._started) return;
    this._started = true;

    const mount = document.querySelector<HTMLElement>(this.config.mount ?? "#app");
    if (!mount) throw new Error(`Mount "${this.config.mount}" not found`);

    // 1) Pixi canvas (layer 1)
    await this.app.init({
      background: this.config.view.background ?? "#000",
      antialias: true,
      autoDensity: true,
      resolution: window.devicePixelRatio,
      resizeTo: mount,
    });
    mount.appendChild(this.app.canvas);
    applyView(this.app, this.config.view, mount);

    // 2) Asset manifest (codegen-friendly)
    await this.loader.init(this.config.manifest);

    // 3) React overlay (layer 2)
    this._reactRoot = mountOverlay(mount, this);

    // 4) plugins + hooks
    for (const p of this.config.plugins ?? []) await p.install(this);
    await this.config.hooks?.onReady?.(this);

    // 5) initial scene
    await this.scenes.go(this.config.initialScene);

    window.addEventListener("blur", () => this.config.hooks?.onPause?.());
    window.addEventListener("focus", () => this.config.hooks?.onResume?.());
  }

  stop(): void {
    this._reactRoot?.unmount();
    this.app.destroy(true, { children: true });
  }
}

export const createGame = (config: GameConfig) => new Game(config);
```

---

## 3. `BaseScene` — hai mặt: `world` (Pixi) + `Screen` (React)

Quyết định: scene **HAS-A** một `Container` (Pixi world) và **khai báo** một React component cho overlay. Pure-UI scene để `world` rỗng và làm hết trong `Screen`.

```ts
// src/core/scene.ts
import { Container } from "pixi.js";
import type { ComponentType } from "react";
import type { Game } from "./game";
import type { AssetLoader } from "./asset-loader";
import type { SceneBundle } from "./gen-types";

export interface SceneScreenProps<Data = unknown> {
  data: Data;
  scene: BaseScene<Data>;
}

export abstract class BaseScene<Data = unknown> {
  static readonly key: string;
  static readonly assets?: SceneBundle;            // bundle name(s) từ codegen
  static readonly Screen?: ComponentType<SceneScreenProps>; // React overlay cho scene

  readonly game: Game;
  readonly world: Container;                        // 🔓 escape hatch: Pixi root của scene
  protected readonly services: Game["services"];
  protected readonly store: Game["bridge"]["store"];

  private _disposers: Array<() => void> = [];
  private _tickFn?: (dt: number) => void;

  constructor(game: Game) {
    this.game = game;
    this.services = game.services;
    this.store = game.bridge.store;
    this.world = new Container();
  }

  // === Lifecycle (override) ===
  async onPreload(loader: AssetLoader): Promise<void> {
    const b = (this.constructor as typeof BaseScene).assets;
    if (b) await loader.loadBundle(b);
  }
  onCreate(_data: Data): void {}                    // build Pixi world (nếu có)
  onUpdate(_dt: number): void {}                    // per-frame (app.ticker)
  onDestroy(): void {}

  // === Helpers — auto cleanup ===
  spawn<T extends Container>(node: T, parent: Container = this.world): T {
    parent.addChild(node);
    this.onCleanup(() => node.destroy({ children: true }));
    return node;
  }
  onCleanup(fn: () => void): void {
    this._disposers.push(fn);
  }

  /** @internal SceneManager gọi sau khi attach world vào stage */
  _enableTick(): void {
    this._tickFn = (dt) => this.onUpdate(dt);
    this.game.app.ticker.add(this._tickFn);
  }
  /** @internal */
  _runDestroy(): void {
    if (this._tickFn) this.game.app.ticker.remove(this._tickFn);
    for (const fn of this._disposers.reverse())
      try { fn(); } catch (e) { console.error(e); }
    this._disposers.length = 0;
    this.world.destroy({ children: true });
    this.onDestroy();
  }
}
```

> Lưu ý DX: với scene UI thuần (menu/shop/inventory) agent **chỉ viết `static Screen = MenuScreen`** và để `onCreate` rỗng. Không phải đụng Pixi.

---

## 4. `SceneManager` — swap canvas world + DOM screen *atomic*

```ts
// src/core/scene-manager.ts
import type { Game } from "./game";
import type { BaseScene, SceneConstructor } from "./types";

export type Transition =
  | { type: "none" }
  | { type: "fade"; duration: number }                  // CSS opacity trên #ui-root + Pixi alpha
  | { type: "slide"; dir: "left" | "right" | "up" | "down"; duration: number };

export interface GoOptions { data?: unknown; transition?: Transition }

export class SceneManager {
  private _registry = new Map<string, SceneConstructor>();
  private _stack: BaseScene[] = [];

  constructor(private game: Game) {}

  register(c: SceneConstructor): void { this._registry.set(c.key, c); }
  get current(): BaseScene | null { return this._stack.at(-1) ?? null; }

  async go(key: string, opt: GoOptions = {}): Promise<BaseScene> {
    const next = await this._instantiate(key, opt);
    const prev = this.current;
    await this._transitionIn(prev, next, opt.transition);
    prev && this._teardown(prev);
    this._stack = [next];
    return next;
  }

  async push(key: string, opt: GoOptions = {}): Promise<BaseScene> {
    const next = await this._instantiate(key, opt);          // overlay: prev vẫn render dưới
    await this._transitionIn(this.current, next, opt.transition, true);
    this._stack.push(next);
    return next;
  }

  pop(): void {
    if (this._stack.length <= 1) return;
    const top = this._stack.pop()!;
    this._teardown(top);
    this._syncReactRoute();                                   // React route quay về scene dưới
  }

  private async _instantiate(key: string, opt: GoOptions): Promise<BaseScene> {
    const Ctor = this._registry.get(key);
    if (!Ctor) throw new Error(`Scene "${key}" not registered`);
    const scene = new Ctor(this.game);
    await scene.onPreload(this.game.loader);
    this.game.app.stage.addChild(scene.world);
    scene.onCreate(opt.data);                                 // build Pixi world
    scene._enableTick();
    this.game.bridge.setRoute(key, opt.data);                // React render scene.Screen
    return scene;
  }

  private _teardown(scene: BaseScene): void {
    scene.world.removeFromParent();
    (scene as any)._runDestroy();
  }
  // _transitionIn / _syncReactRoute: tween Pixi alpha + class trên #ui-root, để session sau chốt.
}
```

> **Push/pop = overlay tự nhiên**: pause menu, dialog, shop popup chỉ là `push` một scene mà `world` rỗng còn `Screen` là một `<Modal>` React. Z-order do React DOM lo (đặt sau trong tree / portal).

---

## 5. Bridge — single source of truth giữa Pixi và React

Đây là phần **mới so với cocos** (cocos không có 2 cây render). Nguyên tắc: **store là sự thật duy nhất**. Game logic (Pixi/service) *ghi*; React UI *đọc* qua selector; React UI gửi *ý định* trở lại qua command bus — không gọi thẳng vào Pixi.

```ts
// src/core/bridge.ts
import { createStore, type StoreApi } from "zustand/vanilla";

export interface GameState {
  route: { scene: string; data: unknown };
  hud: { coins: number; hp: number };               // ví dụ — game tự mở rộng
}

export type Command =
  | { type: "scene:go"; key: string; data?: unknown }
  | { type: "scene:pop" }
  | { type: "shop:buy"; itemId: string };

export interface Bridge {
  store: StoreApi<GameState>;
  dispatch(cmd: Command): void;                     // React → logic
  onCommand(handler: (cmd: Command) => void): () => void;
  setRoute(scene: string, data: unknown): void;
}

// Pixi side: bridge.store.setState(...) để cập nhật HUD.
// React side: useStore(s => s.hud.coins) + dispatch({type:'shop:buy', itemId}).
```

```tsx
// src/core/react/Overlay.tsx — gốc của layer 2
import { useGame, useStore } from "./hooks";
import { SCREENS } from "@/gen/scenes.gen"; // map sceneKey -> React component

export function Overlay() {
  const route = useStore((s) => s.route);
  const Screen = SCREENS[route.scene];
  return (
    <div id="ui-root" style={{ position: "absolute", inset: 0 }}>
      {Screen ? <Screen data={route.data} /> : null}
    </div>
  );
}
```

**Quy ước pointer-events:** `#ui-root` mặc định `pointer-events: none` để click "xuyên" xuống canvas; chỉ các widget tương tác (`button`, `panel`) bật `pointer-events: auto`. Nhờ vậy HUD overlay không chặn input game-world.

---

## 6. Asset codegen — AssetPack + typed manifest

Tận dụng **AssetPack** (pipeline asset chính chủ của Pixi): quét `raw-assets/`, tối ưu (texture, spritesheet, webp/avif, audio), và **sinh `manifest.json` theo bundle**. Bước codegen mỏng chỉ biến manifest đó thành type.

```js
// .assetpack.js
import { pixiPipes } from "@assetpack/core/pixi";
export default {
  entry: "./raw-assets",
  output: "./public/assets",
  pipes: pixiPipes({ manifest: { output: "./public/assets/manifest.json" } }),
};
```

Folder tags điều khiển bundle: `raw-assets/menu{m}/...` → bundle `menu`. Sau đó:

```ts
// scripts/gen-assets.ts — manifest.json → assets.gen.ts (typed)
// Đọc manifest.bundles → sinh:
//   export type BundleName = 'boot' | 'menu' | 'game'
//   export type AssetAlias = 'hero' | 'bgm' | ...
//   export const ASSETS = { hero: 'hero', bgm: 'bgm', ... } as const
// Khi agent gõ ASSETS.hero → autocomplete; loader.loadBundle('menu') không typo.
```

```ts
// src/core/asset-loader.ts
import { Assets } from "pixi.js";
export class AssetLoader {
  async init(manifestUrl = "/assets/manifest.json") {
    await Assets.init({ manifest: manifestUrl });
  }
  loadBundle(name: string) { return Assets.loadBundle(name); }
  backgroundBundle(name: string) { return Assets.backgroundLoadBundle(name); }
  get<T>(alias: string): T { return Assets.get(alias); }
}
```

> So với cocos-harness `generate-resources.mjs`: ý tưởng giống hệt (folder → typed paths), nhưng được nâng cấp nhờ AssetPack lo luôn **optimize + bundle split + manifest**. Codegen chỉ còn việc "đắp type".

---

## 7. Demo flow

```tsx
// src/main.tsx
import { createGame } from "@/core";
import { BootScene } from "@/scenes/boot/scene";
import { MenuScene } from "@/scenes/menu/scene";
import { GameScene } from "@/scenes/game/scene";
import { audioPlugin } from "@/plugins/audio";

createGame({
  mount: "#app",
  view: { design: [1280, 720], fit: "contain", background: "#1a1a2e" },
  manifest: "/assets/manifest.json",
  scenes: [BootScene, MenuScene, GameScene],
  initialScene: "Boot",
  plugins: [audioPlugin()],
  hooks: { onError: console.error },
}).start();
```

```tsx
// src/scenes/menu/scene.ts — PURE REACT scene (không Pixi world)
import { BaseScene } from "@/core";
import { MenuScreen } from "./Screen";
export class MenuScene extends BaseScene {
  static key = "Menu";
  static assets = "menu";
  static Screen = MenuScreen;          // toàn bộ UI nằm trong React
}
```

```tsx
// src/scenes/menu/Screen.tsx
import { useGame } from "@/core/react";
export function MenuScreen() {
  const game = useGame();
  return (
    <div className="menu" style={{ pointerEvents: "auto" }}>
      <h1>My Game</h1>
      <button onClick={() => game.scenes.go("Game")}>Play</button>
      <button onClick={() => game.scenes.push("Shop")}>Shop</button>
    </div>
  );
}
```

```ts
// src/scenes/game/scene.ts — Pixi world + React HUD
import { Sprite } from "pixi.js";
import { BaseScene } from "@/core";
import { ASSETS } from "@/gen/assets.gen";
import { GameHud } from "./Hud";
import type { AudioService } from "@/services/AudioService";

export class GameScene extends BaseScene<{ level?: number }> {
  static key = "Game";
  static assets = "game";
  static Screen = GameHud;             // HUD overlay (coins, pause button…)

  private hero!: Sprite;

  onCreate(data: { level?: number }) {
    this.hero = this.spawn(Sprite.from(ASSETS.hero));
    this.hero.anchor.set(0.5);
    this.hero.position.set(640, 360);
    this.services.get<AudioService>("audio").play(ASSETS.bgm);
  }
  onUpdate(dt: number) {
    this.hero.x += 0.6 * dt;
    this.store.setState((s) => ({ hud: { ...s.hud, coins: s.hud.coins } }));
  }
}
```

---

## 8. Vài chỗ cần verify khi session sau chốt thiết kế

1. **Store lib**: Zustand (vanilla + React) hay tự viết signal store mỏng? Trade-off: dependency vs control. Đề xuất Zustand cho tốc độ, nhưng giữ `bridge.ts` là interface để swap.
2. **Transition canvas ↔ DOM đồng bộ**: fade/slide phải khớp giữa Pixi alpha và CSS trên `#ui-root`. Cần 1 timeline chung (vd `@tweenjs/tween.js` hoặc Web Animations API) để không lệch frame.
3. **Resize/fit policy**: `contain`/`cover`/`fixed-width` — phải áp **cùng lúc** cho canvas (Pixi resolution) và `#ui-root` (CSS transform-scale hoặc design-token clamp). Quyết định: scale cả overlay theo design resolution, hay để overlay responsive thuần CSS?
4. **`@pixi/react` có dùng không**: chỉ khi cần khai báo node in-world bằng JSX. Mặc định **không**, để tránh 2 mental model. Để như optional plugin.
5. **HMR**: React Fast Refresh OK cho `ui/` + `Screen.tsx`. Pixi `world` (`scene.ts`) cần reload thủ công scene hiện tại — cần 1 vite HMR handler gọi `scenes.go(current.key)` khi module scene đổi.
6. **Asset codegen watch**: AssetPack `--watch` + vite plugin re-run `gen-assets.ts` khi `manifest.json` đổi.

---

## 9. Thứ tự build đề xuất

1. `Game` (boot Pixi App + React root) + `BaseScene` + `SceneManager.go()` — chạy 1 scene pure-React + 1 scene có world.
2. `bridge` (store + command bus) + `useStore`/`useGame` + `<Overlay>` — HUD đọc state, button dispatch.
3. AssetPack pipeline + `gen-assets.ts` + `AssetLoader.loadBundle` — DX asset type-safe.
4. `push/pop` + overlay (modal/pause/shop) + transition đồng bộ canvas↔DOM.
5. `ServiceRegistry` + plugins (audio, save).
6. Resize/fit policy + HMR strategy.
7. CLI scaffold `npx create-pixi-react-game`.

---

## 10. Bảng ánh xạ từ cocos-harness (để giữ nhất quán DX)

| cocos-harness | PixiJS + React-overlay | Ghi chú |
| --- | --- | --- |
| `createGame()/Game` (cc.game) | `createGame()/Game` (Pixi App + React root) | Boot 2 layer |
| `BaseScene` HAS-A `cc.Scene` | `BaseScene` HAS-A `Container` + `static Screen` React | Thêm mặt DOM |
| `cc` escape hatch | `app` (Pixi) + React | |
| `SceneManager.go/push/pop` + transition | y hệt API, swap canvas world + DOM route | |
| `schedule(cb,0)` update | `app.ticker.add` → `onUpdate(dt)` | |
| `generate-resources.mjs` → `resources.ts` | AssetPack manifest → `assets.gen.ts` | Nâng cấp: optimize+bundle |
| `ServiceRegistry` + plugins | y hệt (engine-agnostic) | Port thẳng |
| (không có) | `bridge` store + command bus | Mới: nối 2 cây render |
| `simulator-use` MCP (native sim) | browser-sim MCP (Playwright / chrome-devtools) | DOM + canvas inspectable sẵn |

---

## Sources

- [Introducing PixiJS React v8](https://pixijs.com/blog/pixi-react-v8-live)
- [PixiJS v8 Architecture](https://pixijs.com/8.x/guides/concepts/architecture)
- [PixiJS Assets guide](https://pixijs.com/8.x/guides/components/assets) · [Manifests & Bundles](https://pixijs.com/8.x/guides/components/assets/manifest)
- [AssetPack 1.0 release](https://pixijs.com/blog/assetpack-1.0.0) · [AssetPack manifest pipe](https://pixijs.io/assetpack/docs/guide/pipes/manifest/)
- [PixiJS Layout v3 (flexbox)](https://pixijs.com/blog/layout-v3)
- [Making adaptive UI layout in PixiJS easy with DOM](https://dev.to/schmooky/making-adaptive-ui-layout-in-pixijs-easy-with-dom-186j)
- [@pixi/react — useApplication](https://react.pixijs.io/hooks/useApplication/) · [extend](https://react.pixijs.io/extend/)
- [PixiJS Events / Interaction](https://pixijs.com/8.x/guides/components/events)
