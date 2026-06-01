# Design — PixiJS + React-overlay core foundation (v1)

> Scope: the **first build cycle** of the harness described in
> [`../../pixi-react-harness-requirements.md`](../../pixi-react-harness-requirements.md).
> Covers only the **runnable foundation** (brief §4.1 + transitions). Asset
> pipeline/codegen, browser-sim MCP, agent skills, and the GDD→game verification
> loop are deferred to later spec → plan → build cycles.

## 1. Goal

Stand up the engine-agnostic-where-possible core that boots a PixiJS v8 canvas
(game world) and a React DOM overlay (UI) side by side, wires them through a
single store + command bus, and runs scenes with `go`/`push`/`pop` and
canvas↔DOM-synced transitions. Success = the brief's Definition-of-Done items
1–3 pass, demonstrated by a runnable `apps/demo`.

## 2. Locked decisions (this cycle)

| # | Decision | Choice |
|---|----------|--------|
| Store | What backs the bridge store | Tiny custom reactive store behind a `Bridge` interface (zero runtime deps, fakeable; Zustand can drop in later without touching consumers) |
| Fit | Canvas + overlay scaling | Fixed **design resolution** + uniform CSS `transform: scale()` on `#ui-root`, matched to the canvas fit factor (`contain`/`cover`) |
| Repo | Layout | **pnpm monorepo** — `packages/core` (harness) + `apps/demo` (example game) |
| Transitions | Canvas↔DOM sync | **Single clock**: the Pixi ticker drives both `world.alpha` and the `#ui-root` opacity/transform from one progress value |
| `@pixi/react` | Inclusion | **Out of v1 entirely** (per brief §8) |

## 3. Monorepo layout

```
pixi-game-engine/
├── package.json                # pnpm workspace root, scripts, dev tooling
├── pnpm-workspace.yaml          # packages/*, apps/*
├── tsconfig.base.json           # strict TS shared config
├── .dependency-cruiser.cjs      # enforce core boundary
├── packages/core/
│   ├── package.json             # name: @studio/core
│   ├── tsconfig.json
│   └── src/
│       ├── game.ts              # createGame + Game (boot Pixi App + React root)
│       ├── scene.ts             # BaseScene: world(Container) + static Screen
│       ├── scene-manager.ts     # go/push/pop + transition orchestration
│       ├── bridge.ts            # store + command bus     (NO pixi/react import)
│       ├── store.ts             # tiny reactive store      (NO pixi/react import)
│       ├── services.ts          # ServiceRegistry (typed)  (NO pixi/react import)
│       ├── view.ts              # design-res fit → canvas + #ui-root scale
│       ├── transition.ts        # tween helper + canvas/DOM sync driver
│       ├── types.ts             # GameConfig, Transition, public types
│       ├── react/
│       │   ├── mount.tsx        # mountOverlay(root, game)
│       │   ├── GameProvider.tsx # React context for the Game instance
│       │   ├── Overlay.tsx      # renders the scene-stack's Screens
│       │   └── hooks.ts         # useGame, useScene, useStore
│       └── index.ts             # public surface
└── apps/demo/
    ├── package.json             # depends on @studio/core (workspace:*)
    ├── index.html               # <div id="app">
    ├── vite.config.ts
    └── src/
        ├── main.tsx             # createGame({...}).start()
        └── scenes/
            ├── boot/scene.ts
            ├── menu/{scene.ts,Screen.tsx}     # pure-React, empty world
            ├── game/{scene.ts,Hud.tsx}        # Pixi world + React HUD
            └── pause/{scene.ts,Screen.tsx}    # push-modal, empty world
```

`#ui-root` is created and managed by core (injected into the mount element), not
authored in `index.html`, so the overlay's positioning/pointer-events/scale
invariants live in one place.

## 4. Engine-agnostic boundary

`store.ts`, `bridge.ts`, and `services.ts` are pure TypeScript and **must not**
import `pixi.js` or `react`. These are the units tested directly with fakes.

`game.ts`, `scene.ts`, and `scene-manager.ts` may use Pixi — the `Game.app`
(`Application`) and `BaseScene.world` (`Container`) escape hatches are explicit
and intentional. The `react/` folder may use React.

`.dependency-cruiser.cjs` encodes a rule that **fails the build** if `store`,
`bridge`, or `services` import `pixi.js` or `react` (directly or transitively).

## 5. Public API surface (`packages/core/src/index.ts`)

Exported types and values, all with explicit signatures:

- `createGame(config: GameConfig): Game` and the `Game` class
- `BaseScene<Data>` abstract class + `SceneScreenProps<Data>`
- `SceneManager`, `Transition`, `GoOptions`
- `Bridge`, `GameState`, `Command` (the latter two are generic/extension points)
- `ServiceRegistry`, `ServiceKey<T>`
- React glue: `GameProvider`, `useGame`, `useScene`, `useStore`, `Overlay`
- `GameConfig`, `ViewConfig`

## 6. The store (`store.ts`)

A minimal reactive store, no dependency:

```ts
interface Store<S> {
  getState(): Readonly<S>
  setState(update: (prev: Readonly<S>) => S): void   // immutable: returns new state
  subscribe(listener: () => void): () => void
}
function createStore<S>(initial: S): Store<S>
```

- `setState` takes an updater that returns a **new** state object (immutability rule).
- Listeners are notified synchronously after state replaces.
- The React `useStore(selector)` hook is built on `useSyncExternalStore` with the
  store's `subscribe`/`getState`, re-rendering only when the selected slice changes
  (referential equality on the selected value).

## 7. The bridge (`bridge.ts`)

```ts
interface Bridge {
  store: Store<GameState>
  dispatch(cmd: Command): void               // React → logic
  onCommand(handler: (cmd: Command) => void): () => void
  setRoute(stack: ReadonlyArray<RouteEntry>): void  // logic → store route stack
}
type RouteEntry = { scene: string; data: unknown }
```

`GameState` holds at minimum `{ route: RouteEntry[] }`; games extend it (HUD
fields etc.). `Command` is an open discriminated union the game extends.
`bridge` is the only thing that knows about both the store shape and the command
bus; it imports neither Pixi nor React.

## 8. Scenes (`scene.ts`)

`BaseScene<Data>` per the skeleton spec §3, with:

- `static key: string`, `static assets?` (typed later), `static Screen?: ComponentType<SceneScreenProps>`
- instance `world: Container`, access to `services` and `store`
- lifecycle `onPreload`/`onCreate(data)`/`onUpdate(dt)`/`onDestroy`
- `spawn(node, parent?)` + `onCleanup(fn)` for auto-teardown
- `_enableTick()` / `_runDestroy()` internal hooks called by `SceneManager`

Teardown runs disposers in **reverse** registration order, removes the tick
function, destroys the world, then calls `onDestroy`. Errors in a disposer are
caught and surfaced via the configured error hook (not `console.error` in
library code), so one failing disposer can't strand the rest.

Pure-React scenes set only `static Screen` and leave `onCreate` empty (empty
world). This is the headline DX: most GDD scenes are TSX-only.

## 9. Scene stack ↔ Overlay (no codegen in v1)

Each scene class carries its `static Screen`. `SceneManager` owns the live scene
stack and mirrors it into `store.route` (an array of `RouteEntry`).
`Overlay` renders the stack's Screens in order:

```tsx
function Overlay() {
  const scenes = useSceneStack()           // from SceneManager via store
  return (
    <div id="ui-root" /* pointer-events:none, design-res, transform:scale */>
      {scenes.map((s) => s.Screen
        ? <s.Screen key={s.key} data={s.data} scene={s.instance} />
        : null)}
    </div>
  )
}
```

DOM order = z-order, so a `push`ed modal's Screen renders above the underlying
scene's Screen for free. No generated `SCREENS` map is needed; when scene/asset
codegen lands in a later cycle it only adds typed keys and changes nothing here.

## 10. SceneManager (`scene-manager.ts`)

- `register(ctor)`, `go(key, opt)`, `push(key, opt)`, `pop()`, `current`
- `_instantiate`: construct → `onPreload(loader-stub-for-now)` → add `world` to
  `app.stage` → `onCreate(data)` → `_enableTick()` → update route stack
- `go`: instantiate next, run transition in, teardown previous, replace stack
- `push`: instantiate next over current (previous stays mounted underneath),
  transition in, push to stack
- `pop`: guard depth > 1, teardown top, sync route stack back
- Transition orchestration delegates to `transition.ts`

Note: the brief's `asset-loader` is a later cycle; for v1 `onPreload` receives a
**no-op/stub loader** (or is simply called with the bundle name ignored) so
scenes compile against the final signature without the AssetPack pipeline yet.

## 11. Transitions (`transition.ts`)

```ts
type Ease = (t: number) => number
function tween(ticker: Ticker, durationMs: number, ease: Ease,
               onProgress: (t: number) => void): Promise<void>
```

`tween` adds a callback to the Pixi ticker; each frame accumulates elapsed time,
computes `t = ease(clamp(elapsed/duration, 0, 1))`, calls `onProgress(t)`, and
resolves + removes itself at `t === 1`. The `SceneManager` uses it to drive
`next.world.alpha` (canvas) and an overlay opacity value the React root reads
(DOM) from the **same** `t`. `Transition.none` resolves immediately. Single
clock ⇒ no cross-tree frame drift. Supported v1: `none`, `fade`. `slide` typed
but may be a follow-up within this cycle.

## 12. View / fit (`view.ts`)

```ts
function applyView(app: Application, view: ViewConfig, mount: HTMLElement,
                   uiRoot: HTMLElement): () => void   // returns disposer
function fit(designW, designH, boxW, boxH, mode: 'contain' | 'cover'): number
```

On init and on resize: compute one `scale`. The Pixi world is authored in design
coordinates (e.g. 1280×720); `#ui-root` is sized to the design resolution and
gets `transform: translate(center) scale(scale)`. Both layers share the single
scale factor, so a point at design `(640, 360)` maps to the same screen pixel in
canvas and DOM.

## 13. Pointer-events convention

Base CSS: `#ui-root { pointer-events: none }` so clicks fall through to the
canvas by default. Interactive widgets (`button`, panels) set
`pointer-events: auto`. A shared `ui-root.css` (or inline base style) ships this
rule; the convention is documented for scene authors.

## 14. Testing strategy

Per project rules (TDD on `core/`, ≥80% coverage for core):

- **Vitest unit (pure, no DOM/Pixi):**
  - `store`: subscribe fires on change, unsubscribe stops, selector equality
  - `bridge`: `dispatch` reaches `onCommand` handlers; `setRoute` updates store
  - `services`: typed `register`/`get`, missing-key error
  - `transition.tween`: progress math + resolution (fake ticker)
  - `view.fit`: contain/cover math across aspect ratios
- **Integration (jsdom) against a fake Game** (fake ticker, fake stage =
  array-backed, real store):
  - `SceneManager.go` lifecycle order: `onPreload → stage.add → onCreate → tick on`
  - teardown order: tick removed → disposers reverse → world destroyed → `onDestroy`
  - `push` keeps previous scene mounted; `pop` restores route stack; `pop` at
    depth 1 is a no-op
- **E2E (Playwright):** deferred to a later cycle per the brief. `apps/demo` is
  the manual runnable proof of DoD 1–3 for now.

## 15. Acceptance (brief Definition-of-Done, items 1–3)

- [ ] `createGame().start()` boots canvas + overlay; demo runs a **pure-React**
      scene (Menu) and a **Pixi-world+HUD** scene (Game)
- [ ] `go`/`push`/`pop` work; a **Pause** modal via `push` over Game
- [ ] Bridge store + command bus: HUD reads state; a React button `dispatch`es a
      command that changes state/scene; clicking an empty overlay region falls
      through to the canvas (pointer-events correct)
- [ ] TS strict, no `any`/`as any`/`!`; files within size budget; no
      `console.log` in library code; dependency-cruiser passes (`bridge`/`store`/
      `services` leak neither Pixi nor React)
- [ ] core unit + integration tests pass; coverage ≥ 80% for `packages/core/src`

## 16. Explicitly out of scope (later cycles)

AssetPack pipeline + `assets.gen.ts` codegen + Vite watch; the real
`AssetLoader`; browser-sim MCP; agent skills (scene-convention, tester, Pixi
guide); CLI scaffold; the GDD→game IR + verification loop; `@pixi/react` escape
hatch. The v1 `onPreload` loader argument is a stub shaped like the final API so
these slot in without reworking scene signatures.

## 17. Known pitfalls carried from brief §8

- Pixi is y-**down**, origin top-left — document in scene authoring guide (later cycle); design coords assume this.
- Two render trees can drift — the single-clock transition + shared scale factor + store-as-truth are the mitigations.
- Forgetting `pointer-events: none` on `#ui-root` swallows game input — shipped as a base rule (§13).
- Pixi `world` does not hot-reload naturally — a Vite HMR handler that re-`go`es the current scene on `scene.ts` change is a nice-to-have within this cycle, not gating.
