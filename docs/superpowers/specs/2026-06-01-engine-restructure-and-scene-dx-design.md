# Engine Restructure (3 packages) + Scene Authoring DX — Design

**Status:** Approved (brainstorm), pending implementation plan.
**Date:** 2026-06-01

## Goal

Split the single `@studio/core` package into three compiler-isolated packages
(`core` / `pixi` / `react`), reorganize each package's internals by domain, and
sharpen the scene-authoring DX with type-safe navigation and typed scene data —
without changing runtime behavior.

## Motivation

The user selected all four drivers: publish-ready packages, internal cohesion,
better authoring DX, and reduced coupling. Today coupling between the kernel,
the Pixi layer, and the React layer is enforced only by a dependency-cruiser
lint rule (`kernel-agnostic`) inside one package; the kernel still physically
ships `pixi.js`/`react` as (dev/peer) dependencies, so it cannot be consumed
headless. Scene navigation (`go("Menu")`) takes a raw `string` — typos compile
and scene data is `unknown`.

The `tmp/` prototype (a separate 4-package engine: `engine-core`, `engine-pixi`,
`engine-react`, `engine-devtools`) was used only as a reference for fresh
perspective. We take its package-separation idea and its type-safe-navigation
idea, but reject its verbose multi-step wiring, its functional `scene.define`
model, its pervasive generic threading, and its `as unknown as` casts.

## Non-goals

- **Scene model stays class-based.** No functional `scene.define`.
- **`createGame` stays a single call.** No tmp-style multi-step wiring.
- **No behavior change.** This is a structural + type-level refactor. The
  existing 67 runtime tests are the regression guard and must stay green.
- Out of scope as separate future features: typed asset manifest (`KeysOfType`),
  example plugins (audio/save), CLI scaffold.

## Architecture

### Target package layout

```
packages/
  core/    @studio/core    headless — NO pixi.js, NO react, NO DOM in package.json
  pixi/    @studio/pixi     deps: @studio/core; peer: pixi.js
  react/   @studio/react    deps: @studio/core, @studio/pixi; peer: react, react-dom, pixi.js
                            ← owns createGame / Game
apps/demo  @studio/demo     deps: @studio/core, @studio/pixi, @studio/react, pixi.js, react, react-dom
```

Layering is now **compiler-enforced**: `@studio/core` cannot import Pixi or
React because they are absent from its `package.json`. The module resolver and
`tsc` reject any such import before lint runs.

### Dependency direction

```
core  ◄── pixi  ◄── react  ◄── demo
  ▲         ▲                    │
  └─────────┴────────────────────┘   (react and demo also depend on core directly)
```

No cycles. TS project references encode the build order
(`core` → `pixi` → `react` → `demo`); `tsc -b` walks them.

## What moves where

| Package | Modules |
|---|---|
| **core** | `store`, `bridge`, `services`, `scheduler`, `transition` (tween + easing), `input/` (types, runtime, define-input), `viewport` (pure coordinate math), and **all augmentable contract interfaces**: `GameState`, `CommandMap`, `InputActions`, and the **new `SceneMap`**. |
| **pixi** | `BaseScene`, `SceneManager`, `view` (applyView / fit / resize / orientation detection), `asset-loader`, `hmr`, `dev-fps`, `orientation` (lock), `input-source` (DOM pointer/keyboard source). |
| **react** | `GameProvider`, `Overlay`, `hooks` (useGame/useStore/useScene/useSceneStack), `mount`, `styles`, and the glue: **`createGame` / `Game`**. |

### Contract-ownership rule

Every augmentable contract interface lives in **core** as a pure type.
`SceneMap` maps scene key → scene *data shape* (e.g. `{ level: number }`), so it
references no Pixi types at all — core stays trivially headless.

Consequence: users only ever write `declare module "@studio/core"` — a single
augmentation target for `GameState`, `CommandMap`, `InputActions`, and
`SceneMap`. This keeps core as the canonical contract/kernel layer.

## Scene authoring DX

### Type-safe navigation + typed data

A new augmentable `SceneMap` interface in core maps scene key → scene data
shape, mirroring the existing `CommandMap` pattern exactly:

```ts
// core — pure contract
/** Empty by design — games populate it via declaration merging. */
export interface SceneMap {}
```

```ts
// apps/demo/src/scenes/index.ts — single declaration, the source of truth for keys
declare module "@studio/core" {
  interface SceneMap {
    Boot: void
    Menu: void
    Game: { level: number }
    Pause: void
  }
}
```

`SceneManager.go` and `push` become key-and-data typed:

```ts
go<K extends GoKey>(key: K, opts?: GoOptions<SceneDataFor<K>>): Promise<void>
push<K extends GoKey>(key: K, opts?: GoOptions<SceneDataFor<K>>): Promise<void>
```

where:

```ts
type AnyKey = keyof SceneMap & string
// Empty-fallback: when SceneMap is unaugmented, keys widen to string so headless
// users and tests are not forced to augment. Same trick as ButtonName/AxisName.
type GoKey = [AnyKey] extends [never] ? string : AnyKey
type SceneDataFor<K> = K extends keyof SceneMap ? SceneMap[K] : unknown
```

Resulting behavior:

```ts
game.scenes.go("Game", { data: { level: 3 } })  // OK
game.scenes.go("Gmae")                            // compile error: unknown key
game.scenes.go("Game", { data: { lvl: 3 } })      // compile error: wrong data shape
```

### Relationship to the scene class

The scene class keeps its `BaseScene<Data>` generic so `onCreate(data: Data)` is
typed within the class body. `SceneMap` independently types the *navigation*
surface. The two are declared in separate places (the class generic and the
`SceneMap` entry) — the same two-source situation `CommandMap` already has
relative to its handlers. A `.test-d.ts` asserts they stay in sync; drift
becomes a failing type-test, not a silent runtime mismatch.

`GoOptions` is generalized to carry the data type:

```ts
export interface GoOptions<Data = unknown> {
  data?: Data
  transition?: Transition
}
```

`RouteEntry.data` and `SceneStackEntry.data` remain `unknown` — the route mirror
is heterogeneous across scenes, and typing it per-entry adds no value.

## Internal cohesion

Within each package, group files into **domain folders** and dissolve the
162-line `types.ts` grab-bag into domain-local type files:

- View types (`ViewState`, `Viewport`, `ViewConfig`, `ViewFit`, `Orientation`)
  live with the view/viewport code.
- Scene contracts (`SceneContext`, `SceneScreenProps`, `SceneStackEntry`,
  `SceneManagerHost`, `SceneMap`, `GoOptions`, `Transition`, `RouteEntry`) live
  with the scene code.
- Frame/time types (`FrameInfo`, `TickerLike`, `FrameLoop`, `ScheduleHandle`)
  live with the scheduler.
- Game-config types (`GameConfig`, `GameHooks`, `GamePlugin`) live with
  `createGame` in the react package.

**No per-file `index.ts` barrels** (tmp's approach). Most files are 20–40 lines;
wrapping each in a barrel is ceremony that fights KISS. Barrels exist only at
each package root (`index.ts`) and where a folder has genuine internal structure
(e.g. `input/`). The cohesion win is eliminating the central type grab-bag, not
adding indirection.

The exact final folder tree per package is left to the implementation plan; the
binding rules are: (1) group by domain, (2) co-locate types with the code that
owns them, (3) barrels only where they earn their keep.

## Error handling

Unchanged. The existing `onError` hook flow (threaded into `SceneManager`,
`createFrameLoop`, `createInputRuntime`), the immutable store updates, and the
scene lifecycle teardown (`_runDestroy` reverse-order disposers) all move
verbatim. No new error paths are introduced by a structural refactor.

## Testing & tooling

- **Regression guard:** all 67 existing runtime tests stay green at every step.
- **New scoped type-tests** (`.test-d.ts`, vitest `--typecheck` + `expectTypeOf`):
  - `SceneMap` navigation — `go`/`push` key union, rejection of unknown keys,
    data-shape enforcement, and `onCreate` param alignment.
  - `InferInputActions` / input facade return shapes (`axis(...)` → `{x,y}`).
  - `CommandMap` discriminated-union exhaustiveness.
- **`vitest.config.ts`:** repath `coverage.include`, `coverage.exclude`, and
  `environmentMatchGlobs` from `packages/core/src` to `packages/*/src`
  (React DOM glob becomes `packages/react/src/**`); add `test.typecheck.include`
  for `**/*.test-d.ts`.
- **Coverage:** 80% threshold (global) unchanged; DOM-glue exclusions
  (`view.ts`, `input-source.ts`, `dev-fps.ts`, `mount.tsx`, `styles.ts`,
  `index.ts`, `game.ts`) carry over to their new package paths.
- **dependency-cruiser:** remove the now-redundant `kernel-agnostic` rule
  (package manifests enforce it); keep `no-circular`, scoped across all
  `packages/*/src`. Update the `depcruise` script's target path.

## Toolchain mechanics

- Package `exports`/`main`/`types` keep pointing at `./src/index.ts` (source
  consumption — no build step needed for dev; Vite/Vitest resolve TS directly).
  Each new package mirrors this.
- `tsconfig.json` per package extends `tsconfig.base.json`, sets
  `rootDir: src` / `outDir: dist`, and declares `references` to its dependency
  packages (`pixi` → core; `react` → core, pixi; `demo` → core, pixi, react).
- Root scripts updated: `typecheck` (`tsc -b` over all package paths), `build`
  (`--filter` over core→pixi→react→demo), `depcruise` target.
- `pnpm-workspace.yaml` already globs `packages/*`; the three new package dirs
  are picked up automatically.
- **Not committed** (per standing constraints): the `.gitignore` `/tmp` change
  and the `package.json` `packageManager` field.

## Migration strategy

Ordered steps, each gated by `tsc -b` + `vitest run` + `depcruise` all green,
each committed separately (same rhythm as the prior 4-cluster build):

1. **Scaffold `@studio/core` boundary** — create the package, move kernel +
   input + viewport + all contract interfaces, dissolve `types.ts` into
   domain-local type files. Update internal import paths. → green
2. **Scaffold `@studio/pixi`** — create the package, move the renderer layer,
   add project reference + dependency on core. → green
3. **Scaffold `@studio/react`** — create the package, move the overlay +
   `createGame`/`Game`, add project references + dependencies on core and pixi.
   → green
4. **Update `apps/demo` + root configs** — repoint demo imports across the three
   packages; update `vitest.config.ts`, `.dependency-cruiser.cjs`, root
   `package.json` scripts, project references. → green
5. **Add type-safe `SceneMap` navigation** — generalize `GoOptions<Data>`,
   retype `go`/`push`, add the `SceneMap` contract and the demo's augmentation,
   add the scoped `.test-d.ts` files and vitest typecheck config. → green

## Success criteria

- `@studio/core`'s `package.json` lists no `pixi.js`/`react`/`react-dom`
  dependency (dev, peer, or runtime); importing either from core source fails to
  compile.
- `apps/demo` imports `createGame` from `@studio/react`, scene/Pixi types from
  `@studio/pixi`, and kernel types from `@studio/core`.
- `game.scenes.go("Gmae")` and a wrong-shaped `data` both fail `tsc`; the
  `.test-d.ts` files encode these as assertions.
- `tsc -b`, `vitest run` (incl. `--typecheck`), and `depcruise` all pass.
- Coverage remains ≥ 80% global.
- The demo runs in the browser with unchanged behavior (hero movement, tap-warp,
  coin interval, FPS overlay).
