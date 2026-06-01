# Engine Restructure (3 packages) + Scene DX — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split `@studio/core` into three compiler-isolated packages (`@studio/core` headless kernel / `@studio/pixi` renderer / `@studio/react` overlay+bootstrap), reorganize internals by domain, and add type-safe scene navigation with typed scene data — with zero runtime behavior change.

**Architecture:** Top-down extraction. React layer leaves `core` first (depends on `core` while Pixi still nests inside it), then the Pixi layer leaves (`react` repoints to it, `core` becomes a clean kernel). Then `core`'s `types.ts` grab-bag is dissolved into co-located type files. Finally tooling is repointed and the `SceneMap`-based typed navigation is layered on. Every task ends with `tsc -b` + `vitest run` + `depcruise` all green and a commit.

**Tech Stack:** TypeScript 5.7 (composite project references, `verbatimModuleSyntax`, `exactOptionalPropertyTypes`), pnpm workspaces, PixiJS v8, React 19, Vitest 2 (incl. `--typecheck`), dependency-cruiser 16.

---

## Conventions for every task

- **Verification gate** (run from repo root after edits, before committing):
  ```bash
  pnpm typecheck && pnpm test && pnpm depcruise
  ```
  All three must pass. `pnpm typecheck` / `pnpm depcruise` script bodies are updated in Task 5; until then use the existing root scripts, extended ad-hoc as each task notes.
- **Never commit** the working-tree `.gitignore` change (the `/tmp` entry) or the `package.json` `packageManager` field — leave both unstaged.
- **Commit trailer** (every commit):
  ```
  Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
  ```
- **No `any` / `as` / `!`**, immutability, no `console.log` in library code. Match existing style.
- **Imports:** within a package use relative paths; across packages use the package name (`@studio/core`, `@studio/pixi`). `verbatimModuleSyntax` is on — keep `import type` for type-only imports.
- Use `git mv` for moves (preserves history); the engineer must `pnpm install` after any `package.json` dependency change so workspace symlinks update.

---

## File Structure (target end-state)

```
packages/
  core/   @studio/core        deps: (none)            — headless kernel + all augmentable contracts
    src/
      store.ts            store.test.ts
      bridge.ts           bridge.test.ts
      services.ts         services.test.ts
      scheduler.ts        scheduler.test.ts        ← owns FrameInfo, TickerLike, ScheduleHandle, FrameLoop
      transition.ts       transition.test.ts
      viewport.ts         viewport.test.ts         ← owns ViewFit, Orientation, ViewConfig, ViewState, Viewport
      scene-contract.ts                            ← SceneContext, Transition, GoOptions<Data>, RouteEntry,
                                                     GameState, CommandMap, Command, SceneMap, SceneKey
      input/  types.ts  runtime.ts  define-input.ts  (+ tests, + types.test-d.ts)
      index.ts
  pixi/   @studio/pixi        deps: @studio/core; peer: pixi.js, react(type-only)
    src/
      scene/
        base-scene.ts        (was pixi/scene.ts)
        scene-manager.ts     (was pixi/scene-manager.ts)
        types.ts             ← SceneScreenProps, SceneStackEntry, SceneManagerHost
        hmr.ts               (was pixi/hmr.ts)
      view/view.ts           (was pixi/view.ts)
      assets/asset-loader.ts (was pixi/asset-loader.ts)
      input/dom-source.ts    (was pixi/input-source.ts)
      dev/dev-fps.ts         (was pixi/dev-fps.ts)
      orientation.ts         (was pixi/orientation.ts)
      index.ts
  react/  @studio/react       deps: @studio/core, @studio/pixi; peer: pixi.js, react, react-dom
    src/
      GameProvider.tsx  Overlay.tsx  hooks.ts  mount.tsx  styles.ts
      game.ts              (was core/src/game.ts — createGame / Game)
      config.ts            ← GameConfig, GameHooks, GamePlugin
      index.ts
apps/demo  @studio/demo       deps: @studio/core, @studio/pixi, @studio/react, pixi.js, react, react-dom
```

**Type partition rationale:** every type that references a Pixi value (`Container`, `BaseScene`, `AssetLoader`, `Application`) or a React component type (`ComponentType`) leaves `core`. `SceneContext` references only kernel types (`Store`, `ServiceRegistry`, `Viewport`, `InputRuntime`, `FrameLoop`) so it stays in `core` — that's what lets the Pixi `BaseScene` receive a core-defined context. `SceneMap` maps key → data shape (no Pixi/React reference), so it stays in `core`.

---

## Task 1: Scaffold the `@studio/pixi` and `@studio/react` skeleton packages

**Files:**
- Create: `packages/pixi/package.json`, `packages/pixi/tsconfig.json`, `packages/pixi/src/index.ts`
- Create: `packages/react/package.json`, `packages/react/tsconfig.json`, `packages/react/src/index.ts`

- [ ] **Step 1: Create `packages/pixi/package.json`**

```json
{
  "name": "@studio/pixi",
  "version": "0.0.0",
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": { ".": "./src/index.ts" },
  "scripts": { "build": "tsc -b" },
  "dependencies": { "@studio/core": "workspace:*" },
  "peerDependencies": { "pixi.js": "^8.6.0", "react": "^19.0.0" },
  "devDependencies": { "pixi.js": "^8.6.0", "react": "^19.0.0", "@types/react": "^19.0.0" }
}
```

- [ ] **Step 2: Create `packages/pixi/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "rootDir": "src", "outDir": "dist", "tsBuildInfoFile": "dist/.tsbuildinfo" },
  "references": [{ "path": "../core" }],
  "include": ["src"]
}
```

- [ ] **Step 3: Create `packages/react/package.json`**

```json
{
  "name": "@studio/react",
  "version": "0.0.0",
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": { ".": "./src/index.ts" },
  "scripts": { "build": "tsc -b" },
  "dependencies": { "@studio/core": "workspace:*", "@studio/pixi": "workspace:*" },
  "peerDependencies": { "pixi.js": "^8.6.0", "react": "^19.0.0", "react-dom": "^19.0.0" },
  "devDependencies": {
    "pixi.js": "^8.6.0", "react": "^19.0.0", "react-dom": "^19.0.0",
    "@types/react": "^19.0.0", "@types/react-dom": "^19.0.0"
  }
}
```

- [ ] **Step 4: Create `packages/react/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "rootDir": "src", "outDir": "dist", "tsBuildInfoFile": "dist/.tsbuildinfo" },
  "references": [{ "path": "../core" }, { "path": "../pixi" }],
  "include": ["src"]
}
```

- [ ] **Step 5: Create placeholder barrels so the empty packages compile**

`packages/pixi/src/index.ts`:
```ts
export {};
```
`packages/react/src/index.ts`:
```ts
export {};
```

- [ ] **Step 6: Link the workspace**

Run: `pnpm install`
Expected: pnpm reports the two new workspace packages linked; no error. (`pnpm-workspace.yaml` already globs `packages/*`.)

- [ ] **Step 7: Verify the skeletons typecheck**

Run: `pnpm exec tsc -b --pretty packages/core packages/pixi packages/react apps/demo`
Expected: exit 0. (Empty packages compile; nothing depends on them yet.)

- [ ] **Step 8: Verify existing suite still green**

Run: `pnpm test && pnpm depcruise`
Expected: 67 tests pass; depcruise reports no violations.

- [ ] **Step 9: Commit**

```bash
git add packages/pixi packages/react pnpm-lock.yaml
git commit -m "chore(engine): scaffold @studio/pixi and @studio/react packages

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Extract the React layer (overlay + `createGame`) into `@studio/react`

After this task, `@studio/react` depends on `@studio/core` (which still nests the Pixi layer); `core` no longer references React.

**Files:**
- Move: `packages/core/src/react/{GameProvider.tsx,Overlay.tsx,hooks.ts,mount.tsx,styles.ts}` → `packages/react/src/`
- Move: `packages/core/src/react/{Overlay.dom.test.tsx,hooks.dom.test.tsx}` → `packages/react/src/`
- Move: `packages/core/src/game.ts` → `packages/react/src/game.ts`; `packages/core/src/game.dom.test.ts` → `packages/react/src/game.dom.test.ts`
- Create: `packages/react/src/config.ts` (carved from `types.ts`)
- Modify: `packages/core/src/types.ts` (remove `GameConfig`/`GameHooks`/`GamePlugin`), `packages/core/src/index.ts`
- Modify: `apps/demo/src/main.tsx`, `apps/demo/src/scenes/game/Hud.tsx`, `apps/demo/src/scenes/menu/Screen.tsx`, `apps/demo/src/scenes/pause/Screen.tsx`

- [ ] **Step 1: Move the React files and their tests**

```bash
git mv packages/core/src/react/GameProvider.tsx packages/react/src/GameProvider.tsx
git mv packages/core/src/react/Overlay.tsx packages/react/src/Overlay.tsx
git mv packages/core/src/react/hooks.ts packages/react/src/hooks.ts
git mv packages/core/src/react/mount.tsx packages/react/src/mount.tsx
git mv packages/core/src/react/styles.ts packages/react/src/styles.ts
git mv packages/core/src/react/Overlay.dom.test.tsx packages/react/src/Overlay.dom.test.tsx
git mv packages/core/src/react/hooks.dom.test.tsx packages/react/src/hooks.dom.test.tsx
git mv packages/core/src/game.ts packages/react/src/game.ts
git mv packages/core/src/game.dom.test.ts packages/react/src/game.dom.test.ts
rmdir packages/core/src/react
```

- [ ] **Step 2: Create `packages/react/src/config.ts`** (the game-config types, carved out of `core/src/types.ts`)

`SceneConstructor` is needed here. The Pixi layer is still physically inside `packages/core/src/pixi` this task and re-exported from `@studio/core`'s barrel, so import it from `@studio/core` now; Task 3 Step 9 switches that one specifier to `@studio/pixi`.

```ts
import type { GameState, ViewConfig, SceneConstructor, InputMapDef } from "@studio/core";
import type { Game } from "./game";

export interface GamePlugin {
  install(game: Game): void | Promise<void>;
}

export interface GameHooks {
  onReady?(game: Game): void | Promise<void>;
  onError?(error: unknown): void;
}

export interface GameConfig {
  mount?: string;
  view: ViewConfig;
  initialScene: string;
  initialState: Omit<GameState, "route">;
  scenes: SceneConstructor[];
  input?: InputMapDef;
  manifest?: string;
  plugins?: GamePlugin[];
  hooks?: GameHooks;
  dev?: { fps?: boolean };
}
```

- [ ] **Step 3: Rewrite imports in the moved React files**

In each moved file, rewrite the import specifiers per this table:

| File | Old specifier | New specifier |
|---|---|---|
| `GameProvider.tsx` | `../game` | `./game` |
| `hooks.ts` | `../types` | `@studio/core` *(for `SceneStackEntry` etc.)* and `@studio/pixi` is **not** needed yet |
| `hooks.ts` | `./GameProvider` | `./GameProvider` *(unchanged)* |
| `mount.tsx` | `../game` | `./game` |
| `mount.tsx` | `./GameProvider`, `./Overlay` | unchanged |
| `Overlay.tsx` | `./hooks` | unchanged |

For `hooks.ts`, the `../types` import currently pulls scene/route types. Those are still exported by `@studio/core`'s barrel in this task, so:
```ts
// hooks.ts — was: import type { ... } from "../types";
import type { /* same symbols */ } from "@studio/core";
```
(Read `hooks.ts` to copy the exact symbol list; only the specifier string changes.)

Also rewrite the two **moved test files** (`Overlay.dom.test.tsx`, `hooks.dom.test.tsx`). They currently import via `../` relative paths; every such specifier becomes `@studio/core` except `../game` → `./game`. Concretely: `../bridge`, `../services`, `../pixi/asset-loader`, `../pixi/scene-manager`, `../pixi/scene`, `../pixi/viewport` (`createViewport`), `../input/runtime` (`emptyInputRuntime`), `../scheduler` (`emptyFrameLoop`), `../types` → all `@studio/core`; `../game` → `./game`. (These resolve because Step 6 adds `createViewport`/`emptyFrameLoop`/`emptyInputRuntime` to core's barrel and the Pixi layer is still re-exported from core this task. In Task 3 Step 9, repoint the Pixi symbols — `AssetLoader`, `SceneManager`, `BaseScene` — in these two test files from `@studio/core` to `@studio/pixi`.) Likewise rewrite `game.dom.test.ts`: `../game` → `./game`, and any `../pixi/*` / `../*` kernel imports → `@studio/core` (Pixi ones move to `@studio/pixi` in Task 3).

- [ ] **Step 4: Rewrite imports in the moved `game.ts`**

`game.ts` becomes the React package's bootstrap. Rewrite its imports:

| Old specifier | New specifier |
|---|---|
| `./bridge` | `@studio/core` |
| `./services` | `@studio/core` |
| `./scheduler` | `@studio/core` |
| `./input/runtime` | `@studio/core` |
| `./input/types` | `@studio/core` |
| `./pixi/asset-loader` | `@studio/core` *(still re-exported from core this task; → `@studio/pixi` in Task 3)* |
| `./pixi/scene-manager` | `@studio/core` *(→ `@studio/pixi` in Task 3)* |
| `./pixi/hmr` | `@studio/core` *(→ `@studio/pixi` in Task 3)* |
| `./pixi/view` | `@studio/core` *(→ `@studio/pixi` in Task 3)* |
| `./pixi/input-source` | `@studio/core` *(→ `@studio/pixi` in Task 3)* |
| `./pixi/dev-fps` | `@studio/core` *(→ `@studio/pixi` in Task 3)* |
| `./pixi/orientation` | `@studio/core` *(→ `@studio/pixi` in Task 3)* |
| `./types` (`FrameLoop`, `SceneManagerHost`) | `@studio/core` |
| `./react/mount` | `./mount` |
| `./react/styles` | `./styles` |
| `pixi.js`, `react-dom/client` | unchanged |
| `./types` (`GameConfig`) | `./config` |

So `game.ts` imports `GameConfig` from `./config`, and `ViewHandle` (from `view`) — note `applyView`/`ViewHandle` come from the Pixi layer; import them from `@studio/core` this task. Confirm `@studio/core`'s barrel still re-exports `applyView`/`ViewHandle`; if `ViewHandle` is not currently exported, add `export { applyView, fit, type ViewHandle } from "./pixi/view";` to `packages/core/src/index.ts` in this step.

- [ ] **Step 5: Create `packages/react/src/index.ts`**

```ts
export { createGame, Game } from "./game";
export type { GameConfig, GameHooks, GamePlugin } from "./config";
export { GameProvider } from "./GameProvider";
export { Overlay } from "./Overlay";
export { useGame, useStore, useScene, useSceneStack } from "./hooks";
```

- [ ] **Step 6: Remove React/game from `core`'s barrel and types**

In `packages/core/src/index.ts`, **delete** these lines:
```ts
export { createGame, Game } from "./game";
export { GameProvider } from "./react/GameProvider";
export { Overlay } from "./react/Overlay";
export { useGame, useStore, useScene, useSceneStack } from "./react/hooks";
```
and remove `GameConfig`, `GameHooks`, `GamePlugin` from the `export type { ... } from "./types"` list.

In `packages/core/src/types.ts`, **delete** the `GamePlugin`, `GameHooks`, and `GameConfig` interface declarations and the now-unused `import type { SceneConstructor } from "./pixi/scene";` line *only if* it is unused after removal (it is also referenced by `SceneStackEntry`/`SceneManagerHost`, which remain this task — so keep it).

Also in `packages/core/src/index.ts`, **add** every symbol the moved `game.ts` and the moved `*.dom.test.*` files now need from a barrel (they live in separate packages and can no longer use deep relative paths). The kernel symbols are permanent; the Pixi symbols are **temporary** here (Pixi is still nested in `core` this task) and relocate to `@studio/pixi`'s barrel in Task 3:
```ts
// permanent kernel additions:
export { createViewport } from "./pixi/viewport";       // path → "./viewport" in Task 3
export { emptyFrameLoop } from "./scheduler";
export { createInputRuntime, emptyInputRuntime } from "./input/runtime";
// TEMPORARY — these move to @studio/pixi's barrel in Task 3, and game.ts repoints there:
export { registerGame, unregisterGame } from "./pixi/hmr";
export { createDomInputSource } from "./pixi/input-source";
export { mountDevFps } from "./pixi/dev-fps";
export { type ViewHandle } from "./pixi/view";
```
(Confirm each symbol exists with that name in the cited file: `createViewport` in `pixi/viewport.ts`; `emptyFrameLoop` in `scheduler.ts`; `createInputRuntime`/`emptyInputRuntime` in `input/runtime.ts`; `registerGame`/`unregisterGame`/`hotReplaceScene` in `pixi/hmr.ts`; `createDomInputSource` in `pixi/input-source.ts`; `mountDevFps` in `pixi/dev-fps.ts`; `ViewHandle` in `pixi/view.ts`.)

- [ ] **Step 7: Repoint the demo's React imports**

| File | Old | New |
|---|---|---|
| `apps/demo/src/main.tsx` | `import { createGame } from "@studio/core";` | `import { createGame } from "@studio/react";` |
| `apps/demo/src/scenes/game/Hud.tsx` | `import { useGame, useStore } from "@studio/core";` | `from "@studio/react";` |
| `apps/demo/src/scenes/menu/Screen.tsx` | `import { useGame } from "@studio/core";` | `from "@studio/react";` |
| `apps/demo/src/scenes/pause/Screen.tsx` | `import { useGame } from "@studio/core";` | `from "@studio/react";` |

Add `@studio/react` to `apps/demo/package.json` dependencies:
```json
"@studio/react": "workspace:*",
```
and update `apps/demo/tsconfig.json` references to include react:
```json
"references": [{ "path": "../../packages/core" }, { "path": "../../packages/react" }],
```

- [ ] **Step 8: `pnpm install`** (workspace deps changed)

Run: `pnpm install`
Expected: no error; `@studio/react` linked into demo.

- [ ] **Step 9: Verification gate**

Run:
```bash
pnpm exec tsc -b --pretty packages/core packages/pixi packages/react apps/demo
pnpm test
pnpm depcruise
```
Expected: tsc exit 0; 67 tests pass (the moved `*.dom.test.*` now resolve under `packages/react/src`); depcruise no violations (no cycle: `react → core` only).

> If depcruise's `kernel-agnostic` rule (still present, scoped to `packages/core/src`) flags anything, it should not — `game.ts` is gone from core. If the `depcruise` script only scans `packages/core/src`, the react package isn't scanned yet; that's fine until Task 5.

- [ ] **Step 10: Commit**

```bash
git add packages/core packages/react apps/demo
git commit -m "refactor(engine): extract React overlay + createGame into @studio/react

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Extract the Pixi layer into `@studio/pixi`; make `core` a clean kernel

After this task, `core` has zero Pixi/React dependency; `react` imports the Pixi layer from `@studio/pixi`.

**Files:**
- Move: `packages/core/src/pixi/{scene.ts,scene-manager.ts,view.ts,asset-loader.ts,hmr.ts,dev-fps.ts,orientation.ts,input-source.ts}` and their tests into `packages/pixi/src/` (per the target tree)
- Move: `packages/core/src/pixi/viewport.ts` and `viewport.test.ts` → `packages/core/src/viewport.ts` / `viewport.test.ts`
- Create: `packages/pixi/src/scene/types.ts` (carved from `core/src/types.ts`)
- Modify: `packages/core/src/types.ts` (remove all Pixi/React-referencing types), `packages/core/src/index.ts`, `packages/core/package.json`
- Modify: `packages/react/src/{game.ts,hooks.ts,config.ts}` (repoint Pixi imports to `@studio/pixi`)
- Modify: `apps/demo` scene files (BaseScene/hotReplaceScene → `@studio/pixi`)

- [ ] **Step 1: Move Pixi files into the `@studio/pixi` domain tree**

```bash
mkdir -p packages/pixi/src/scene packages/pixi/src/view packages/pixi/src/assets packages/pixi/src/input packages/pixi/src/dev
git mv packages/core/src/pixi/scene.ts            packages/pixi/src/scene/base-scene.ts
git mv packages/core/src/pixi/scene.dom.test.ts   packages/pixi/src/scene/base-scene.dom.test.ts
git mv packages/core/src/pixi/scene-manager.ts          packages/pixi/src/scene/scene-manager.ts
git mv packages/core/src/pixi/scene-manager.dom.test.ts packages/pixi/src/scene/scene-manager.dom.test.ts
git mv packages/core/src/pixi/hmr.ts        packages/pixi/src/scene/hmr.ts
git mv packages/core/src/pixi/hmr.test.ts   packages/pixi/src/scene/hmr.test.ts
git mv packages/core/src/pixi/view.ts       packages/pixi/src/view/view.ts
git mv packages/core/src/pixi/view.test.ts  packages/pixi/src/view/view.test.ts
git mv packages/core/src/pixi/asset-loader.ts          packages/pixi/src/assets/asset-loader.ts
git mv packages/core/src/pixi/asset-loader.dom.test.ts packages/pixi/src/assets/asset-loader.dom.test.ts
git mv packages/core/src/pixi/input-source.ts  packages/pixi/src/input/dom-source.ts
git mv packages/core/src/pixi/dev-fps.ts       packages/pixi/src/dev/dev-fps.ts
git mv packages/core/src/pixi/orientation.ts        packages/pixi/src/orientation.ts
git mv packages/core/src/pixi/orientation.test.ts   packages/pixi/src/orientation.test.ts
```

- [ ] **Step 2: Move the pure `viewport` module into `core`**

```bash
git mv packages/core/src/pixi/viewport.ts       packages/core/src/viewport.ts
git mv packages/core/src/pixi/viewport.test.ts  packages/core/src/viewport.test.ts
rmdir packages/core/src/pixi
```

- [ ] **Step 3: Create `packages/pixi/src/scene/types.ts`** (Pixi-referencing scene types, carved from `core/src/types.ts`)

```ts
import type { Container } from "pixi.js";
import type { ComponentType } from "react";
import type { AssetLoader } from "../assets/asset-loader";
import type { BaseScene, SceneConstructor } from "./base-scene";
import type { Bridge, ServiceRegistry, Viewport, InputRuntime, FrameLoop, TickerLike } from "@studio/core";

export interface SceneScreenProps<Data = unknown> {
  data: Data;
  scene: BaseScene<Data>;
}

export interface SceneStackEntry {
  key: string;
  data: unknown;
  Screen?: ComponentType<SceneScreenProps>;
  instance: BaseScene;
}

export interface SceneManagerHost {
  readonly stage: Container;
  readonly ticker: TickerLike;
  readonly uiRoot: HTMLElement;
  readonly viewport: Viewport;
  readonly input: InputRuntime;
  readonly scheduler: FrameLoop;
  readonly bridge: Bridge;
  readonly loader: AssetLoader;
  readonly services: ServiceRegistry;
}

export type { SceneConstructor };
```

> `Bridge` and `ServiceRegistry` are runtime classes but imported `type`-only here, so they cost `@studio/pixi` nothing at runtime. They must be exported from `@studio/core` (they already are: `createBridge`/`Bridge`, `ServiceRegistry`).

- [ ] **Step 4: Strip the Pixi/React-referencing types out of `core/src/types.ts`**

Delete from `packages/core/src/types.ts`:
- `import type { Container } from "pixi.js";`
- `import type { ComponentType } from "react";`
- `import type { AssetLoader } from "./pixi/asset-loader";`
- `import type { BaseScene } from "./pixi/scene";` (both occurrences) and the `export type { BaseScene };` re-export
- `import type { SceneConstructor } from "./pixi/scene";`
- the `SceneScreenProps`, `SceneStackEntry`, `SceneManagerHost` interface declarations

Keep in `types.ts` (these are kernel-clean and move to co-located files in Task 4): `FrameInfo`, `TickerLike`, `ScheduleHandle`, `FrameLoop`, `RouteEntry`, `GameState`, `CommandMap`, `Command`, `SceneContext`, `ViewFit`, `Orientation`, `ViewConfig`, `ViewState`, `Viewport`, `Transition`, `GoOptions`.

`SceneContext` keeps `import type { InputMapDef, InputRuntime } from "./input/types";` — wait, `SceneContext` only needs `InputRuntime`. Verify the remaining import line reads `import type { InputRuntime } from "./input/types";` (drop `InputMapDef` if now unused in `types.ts`).

- [ ] **Step 5: Create `packages/pixi/src/index.ts`**

```ts
export { BaseScene, type SceneConstructor } from "./scene/base-scene";
export { SceneManager } from "./scene/scene-manager";
export { hotReplaceScene } from "./scene/hmr";
export { AssetLoader } from "./assets/asset-loader";
export { applyView, fit, type ViewHandle } from "./view/view";
export { createDomInputSource } from "./input/dom-source";
export { mountDevFps } from "./dev/dev-fps";
export { tryLockOrientation } from "./orientation";
export { registerGame, unregisterGame } from "./scene/hmr";
export type { SceneScreenProps, SceneStackEntry, SceneManagerHost } from "./scene/types";
```

> Check `hmr.ts`'s actual exports (`hotReplaceScene`, `registerGame`, `unregisterGame`) and `view.ts`'s (`applyView`, `fit`, `ViewHandle`) and match exactly; adjust names if they differ.

- [ ] **Step 6: Rewrite imports inside the moved Pixi files**

Per this table (relative kernel refs become `@studio/core`; intra-pixi refs become relative to the new tree):

| File | Old | New |
|---|---|---|
| `scene/base-scene.ts` | `../input/types` | `@studio/core` |
| `scene/base-scene.ts` | `../types` (`SceneContext`,`ScheduleHandle`) | `@studio/core` |
| `scene/base-scene.ts` | `../types` (`SceneScreenProps`) | `./types` |
| `scene/base-scene.ts` | `./asset-loader` | `../assets/asset-loader` |
| `scene/base-scene.ts` | `pixi.js`, `react` | unchanged |
| `scene/scene-manager.ts` | `../transition` | `@studio/core` |
| `scene/scene-manager.ts` | `../types` (`FrameInfo`,`GoOptions`,`SceneContext`,`Transition`) | `@studio/core` |
| `scene/scene-manager.ts` | `../types` (`SceneStackEntry`,`SceneManagerHost`) | `./types` |
| `scene/scene-manager.ts` | `./scene` | `./base-scene` |
| `scene/hmr.ts` | `./scene` | `./base-scene` |
| `view/view.ts` | `../types` (`ViewState`,`ViewConfig`,…) | `@studio/core` |
| `view/view.ts` | `./viewport` | `@studio/core` |
| `view/view.ts` | `pixi.js` | unchanged |
| `assets/asset-loader.ts` | `pixi.js` | unchanged |
| `input/dom-source.ts` | `../input/types` | `@studio/core` |
| `dev/dev-fps.ts` | `../types` | `@studio/core` |
| `orientation.ts` | `../types` | `@studio/core` |

Apply the same specifier fixes inside the moved **test** files (e.g. `scene/scene-manager.dom.test.ts` imports `createViewport` — now from `@studio/core`; `emptyInputRuntime`/`emptyFrameLoop` — from `@studio/core`; `BaseScene`/`SceneManager` — relative `./base-scene` / `./scene-manager`; `SceneManagerHost`/`FrameInfo` — `./types` / `@studio/core`). Read each test and repoint its imports accordingly.

- [ ] **Step 7: Repoint `core`'s `viewport.ts` and barrel**

`packages/core/src/viewport.ts`: change `import ... from "../types"` → `from "./types"`.

`packages/core/src/index.ts`: **remove** every Pixi export (they now live in `@studio/pixi`), including the ones added temporarily in Task 2 Step 6:
```ts
// delete these lines:
export { BaseScene, type SceneConstructor } from "./pixi/scene";
export { SceneManager } from "./pixi/scene-manager";
export { AssetLoader } from "./pixi/asset-loader";
export { hotReplaceScene } from "./pixi/hmr";
export { applyView, fit } from "./pixi/view";
export { tryLockOrientation } from "./pixi/orientation";
export { registerGame, unregisterGame } from "./pixi/hmr";
export { createDomInputSource } from "./pixi/input-source";
export { mountDevFps } from "./pixi/dev-fps";
export { type ViewHandle } from "./pixi/view";
```
Update the `createViewport` export path (added in Task 2 Step 6) from `./pixi/viewport` to its new home:
```ts
export { createViewport } from "./viewport";
```
and ensure `SceneScreenProps`/`SceneStackEntry`/`SceneManagerHost` are removed from core's `export type { ... } from "./types"` list (they moved to `@studio/pixi`). Keep `SceneContext`, `Viewport`, `ViewState`, etc.

- [ ] **Step 8: Make `@studio/core` dependency-free**

`packages/core/package.json` — replace the `peerDependencies`/`devDependencies` so no Pixi/React remain:
```json
{
  "name": "@studio/core",
  "version": "0.0.0",
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": { ".": "./src/index.ts" },
  "scripts": { "build": "tsc -b" },
  "dependencies": {},
  "devDependencies": {}
}
```

- [ ] **Step 9: Repoint `@studio/react` to `@studio/pixi`**

In `packages/react/src/game.ts`, change the specifiers that pointed at `@studio/core` for Pixi symbols (introduced in Task 2 Step 4) to `@studio/pixi`: `AssetLoader`, `SceneManager`, `registerGame`/`unregisterGame`, `applyView`/`ViewHandle`, `createDomInputSource`, `mountDevFps`, `tryLockOrientation`. Kernel symbols (`createBridge`/`Bridge`, `ServiceRegistry`, `createFrameLoop`/`emptyFrameLoop`, `createInputRuntime`/`emptyInputRuntime`, `InputRuntime`, `FrameLoop`) stay `@studio/core`.

In `packages/react/src/hooks.ts`, the scene types (`SceneStackEntry`, etc.) now come from `@studio/pixi`:
```ts
import type { /* SceneStackEntry, ... */ } from "@studio/pixi";
```
(Keep any kernel types from `@studio/core`.)

In `packages/react/src/config.ts`, change `SceneConstructor` to import from `@studio/pixi`:
```ts
import type { SceneConstructor } from "@studio/pixi";
import type { GameState, ViewConfig, InputMapDef } from "@studio/core";
```

In the moved React **test** files (`packages/react/src/{Overlay.dom.test.tsx,hooks.dom.test.tsx,game.dom.test.ts}`), repoint the Pixi symbols they import from `@studio/core` to `@studio/pixi`: `BaseScene`, `SceneManager`, `AssetLoader`, and the type-only `SceneManagerHost`, `SceneScreenProps`, `SceneStackEntry`. Kernel symbols they use (`createBridge`, `ServiceRegistry`, `createViewport`, `emptyInputRuntime`, `emptyFrameLoop`, `FrameInfo`) stay `@studio/core`.

- [ ] **Step 10: Repoint the demo's Pixi imports**

| File | Old | New |
|---|---|---|
| `apps/demo/src/scenes/boot/scene.ts` | `import { BaseScene, hotReplaceScene } from "@studio/core";` | `from "@studio/pixi";` |
| `apps/demo/src/scenes/menu/scene.ts` | same | `from "@studio/pixi";` |
| `apps/demo/src/scenes/game/scene.ts` | same | `from "@studio/pixi";` |
| `apps/demo/src/scenes/pause/scene.ts` | same | `from "@studio/pixi";` |

Add `@studio/pixi` to `apps/demo/package.json` dependencies (`"@studio/pixi": "workspace:*"`) and to `apps/demo/tsconfig.json` references (`{ "path": "../../packages/pixi" }`).

- [ ] **Step 11: `pnpm install`**

Run: `pnpm install`
Expected: no error.

- [ ] **Step 12: Verification gate**

Run:
```bash
pnpm exec tsc -b --pretty packages/core packages/pixi packages/react apps/demo
pnpm test
pnpm exec depcruise packages/core/src packages/pixi/src packages/react/src --config .dependency-cruiser.cjs
```
Expected: tsc exit 0; 67 tests pass; depcruise no violations. **Critically, verify no cycle:** the only package edges are `pixi → core`, `react → core`, `react → pixi`. If depcruise's `kernel-agnostic` rule errors now, it's a false positive against the new layout — it will be removed in Task 5; for this task's gate you may temporarily run depcruise with only the `no-circular` rule by checking the report manually, but do not edit the config yet.

> Sanity assertion for the "headless core" success criterion: `grep -rE "pixi\.js|\"react\"|react-dom" packages/core/package.json` returns nothing, and `grep -rnE "from \"(pixi\.js|react|react-dom)\"" packages/core/src` returns nothing.

- [ ] **Step 13: Commit**

```bash
git add packages apps
git commit -m "refactor(engine): extract Pixi layer into @studio/pixi; core is now headless

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: Dissolve `core/src/types.ts` into co-located domain files

`core` now contains only kernel-clean types in `types.ts`. Move each type next to the code that owns it; delete `types.ts`.

**Files:**
- Modify: `packages/core/src/scheduler.ts` (absorb frame/schedule types), `packages/core/src/viewport.ts` (absorb view types)
- Create: `packages/core/src/scene-contract.ts` (scene/navigation/game-state contracts)
- Delete: `packages/core/src/types.ts`
- Modify: every core file that imported `./types`, plus `packages/core/src/index.ts`

- [ ] **Step 1: Prepend the frame/schedule types to `scheduler.ts`**

Add to the top of `packages/core/src/scheduler.ts` (these are the scheduler's own contract):
```ts
export interface FrameInfo {
  readonly deltaTime: number;
  readonly deltaMS: number;
}

export interface TickerLike {
  add(fn: (frame: FrameInfo) => void): unknown;
  remove(fn: (frame: FrameInfo) => void): unknown;
}

export interface ScheduleHandle {
  cancel(): void;
}

export interface FrameLoop {
  timer(ms: number, fn: () => void): ScheduleHandle;
  interval(ms: number, fn: () => void): ScheduleHandle;
  destroy(): void;
}
```
Then change `scheduler.ts`'s own `import { FrameLoop, ScheduleHandle } from "./types"` to use the local declarations (delete that import). Confirm `scheduler.ts` no longer imports `./types`.

- [ ] **Step 2: Prepend the view types to `viewport.ts`**

Add to the top of `packages/core/src/viewport.ts`:
```ts
export type ViewFit = "contain" | "cover";
export type Orientation = "portrait" | "landscape";

export interface ViewConfig {
  design: readonly [number, number];
  fit?: ViewFit;
  background?: string;
  orientation?: Orientation;
}

export interface ViewState {
  readonly scale: number;
  readonly offsetX: number;
  readonly offsetY: number;
  readonly design: Readonly<{ width: number; height: number }>;
  readonly css: Readonly<{ width: number; height: number }>;
  readonly orientation: Orientation;
}

export interface Viewport {
  readonly scale: number;
  readonly design: Readonly<{ width: number; height: number }>;
  readonly css: Readonly<{ width: number; height: number }>;
  readonly orientation: Orientation;
  viewportToDesign(x: number, y: number): { x: number; y: number };
  designToViewport(x: number, y: number): { x: number; y: number };
}
```
Remove `viewport.ts`'s `import type { ... } from "./types"` (it now declares them locally).

- [ ] **Step 3: Create `packages/core/src/scene-contract.ts`** (the remaining kernel contracts)

```ts
import type { Store } from "./store";
import type { ServiceRegistry } from "./services";
import type { Viewport } from "./viewport";
import type { FrameLoop } from "./scheduler";
import type { InputRuntime } from "./input/types";

export interface RouteEntry {
  scene: string;
  data: unknown;
}

export interface GameState {
  route: RouteEntry[];
}

export interface CommandMap {}
export type Command = CommandMap[keyof CommandMap];

export interface SceneContext {
  readonly services: ServiceRegistry;
  readonly store: Store<GameState>;
  readonly viewport: Viewport;
  readonly input: InputRuntime;
  readonly scheduler: FrameLoop;
}

export type Transition =
  | { type: "none" }
  | { type: "fade"; duration: number };

export interface GoOptions<Data = unknown> {
  data?: Data;
  transition?: Transition;
}
```

> `GoOptions` is already generalized to `<Data = unknown>` here so Task 6 only adds `SceneMap`/`SceneKey` and the `go`/`push` signatures. `SceneContext` references `Store<GameState>`; both live in `core`, no cross-package import.

- [ ] **Step 4: Delete `types.ts` and repoint core-internal imports**

```bash
git rm packages/core/src/types.ts
```
Repoint the remaining `./types` importers inside `core`:

| File | Old | New |
|---|---|---|
| `bridge.ts` | `./types` (`GameState`) | `./scene-contract` |
| `transition.ts` | `./types` | *(check what it imports; `transition.ts` likely needs nothing from types — if it imported `TickerLike`/`FrameInfo`, point to `./scheduler`)* |
| `input/runtime.ts` | `../types` | the symbol determines: `Viewport` → `../viewport`; otherwise `../scene-contract` |
| `input/define-input.ts` | `./types` | unchanged *(imports `./types` = `input/types.ts`, not core types)* |

> Read each importer and route each symbol to its new home: frame/schedule → `./scheduler`, view → `./viewport`, scene/route/state/command/context/transition/go → `./scene-contract`. `input/types.ts`'s own `./types` self-import is unrelated (it's the input package's file) — leave it.

- [ ] **Step 5: Update `packages/core/src/index.ts` exports**

Replace the `export type { ... } from "./types"` block with domain-sourced exports:
```ts
export type { FrameInfo, TickerLike, FrameLoop, ScheduleHandle } from "./scheduler";
export type { ViewFit, Orientation, ViewConfig, ViewState, Viewport } from "./viewport";
export type {
  RouteEntry, GameState, CommandMap, Command,
  SceneContext, Transition, GoOptions
} from "./scene-contract";
```
Keep the existing value exports unchanged: `createBridge`, `createStore`, `ServiceRegistry`, `createFrameLoop`, `emptyFrameLoop`, `createInputRuntime`, `emptyInputRuntime`, `tween`/easing, `defineInput`, `createViewport`, and the input type re-exports. (Only the `export type { ... } from "./types"` block is replaced; the value-export lines are untouched aside from `createViewport`'s path already fixed in Task 3.)

- [ ] **Step 6: Repoint `@studio/pixi` / `@studio/react` if they imported names that moved**

Both packages import these types from `@studio/core`'s barrel, which still re-exports them — so **no change needed** as long as Step 5's barrel re-exports all the same names. Verify by typecheck.

- [ ] **Step 7: Verification gate**

Run:
```bash
pnpm exec tsc -b --pretty packages/core packages/pixi packages/react apps/demo
pnpm test
pnpm exec depcruise packages/core/src packages/pixi/src packages/react/src --config .dependency-cruiser.cjs
```
Expected: tsc exit 0; 67 tests pass; depcruise clean (no `types.ts` cycles). Confirm `ls packages/core/src/types.ts` reports no such file.

- [ ] **Step 8: Commit**

```bash
git add packages
git commit -m "refactor(core): dissolve types.ts into co-located domain files

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: Repoint root tooling (vitest, dependency-cruiser, scripts, references)

**Files:**
- Modify: `vitest.config.ts`, `.dependency-cruiser.cjs`, `package.json` (root scripts)

- [ ] **Step 1: Update `vitest.config.ts`**

```ts
import { defineConfig, configDefaults } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    exclude: [...configDefaults.exclude, "tmp/**"],
    environmentMatchGlobs: [
      ["packages/react/src/**", "jsdom"],
      ["**/*.dom.test.ts", "jsdom"],
      ["**/*.dom.test.tsx", "jsdom"]
    ],
    typecheck: { include: ["**/*.test-d.ts"] },
    coverage: {
      provider: "v8",
      include: ["packages/*/src/**"],
      exclude: [
        "packages/*/src/index.ts",
        "packages/react/src/game.ts",
        "packages/react/src/mount.tsx",
        "packages/react/src/styles.ts",
        "packages/pixi/src/view/view.ts",
        "packages/pixi/src/input/dom-source.ts",
        "packages/pixi/src/dev/dev-fps.ts",
        "packages/**/*.test.*",
        "packages/**/*.test-d.ts"
      ],
      thresholds: { lines: 80, functions: 80, branches: 80, statements: 80 }
    }
  }
});
```

- [ ] **Step 2: Update `.dependency-cruiser.cjs`** (drop the now-redundant `kernel-agnostic` rule; package manifests enforce it)

```js
/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "no-circular",
      severity: "error",
      from: {},
      to: { circular: true }
    }
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    tsConfig: { fileName: "tsconfig.base.json" },
    enhancedResolveOptions: { exportsFields: ["exports"], conditionNames: ["import", "require"] }
  }
};
```

- [ ] **Step 3: Update root `package.json` scripts**

```json
"typecheck": "tsc -b --pretty packages/core packages/pixi packages/react apps/demo",
"test": "vitest run",
"test:types": "vitest run --typecheck.only",
"coverage": "vitest run --coverage",
"depcruise": "depcruise packages/core/src packages/pixi/src packages/react/src --config .dependency-cruiser.cjs",
"build": "tsc -b packages/react && pnpm --filter @studio/demo build"
```
(Leave `dev` and `test:watch` as they are. The `build` line builds `core`→`pixi`→`react` via references, then the demo.)

- [ ] **Step 4: Verification gate** (now via the canonical scripts)

Run:
```bash
pnpm typecheck && pnpm test && pnpm test:types && pnpm depcruise
```
Expected: typecheck exit 0; 67 runtime tests pass; `test:types` reports no type-test files yet (0 passed — acceptable) or success; depcruise clean.

> If `vitest run --typecheck.only` errors because no `*.test-d.ts` exist yet, that is fine for this task — Task 6 adds them. Note the result and proceed.

- [ ] **Step 5: Commit**

```bash
git add vitest.config.ts .dependency-cruiser.cjs package.json
git commit -m "chore(engine): repoint vitest, dependency-cruiser, and scripts to the 3-package layout

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: Type-safe scene navigation + typed scene data

Add the augmentable `SceneMap`, retype `SceneManager.go`/`push`, prove it with type-tests, and wire the demo.

**Files:**
- Modify: `packages/core/src/scene-contract.ts` (add `SceneMap`, `SceneKey`), `packages/core/src/index.ts` (export them)
- Modify: `packages/pixi/src/scene/scene-manager.ts` (typed `go`/`push`)
- Create: `apps/demo/src/scenes/scene-map.ts` (augmentation), `apps/demo/src/scenes/scene-map.test-d.ts`
- Create: `packages/core/src/input/types.test-d.ts`
- Modify: `apps/demo/src/main.tsx` (import the augmentation; pass typed data), `apps/demo/src/commands.ts` (`key: SceneKey`), `apps/demo/src/scenes/game/scene.ts` (`BaseScene<{ level?: number }>`)

- [ ] **Step 1: Add `SceneMap` / `SceneKey` to `scene-contract.ts`**

Append to `packages/core/src/scene-contract.ts`:
```ts
/** Empty by design — games populate it via declaration merging. */
export interface SceneMap {}

/** Registered scene keys, or `string` when SceneMap is unaugmented. */
export type SceneKey = [keyof SceneMap & string] extends [never]
  ? string
  : keyof SceneMap & string;
```

Export from `packages/core/src/index.ts` (add to the `scene-contract` type export list):
```ts
export type {
  RouteEntry, GameState, CommandMap, Command,
  SceneContext, Transition, GoOptions, SceneMap, SceneKey
} from "./scene-contract";
```

- [ ] **Step 2: Write the failing type-test for navigation** (`apps/demo/src/scenes/scene-map.test-d.ts`)

```ts
import { expectTypeOf } from "vitest";
import { createGame } from "@studio/react";
import "./scene-map";
import { BootScene } from "./boot/scene";
import { MenuScene } from "./menu/scene";
import { GameScene } from "./game/scene";
import { PauseScene } from "./pause/scene";

declare const game: ReturnType<typeof createGame>;

// keys are the augmented union
expectTypeOf(game.scenes.go).toBeCallableWith("Game", { data: { level: 3 } });
expectTypeOf(game.scenes.go).toBeCallableWith("Menu");

// @ts-expect-error unknown scene key is rejected
game.scenes.go("Gmae");

// @ts-expect-error wrong data shape is rejected
game.scenes.go("Game", { data: { lvl: 3 } });

// reference the scene classes so the import is not elided
void [BootScene, MenuScene, GameScene, PauseScene];
```

- [ ] **Step 3: Run the type-test to verify it FAILS**

Run: `pnpm exec vitest run --typecheck.only apps/demo/src/scenes/scene-map.test-d.ts`
Expected: FAIL — `go` currently takes `(key: string, opt?: GoOptions)`, so `{ data: { level: 3 } }` is not accepted (data is `unknown`), the `@ts-expect-error` on `"Gmae"` is *unused* (no error to suppress), etc. Confirm it reports type errors.

- [ ] **Step 4: Create the demo augmentation** (`apps/demo/src/scenes/scene-map.ts`)

```ts
import "@studio/core";

declare module "@studio/core" {
  interface SceneMap {
    Boot: void;
    Menu: void;
    Game: { level?: number };
    Pause: void;
  }
}
```

- [ ] **Step 5: Retype `SceneManager.go` / `push`** (`packages/pixi/src/scene/scene-manager.ts`)

Add these helper types near the top (after imports), importing `SceneMap` and `GoOptions` from `@studio/core`:
```ts
import type {
  FrameInfo, GoOptions, SceneContext, SceneMap, Transition
} from "@studio/core";
import type { SceneManagerHost, SceneStackEntry } from "./types";

type AnyKey = keyof SceneMap & string;
type GoKey = [AnyKey] extends [never] ? string : AnyKey;
type SceneDataFor<K> = K extends keyof SceneMap ? SceneMap[K] : unknown;
```

Change the public method signatures (bodies unchanged):
```ts
async go<K extends GoKey>(key: K, opt: GoOptions<SceneDataFor<K>> = {}): Promise<BaseScene> {
  // ...existing body unchanged...
}

async push<K extends GoKey>(key: K, opt: GoOptions<SceneDataFor<K>> = {}): Promise<BaseScene> {
  // ...existing body unchanged...
}
```

Keep the private `enter(key: string, opt: GoOptions)` signature as-is (`string`/`unknown`) — the public methods narrow; `enter` stays generic internally. The body calls `this.enter(key, opt)` where `key: K` (assignable to `string`) and `opt: GoOptions<SceneDataFor<K>>` (assignable to `GoOptions<unknown>` for `data` — verify; if `exactOptionalPropertyTypes` complains, widen `enter`'s param to `GoOptions<unknown>` which it already is).

- [ ] **Step 6: Run the navigation type-test to verify it PASSES**

Run: `pnpm exec vitest run --typecheck.only apps/demo/src/scenes/scene-map.test-d.ts`
Expected: PASS — keys constrained to the union, `{ level: 3 }` accepted, `"Gmae"` and `{ lvl: 3 }` rejected (the `@ts-expect-error`s are now satisfied).

- [ ] **Step 7: Add the input type-test** (`packages/core/src/input/types.test-d.ts`)

```ts
import { expectTypeOf } from "vitest";
import type { InputFacade, AxisValue } from "./types";

declare const facade: InputFacade;

// axis(...) returns the {x,y} shape
expectTypeOf(facade.axis("move")).toEqualTypeOf<AxisValue>();
expectTypeOf<AxisValue>().toEqualTypeOf<{ x: number; y: number }>();

// isDown(...) is a boolean predicate
expectTypeOf(facade.isDown("jump")).toEqualTypeOf<boolean>();
```

Run: `pnpm exec vitest run --typecheck.only packages/core/src/input/types.test-d.ts`
Expected: PASS.

- [ ] **Step 8: Wire the demo augmentation and typed data into runtime**

In `apps/demo/src/main.tsx`, add the side-effect import near `import "./commands";`:
```ts
import "./scenes/scene-map";
```

In `apps/demo/src/commands.ts`, type the scene-command keys (so the command bridge composes with `go`):
```ts
import "@studio/core";
import type { SceneKey } from "@studio/core";

declare module "@studio/core" {
  interface GameState {
    hud: { coins: number };
  }
  interface CommandMap {
    "scene:go": { type: "scene:go"; key: SceneKey };
    "scene:push": { type: "scene:push"; key: SceneKey };
    "scene:pop": { type: "scene:pop" };
    "coin:add": { type: "coin:add"; amount: number };
  }
}
```

In `apps/demo/src/scenes/game/scene.ts`, make `GameScene` carry the optional `level` data (behavior unchanged when absent):
```ts
export class GameScene extends BaseScene<{ level?: number }> {
  static override key = "Game";
  static override Screen = GameHud;

  private hero: Graphics | null = null;

  override onCreate(data: { level?: number }): void {
    // existing body unchanged; `data.level` is available (optional)
    void data;
    // ...rest unchanged...
  }
  // onUpdate unchanged
}
```
> Keep the rest of `onCreate`/`onUpdate` exactly as-is. The `void data;` line is only to document availability without changing behavior; remove it if `data` is otherwise referenced. Do not add `console.log`.

- [ ] **Step 9: Full verification gate**

Run:
```bash
pnpm typecheck && pnpm test && pnpm test:types && pnpm depcruise
```
Expected: typecheck exit 0; 67 runtime tests pass; type-tests pass (2 `*.test-d.ts` files); depcruise clean. Coverage unaffected (type-tests excluded).

- [ ] **Step 10: Browser smoke check** (manual, optional but recommended)

Run: `pnpm dev`, open the demo. Expected: unchanged behavior — Boot→Menu→Game, hero moves on WASD, tap warps the hero, coins tick up, FPS overlay shows. Stop the server.

- [ ] **Step 11: Commit**

```bash
git add packages apps
git commit -m "feat(engine): type-safe scene navigation + typed scene data via SceneMap

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Final verification (after all tasks)

Run from repo root:
```bash
pnpm typecheck && pnpm test && pnpm test:types && pnpm coverage && pnpm depcruise
```

Confirm each success criterion from the spec:
- `grep -nE "pixi\.js|react" packages/core/package.json` → no matches (core is headless).
- `grep -rnE "from \"(pixi\.js|react|react-dom)\"" packages/core/src` → no matches.
- `apps/demo/src/main.tsx` imports `createGame` from `@studio/react`; demo scenes import `BaseScene` from `@studio/pixi`; `defineInput` from `@studio/core`.
- `game.scenes.go("Gmae")` and a wrong-shaped `data` fail `tsc` (encoded in `scene-map.test-d.ts`).
- Coverage ≥ 80% global.
- Demo runs in-browser with unchanged behavior.

Then use **superpowers:finishing-a-development-branch** to wrap up.

---

## Implementation note (deviation)

Type-tests (`.test-d.ts`) are enforced by **`tsc -b` per-package** (`pnpm typecheck`),
not vitest `--typecheck`. A single vitest typecheck program spans all packages and
merges their module graphs, which bleeds the demo's `declare module "@studio/core"`
augmentations (`GameState`, `CommandMap`, `SceneMap`) into other packages' tests and
breaks them. Per-package `tsc -b` keeps declaration-merging scope correct, and the
`.test-d.ts` files live inside each package's `include`, so `expectTypeOf`/`@ts-expect-error`
assertions fail the build on mismatch. Consequently: no root `tsconfig.json` was added,
the vitest `typecheck` block was dropped, and the `test:types` script was removed
(type-tests run under `pnpm typecheck`).

## Spec-coverage self-review

- §Target shape / package layout → Tasks 1–5. ✓
- §What moves where (core/pixi/react tables) → Tasks 2–4 move tables. ✓
- §Contract-ownership (single `@studio/core` augmentation target) → `SceneMap`/`CommandMap`/`GameState`/`InputActions` all in `core` (Tasks 3–4, 6). ✓
- §Scene DX (type-safe `go`/`push`, typed data, empty-fallback) → Task 6. ✓
- §Internal cohesion (dissolve `types.ts`, domain folders, no per-file barrels) → Task 4 (core co-location) + Task 3 (pixi domain folders). ✓
- §Testing & tooling (67 tests stay green, scoped `.test-d.ts`, vitest/depcruise repath) → gates in every task; Task 5 tooling; Task 6 type-tests. ✓
- §Toolchain mechanics (source `exports`, project references, scripts, not committing `.gitignore`/`packageManager`) → Tasks 1, 5 + conventions block. ✓
- §Migration strategy (5 ordered green-gated commits) → realized as 6 tasks (the spec's step 1 split into "scaffold" + "core cohesion" for safer ordering). ✓
- §Non-goals (class scenes, single `createGame`, no behavior change) → honored; no functional `scene.define`, `createGame` untouched in shape. ✓
