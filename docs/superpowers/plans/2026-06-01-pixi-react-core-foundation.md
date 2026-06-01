# PixiJS + React-overlay Core Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the runnable core of a PixiJS v8 (game-world) + React DOM (UI overlay) harness in a pnpm monorepo, proving DoD items 1–3 of the harness brief via a demo app.

**Architecture:** Pixi renders the game world to a `<canvas>`; React renders all UI into a `#ui-root` overlay div absolutely positioned over the canvas. The two are connected by a tiny zero-dependency reactive store + command bus (the `Bridge`). Scenes own a Pixi `world` Container and declare a static React `Screen`; a `SceneManager` runs `go`/`push`/`pop` with single-clock (Pixi ticker) transitions that drive both `world.alpha` and `#ui-root` opacity. A fixed design resolution plus a uniform scale (applied to both `app.stage` and `#ui-root` via CSS transform) keeps canvas and DOM pixel-locked.

**Tech Stack:** pnpm workspaces, TypeScript 5 (strict), PixiJS v8, React 19 + React DOM, Vite 6, Vitest 2 + jsdom + @testing-library/react, dependency-cruiser.

**Conventions for every task:**
- Each commit message ends with the trailer:
  `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`
- No `any`, `as any`, `as unknown as`, or non-null `!` (project TS rules).
- Run commands from the repo root unless stated otherwise.

---

## File Structure

| Path | Responsibility |
|------|----------------|
| `package.json`, `pnpm-workspace.yaml` | Workspace root + scripts |
| `tsconfig.base.json` | Shared strict TS config |
| `vitest.config.ts` | Test + coverage config |
| `.dependency-cruiser.cjs` | Enforce core boundary (no Pixi/React in store/bridge/services) |
| `packages/core/src/store.ts` | Tiny reactive store (pure) |
| `packages/core/src/services.ts` | Typed service registry (pure) |
| `packages/core/src/bridge.ts` | Store + command bus (pure) |
| `packages/core/src/transition.ts` | Ticker-driven tween + easing |
| `packages/core/src/view.ts` | Design-resolution fit → stage + #ui-root scale |
| `packages/core/src/asset-loader.ts` | Minimal Pixi Assets wrapper (stub for later pipeline) |
| `packages/core/src/types.ts` | Public shared types/interfaces |
| `packages/core/src/scene.ts` | `BaseScene`: world + static Screen + lifecycle |
| `packages/core/src/scene-manager.ts` | go/push/pop, scene stack, transitions |
| `packages/core/src/react/*` | GameProvider, hooks, Overlay, mount |
| `packages/core/src/game.ts` | `createGame` + `Game` boot/stop |
| `packages/core/src/index.ts` | Public surface |
| `apps/demo/*` | Boot/Menu/Game+HUD/Pause demo proving DoD 1–3 |

**Design note (deviation from skeleton draft, intentional):** `BaseScene` depends on a narrow `SceneContext` (`{ services, store }`) rather than the whole `Game`, and per-frame ticking is driven by `SceneManager`, not by the scene adding itself to the ticker. This keeps scenes and the manager unit-testable with lightweight fakes and keeps the engine-agnostic boundary clean. The `Game.app` Pixi escape hatch still exists at the `Game` level.

---

## Task 1: Workspace scaffold

**Files:**
- Create: `package.json`, `pnpm-workspace.yaml`, `tsconfig.base.json`, `vitest.config.ts`, `.gitignore`
- Create: `packages/core/package.json`, `packages/core/tsconfig.json`
- Create: `apps/demo/package.json`, `apps/demo/tsconfig.json`

- [ ] **Step 1: Create workspace + root config files**

`pnpm-workspace.yaml`:
```yaml
packages:
  - "packages/*"
  - "apps/*"
```

`package.json`:
```json
{
  "name": "pixi-game-engine",
  "private": true,
  "type": "module",
  "scripts": {
    "typecheck": "tsc -b --pretty packages/core apps/demo",
    "test": "vitest run",
    "test:watch": "vitest",
    "coverage": "vitest run --coverage",
    "depcruise": "depcruise packages/core/src --config .dependency-cruiser.cjs",
    "dev": "pnpm --filter @studio/demo dev",
    "build": "pnpm --filter @studio/core build && pnpm --filter @studio/demo build"
  },
  "devDependencies": {
    "@testing-library/react": "^16.1.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.4",
    "@vitest/coverage-v8": "^2.1.8",
    "dependency-cruiser": "^16.8.0",
    "jsdom": "^25.0.1",
    "typescript": "^5.7.2",
    "vite": "^6.0.5",
    "vitest": "^2.1.8"
  }
}
```

`tsconfig.base.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "verbatimModuleSyntax": true,
    "declaration": true,
    "composite": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

`vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    environmentMatchGlobs: [["packages/core/src/react/**", "jsdom"], ["**/*.dom.test.ts", "jsdom"], ["**/*.dom.test.tsx", "jsdom"]],
    coverage: {
      provider: "v8",
      include: ["packages/core/src/**"],
      // Excluded: barrel + browser-boot/DOM glue that is verified by the demo,
      // not by unit tests (per spec §14/§16). The unit-testable core
      // (store, services, bridge, transition, view.fit, scene, scene-manager,
      // asset-loader, hooks) carries the threshold.
      exclude: [
        "packages/core/src/index.ts",
        "packages/core/src/game.ts",
        "packages/core/src/view.ts",
        "packages/core/src/react/mount.tsx",
        "packages/core/src/react/styles.ts",
        "packages/core/src/**/*.test.*"
      ],
      thresholds: { lines: 80, functions: 80, branches: 80, statements: 80 }
    }
  }
});
```

`.gitignore`:
```
node_modules
dist
coverage
*.tsbuildinfo
```

- [ ] **Step 2: Create package manifests**

`packages/core/package.json`:
```json
{
  "name": "@studio/core",
  "version": "0.0.0",
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": { ".": "./src/index.ts" },
  "scripts": { "build": "tsc -b" },
  "peerDependencies": { "pixi.js": "^8.6.0", "react": "^19.0.0", "react-dom": "^19.0.0" },
  "dependencies": {},
  "devDependencies": { "pixi.js": "^8.6.0", "react": "^19.0.0", "react-dom": "^19.0.0" }
}
```

`packages/core/tsconfig.json`:
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "rootDir": "src", "outDir": "dist", "tsBuildInfoFile": "dist/.tsbuildinfo" },
  "include": ["src"]
}
```

`apps/demo/package.json`:
```json
{
  "name": "@studio/demo",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": { "dev": "vite", "build": "vite build", "preview": "vite preview" },
  "dependencies": {
    "@studio/core": "workspace:*",
    "pixi.js": "^8.6.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}
```

`apps/demo/tsconfig.json`:
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "rootDir": "src", "outDir": "dist", "tsBuildInfoFile": "dist/.tsbuildinfo", "noEmit": false },
  "references": [{ "path": "../../packages/core" }],
  "include": ["src"]
}
```

- [ ] **Step 3: Install dependencies**

Run: `pnpm install`
Expected: completes; `node_modules` created, `pnpm-lock.yaml` written.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
chore: scaffold pnpm monorepo (core + demo) with strict TS and vitest

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Reactive store (`store.ts`)

**Files:**
- Create: `packages/core/src/store.ts`
- Test: `packages/core/src/store.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it, vi } from "vitest";
import { createStore } from "./store";

describe("createStore", () => {
  it("returns current state from getState", () => {
    const store = createStore({ count: 0 });
    expect(store.getState()).toEqual({ count: 0 });
  });

  it("replaces state immutably via updater and notifies subscribers", () => {
    const store = createStore({ count: 0 });
    const before = store.getState();
    const listener = vi.fn();
    store.subscribe(listener);

    store.setState((prev) => ({ count: prev.count + 1 }));

    expect(store.getState()).toEqual({ count: 1 });
    expect(before).toEqual({ count: 0 }); // old reference untouched
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("stops notifying after unsubscribe", () => {
    const store = createStore({ count: 0 });
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    unsubscribe();
    store.setState((prev) => ({ count: prev.count + 1 }));
    expect(listener).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run packages/core/src/store.test.ts`
Expected: FAIL — cannot find module `./store` / `createStore` is not a function.

- [ ] **Step 3: Write minimal implementation**

```ts
export interface Store<S> {
  getState(): Readonly<S>;
  setState(update: (prev: Readonly<S>) => S): void;
  subscribe(listener: () => void): () => void;
}

export function createStore<S>(initial: S): Store<S> {
  let state: S = initial;
  const listeners = new Set<() => void>();

  return {
    getState: () => state,
    setState: (update) => {
      state = update(state);
      for (const listener of listeners) listener();
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    }
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run packages/core/src/store.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/core/src/store.ts packages/core/src/store.test.ts
git commit -m "$(cat <<'EOF'
feat(core): add tiny reactive store

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Service registry (`services.ts`)

**Files:**
- Create: `packages/core/src/services.ts`
- Test: `packages/core/src/services.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { ServiceRegistry, type ServiceKey } from "./services";

interface Audio {
  play(name: string): void;
}
const AUDIO: ServiceKey<Audio> = { id: "audio" };

describe("ServiceRegistry", () => {
  it("registers and resolves a service by typed key", () => {
    const registry = new ServiceRegistry();
    const audio: Audio = { play: () => undefined };
    registry.register(AUDIO, audio);
    expect(registry.get(AUDIO)).toBe(audio);
  });

  it("throws a clear error when a key is missing", () => {
    const registry = new ServiceRegistry();
    expect(() => registry.get(AUDIO)).toThrowError(/audio/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run packages/core/src/services.test.ts`
Expected: FAIL — cannot find module `./services`.

- [ ] **Step 3: Write minimal implementation**

```ts
export interface ServiceKey<T> {
  readonly id: string;
  readonly __type?: T; // phantom — carries T for inference, never assigned
}

export class ServiceRegistry {
  private readonly services = new Map<string, unknown>();

  register<T>(key: ServiceKey<T>, value: T): void {
    this.services.set(key.id, value);
  }

  get<T>(key: ServiceKey<T>): T {
    if (!this.services.has(key.id)) {
      throw new Error(`Service "${key.id}" is not registered`);
    }
    const value = this.services.get(key.id);
    return value as T; // safe: only register<T> writes this key, validated by has()
  }
}
```

> The single `as T` here is the documented acceptable case: the value was written by `register<T>` under the same key, and presence is validated at runtime by `has()`. No safer alternative exists for a heterogeneous map.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run packages/core/src/services.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/core/src/services.ts packages/core/src/services.test.ts
git commit -m "$(cat <<'EOF'
feat(core): add typed service registry

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Public types (`types.ts`)

**Files:**
- Create: `packages/core/src/types.ts`

No runtime test (type-only module); verified by `tsc` in later tasks.

- [ ] **Step 1: Write the types**

```ts
import type { Container } from "pixi.js";
import type { ComponentType } from "react";
import type { Store } from "./store";
import type { ServiceRegistry } from "./services";

/** Per-frame info; PixiJS Ticker satisfies this structurally. */
export interface FrameInfo {
  readonly deltaTime: number;
  readonly deltaMS: number;
}

/** Minimal ticker surface used by core; `app.ticker` satisfies it. */
export interface TickerLike {
  add(fn: (frame: FrameInfo) => void): unknown;
  remove(fn: (frame: FrameInfo) => void): unknown;
}

/** One entry in the route stack mirrored into game state. */
export interface RouteEntry {
  scene: string;
  data: unknown;
}

/**
 * Game state. Base shape only declares `route`; games extend it via
 * declaration merging: `declare module "@studio/core" { interface GameState {...} }`.
 */
export interface GameState {
  route: RouteEntry[];
}

/**
 * Command registry. Games augment via declaration merging:
 * `interface CommandMap { "scene:go": { type: "scene:go"; key: string } }`.
 */
/** Empty by design — games populate it via declaration merging. */
export interface CommandMap {}
export type Command = CommandMap[keyof CommandMap];

export interface SceneScreenProps<Data = unknown> {
  data: Data;
  scene: BaseScene<Data>;
}

/** Narrow dependency a scene needs — keeps scenes unit-testable. */
export interface SceneContext {
  readonly services: ServiceRegistry;
  readonly store: Store<GameState>;
}

export type ViewFit = "contain" | "cover";

export interface ViewConfig {
  design: readonly [number, number];
  fit?: ViewFit;
  background?: string;
}

export type Transition =
  | { type: "none" }
  | { type: "fade"; duration: number };

export interface GoOptions {
  data?: unknown;
  transition?: Transition;
}

// Forward type-only reference; concrete class lives in scene.ts.
import type { BaseScene } from "./scene";
export type { BaseScene };
```

- [ ] **Step 2: Commit**

```bash
git add packages/core/src/types.ts
git commit -m "$(cat <<'EOF'
feat(core): add public shared types

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Bridge (`bridge.ts`)

**Files:**
- Create: `packages/core/src/bridge.ts`
- Test: `packages/core/src/bridge.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it, vi } from "vitest";
import { createBridge } from "./bridge";

describe("createBridge", () => {
  it("seeds store with route plus provided initial state", () => {
    const bridge = createBridge({});
    expect(bridge.store.getState().route).toEqual([]);
  });

  it("delivers dispatched commands to registered handlers", () => {
    const bridge = createBridge({});
    const handler = vi.fn();
    bridge.onCommand(handler);
    bridge.dispatch({ type: "noop" });
    expect(handler).toHaveBeenCalledWith({ type: "noop" });
  });

  it("stops delivering to a handler after its unsubscribe", () => {
    const bridge = createBridge({});
    const handler = vi.fn();
    const off = bridge.onCommand(handler);
    off();
    bridge.dispatch({ type: "noop" });
    expect(handler).not.toHaveBeenCalled();
  });

  it("setRoute replaces the route stack in the store", () => {
    const bridge = createBridge({});
    bridge.setRoute([{ scene: "Menu", data: undefined }]);
    expect(bridge.store.getState().route).toEqual([{ scene: "Menu", data: undefined }]);
  });
});
```

> `dispatch({ type: "noop" })` typechecks in the test because the test file augments `CommandMap` implicitly through structural acceptance — to keep the test green without augmentation, `dispatch` accepts `Command` which is `never` in core-only builds. Use the cast-free helper below: the test passes a plain object and `dispatch` is typed to accept `Command`. If `Command` resolves to `never`, change the test calls to `bridge.dispatch({ type: "noop" } as Command)` — **but prefer** adding a local augmentation at the top of the test file instead:

```ts
declare module "./types" {
  interface CommandMap { noop: { type: "noop" } }
}
```

Add that augmentation block at the top of `bridge.test.ts` so no cast is needed.

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run packages/core/src/bridge.test.ts`
Expected: FAIL — cannot find module `./bridge`.

- [ ] **Step 3: Write minimal implementation**

```ts
import { createStore, type Store } from "./store";
import type { Command, GameState, RouteEntry } from "./types";

export interface Bridge {
  store: Store<GameState>;
  dispatch(cmd: Command): void;
  onCommand(handler: (cmd: Command) => void): () => void;
  setRoute(stack: ReadonlyArray<RouteEntry>): void;
}

export function createBridge(initial: Omit<GameState, "route">): Bridge {
  const store = createStore<GameState>({ ...initial, route: [] });
  const handlers = new Set<(cmd: Command) => void>();

  return {
    store,
    dispatch: (cmd) => {
      for (const handler of handlers) handler(cmd);
    },
    onCommand: (handler) => {
      handlers.add(handler);
      return () => {
        handlers.delete(handler);
      };
    },
    setRoute: (stack) => {
      store.setState((prev) => ({ ...prev, route: [...stack] }));
    }
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run packages/core/src/bridge.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/core/src/bridge.ts packages/core/src/bridge.test.ts
git commit -m "$(cat <<'EOF'
feat(core): add bridge (store + command bus)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Transition tween (`transition.ts`)

**Files:**
- Create: `packages/core/src/transition.ts`
- Test: `packages/core/src/transition.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { easeLinear, easeInOutQuad, tween } from "./transition";
import type { FrameInfo } from "./types";

/** Fake ticker: records the callback so the test can drive frames manually. */
function makeFakeTicker() {
  let cb: ((frame: FrameInfo) => void) | null = null;
  return {
    ticker: {
      add: (fn: (frame: FrameInfo) => void) => { cb = fn; },
      remove: (fn: (frame: FrameInfo) => void) => { if (cb === fn) cb = null; }
    },
    frame(deltaMS: number) {
      if (cb) cb({ deltaTime: deltaMS / 16.6667, deltaMS });
    },
    get attached() { return cb !== null; }
  };
}

describe("easing", () => {
  it("easeLinear is identity at endpoints and midpoint", () => {
    expect(easeLinear(0)).toBe(0);
    expect(easeLinear(0.5)).toBe(0.5);
    expect(easeLinear(1)).toBe(1);
  });
  it("easeInOutQuad pins endpoints", () => {
    expect(easeInOutQuad(0)).toBe(0);
    expect(easeInOutQuad(1)).toBe(1);
  });
});

describe("tween", () => {
  it("reports eased progress each frame and resolves at completion", async () => {
    const fake = makeFakeTicker();
    const seen: number[] = [];
    const done = tween(fake.ticker, 100, easeLinear, (p) => seen.push(p));

    fake.frame(50); // 50ms -> 0.5
    fake.frame(50); // 100ms -> 1.0 (resolves, detaches)

    await done;
    expect(seen).toEqual([0.5, 1]);
    expect(fake.attached).toBe(false);
  });

  it("clamps progress at 1 even if total elapsed overshoots", async () => {
    const fake = makeFakeTicker();
    let last = -1;
    const done = tween(fake.ticker, 100, easeLinear, (p) => { last = p; });
    fake.frame(250);
    await done;
    expect(last).toBe(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run packages/core/src/transition.test.ts`
Expected: FAIL — cannot find module `./transition`.

- [ ] **Step 3: Write minimal implementation**

```ts
import type { FrameInfo, TickerLike } from "./types";

export type Ease = (t: number) => number;

export const easeLinear: Ease = (t) => t;
export const easeInOutQuad: Ease = (t) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

export function tween(
  ticker: TickerLike,
  durationMs: number,
  ease: Ease,
  onProgress: (t: number) => void
): Promise<void> {
  return new Promise<void>((resolve) => {
    if (durationMs <= 0) {
      onProgress(1);
      resolve();
      return;
    }
    let elapsed = 0;
    const step = (frame: FrameInfo): void => {
      elapsed += frame.deltaMS;
      const p = Math.min(elapsed / durationMs, 1);
      onProgress(ease(p));
      if (p >= 1) {
        ticker.remove(step);
        resolve();
      }
    };
    ticker.add(step);
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run packages/core/src/transition.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/core/src/transition.ts packages/core/src/transition.test.ts
git commit -m "$(cat <<'EOF'
feat(core): add ticker-driven tween and easing helpers

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: View fit (`view.ts`)

**Files:**
- Create: `packages/core/src/view.ts`
- Test: `packages/core/src/view.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { fit } from "./view";

describe("fit", () => {
  it("contain picks the smaller axis scale (letterbox)", () => {
    // design 1280x720 into 1280x1000 -> width-bound, scale 1
    expect(fit(1280, 720, 1280, 1000, "contain")).toBe(1);
    // into 640x720 -> width-bound, scale 0.5
    expect(fit(1280, 720, 640, 720, "contain")).toBe(0.5);
  });

  it("cover picks the larger axis scale (crop)", () => {
    expect(fit(1280, 720, 1280, 1000, "cover")).toBeCloseTo(1000 / 720, 5);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run packages/core/src/view.test.ts`
Expected: FAIL — cannot find module `./view`.

- [ ] **Step 3: Write minimal implementation**

```ts
import type { Application } from "pixi.js";
import type { ViewConfig, ViewFit } from "./types";

export function fit(
  designW: number,
  designH: number,
  boxW: number,
  boxH: number,
  mode: ViewFit
): number {
  const sx = boxW / designW;
  const sy = boxH / designH;
  return mode === "cover" ? Math.max(sx, sy) : Math.min(sx, sy);
}

/**
 * Lay out canvas world and #ui-root with one shared scale so design
 * coordinates map identically to both layers. Returns a disposer.
 */
export function applyView(
  app: Application,
  view: ViewConfig,
  mount: HTMLElement,
  uiRoot: HTMLElement
): () => void {
  const [designW, designH] = view.design;
  const mode: ViewFit = view.fit ?? "contain";

  uiRoot.style.width = `${designW}px`;
  uiRoot.style.height = `${designH}px`;

  const layout = (): void => {
    const boxW = mount.clientWidth;
    const boxH = mount.clientHeight;
    const scale = fit(designW, designH, boxW, boxH, mode);
    const tx = (boxW - designW * scale) / 2;
    const ty = (boxH - designH * scale) / 2;
    uiRoot.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
    app.stage.scale.set(scale);
    app.stage.position.set(tx, ty);
  };

  layout();

  if (typeof ResizeObserver === "undefined") {
    return () => undefined;
  }
  const observer = new ResizeObserver(() => layout());
  observer.observe(mount);
  return () => observer.disconnect();
}
```

> `applyView` is exercised by the demo (real browser, real `ResizeObserver`). Only the pure `fit` is unit-tested; jsdom lacks `ResizeObserver`, hence the guard.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run packages/core/src/view.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/core/src/view.ts packages/core/src/view.test.ts
git commit -m "$(cat <<'EOF'
feat(core): add design-resolution fit for canvas + overlay

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Asset loader stub (`asset-loader.ts`)

**Files:**
- Create: `packages/core/src/asset-loader.ts`
- Test: `packages/core/src/asset-loader.dom.test.ts` (jsdom — importing `pixi.js` touches DOM globals at module load)

> v1 stub: shaped like the final API (so scene `onPreload` signatures are stable) but the real AssetPack pipeline is a later cycle. `loadBundle` resolves without touching Pixi when no manifest was initialized, so it is unit-testable headless.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { AssetLoader } from "./asset-loader";

describe("AssetLoader (v1 stub)", () => {
  it("loadBundle resolves to a no-op when uninitialized", async () => {
    const loader = new AssetLoader();
    await expect(loader.loadBundle("menu")).resolves.toBeUndefined();
  });

  it("reports initialized state", () => {
    const loader = new AssetLoader();
    expect(loader.initialized).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run packages/core/src/asset-loader.dom.test.ts`
Expected: FAIL — cannot find module `./asset-loader`.

- [ ] **Step 3: Write minimal implementation**

```ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run packages/core/src/asset-loader.dom.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/core/src/asset-loader.ts packages/core/src/asset-loader.dom.test.ts
git commit -m "$(cat <<'EOF'
feat(core): add v1 asset-loader stub over Pixi Assets

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: BaseScene (`scene.ts`)

**Files:**
- Create: `packages/core/src/scene.ts`
- Test: `packages/core/src/scene.dom.test.ts` (jsdom — Pixi `Container` needs DOM globals)

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it, vi } from "vitest";
import { Container } from "pixi.js";
import { createStore } from "./store";
import { ServiceRegistry } from "./services";
import { BaseScene } from "./scene";
import type { GameState, SceneContext } from "./types";

function ctx(): SceneContext {
  return { services: new ServiceRegistry(), store: createStore<GameState>({ route: [] }) };
}

class TestScene extends BaseScene {
  static key = "Test";
  createdWith: unknown = null;
  destroyed = false;
  onCreate(data: unknown): void {
    this.createdWith = data;
    this.spawn(new Container());
  }
  onDestroy(): void {
    this.destroyed = true;
  }
}

describe("BaseScene", () => {
  it("starts with an empty world Container", () => {
    const scene = new TestScene(ctx());
    expect(scene.world).toBeInstanceOf(Container);
    expect(scene.world.children.length).toBe(0);
  });

  it("spawn adds to world and registers auto-cleanup", () => {
    const scene = new TestScene(ctx());
    scene.onCreate({ level: 1 });
    expect(scene.createdWith).toEqual({ level: 1 });
    expect(scene.world.children.length).toBe(1);
  });

  it("_runDestroy runs disposers in reverse order, then onDestroy", () => {
    const scene = new TestScene(ctx());
    const order: string[] = [];
    scene.onCleanup(() => order.push("first"));
    scene.onCleanup(() => order.push("second"));
    scene._runDestroy(() => undefined);
    expect(order).toEqual(["second", "first"]);
    expect(scene.destroyed).toBe(true);
  });

  it("_runDestroy routes a throwing disposer to the error handler and continues", () => {
    const scene = new TestScene(ctx());
    const onError = vi.fn();
    scene.onCleanup(() => { throw new Error("boom"); });
    const survivor = vi.fn();
    scene.onCleanup(survivor);
    scene._runDestroy(onError);
    expect(survivor).toHaveBeenCalledTimes(1); // ran before the throwing one (reverse order)
    expect(onError).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run packages/core/src/scene.dom.test.ts`
Expected: FAIL — cannot find module `./scene`.

- [ ] **Step 3: Write minimal implementation**

```ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run packages/core/src/scene.dom.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/core/src/scene.ts packages/core/src/scene.dom.test.ts
git commit -m "$(cat <<'EOF'
feat(core): add BaseScene with world + lifecycle + auto-cleanup

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 10: SceneManager (`scene-manager.ts`)

**Files:**
- Create: `packages/core/src/scene-manager.ts`
- Test: `packages/core/src/scene-manager.dom.test.ts` (jsdom)

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { Container } from "pixi.js";
import { createBridge } from "./bridge";
import { ServiceRegistry } from "./services";
import { AssetLoader } from "./asset-loader";
import { BaseScene } from "./scene";
import { SceneManager } from "./scene-manager";
import type { FrameInfo, SceneManagerHost } from "./types";

function makeHost(): { host: SceneManagerHost; frame(ms: number): void } {
  const ticks = new Set<(f: FrameInfo) => void>();
  const host: SceneManagerHost = {
    stage: new Container(),
    ticker: {
      add: (fn) => { ticks.add(fn); },
      remove: (fn) => { ticks.delete(fn); }
    },
    uiRoot: document.createElement("div"),
    bridge: createBridge({}),
    loader: new AssetLoader(),
    services: new ServiceRegistry()
  };
  return {
    host,
    frame: (ms) => { for (const fn of ticks) fn({ deltaTime: ms / 16.6667, deltaMS: ms }); }
  };
}

const log: string[] = [];
class A extends BaseScene {
  static key = "A";
  onCreate(): void { log.push("A.create"); }
  onUpdate(): void { log.push("A.update"); }
  onDestroy(): void { log.push("A.destroy"); }
}
class B extends BaseScene {
  static key = "B";
  onCreate(): void { log.push("B.create"); }
}

describe("SceneManager", () => {
  it("go() builds the scene, attaches world, ticks it, and updates route", async () => {
    log.length = 0;
    const { host, frame } = makeHost();
    const mgr = new SceneManager(host, () => undefined);
    mgr.register(A);

    await mgr.go("A");

    expect(host.stage.children.length).toBe(1);
    expect(host.bridge.store.getState().route).toEqual([{ scene: "A", data: undefined }]);
    frame(16);
    expect(log).toContain("A.update");
    expect(mgr.getStack()[0]?.key).toBe("A");
  });

  it("go() to another scene tears down the previous one", async () => {
    log.length = 0;
    const { host } = makeHost();
    const mgr = new SceneManager(host, () => undefined);
    mgr.register(A);
    mgr.register(B);

    await mgr.go("A");
    await mgr.go("B");

    expect(log).toContain("A.destroy");
    expect(host.stage.children.length).toBe(1);
    expect(mgr.getStack().map((e) => e.key)).toEqual(["B"]);
  });

  it("push() keeps the previous scene mounted; pop() restores it", async () => {
    const { host } = makeHost();
    const mgr = new SceneManager(host, () => undefined);
    mgr.register(A);
    mgr.register(B);

    await mgr.go("A");
    await mgr.push("B");
    expect(mgr.getStack().map((e) => e.key)).toEqual(["A", "B"]);
    expect(host.stage.children.length).toBe(2);

    mgr.pop();
    expect(mgr.getStack().map((e) => e.key)).toEqual(["A"]);
    expect(host.bridge.store.getState().route.map((r) => r.scene)).toEqual(["A"]);
  });

  it("pop() at depth 1 is a no-op", async () => {
    const { host } = makeHost();
    const mgr = new SceneManager(host, () => undefined);
    mgr.register(A);
    await mgr.go("A");
    mgr.pop();
    expect(mgr.getStack().map((e) => e.key)).toEqual(["A"]);
  });

  it("throws when navigating to an unregistered scene", async () => {
    const { host } = makeHost();
    const mgr = new SceneManager(host, () => undefined);
    await expect(mgr.go("Nope")).rejects.toThrow(/Nope/);
  });

  it("notifies stack subscribers on change", async () => {
    const { host } = makeHost();
    const mgr = new SceneManager(host, () => undefined);
    mgr.register(A);
    let calls = 0;
    mgr.subscribe(() => { calls += 1; });
    await mgr.go("A");
    expect(calls).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run packages/core/src/scene-manager.dom.test.ts`
Expected: FAIL — cannot find module `./scene-manager`. (Also add `SceneManagerHost` to `types.ts` in Step 3.)

- [ ] **Step 3a: Add `SceneManagerHost` to `types.ts`**

Append to `packages/core/src/types.ts`:
```ts
import type { Bridge } from "./bridge";
import type { AssetLoader } from "./asset-loader";

export interface SceneStackEntry {
  key: string;
  data: unknown;
  Screen?: import("react").ComponentType<SceneScreenProps>;
  instance: BaseScene;
}

export interface SceneManagerHost {
  readonly stage: Container;
  readonly ticker: TickerLike;
  readonly uiRoot: HTMLElement;
  readonly bridge: Bridge;
  readonly loader: AssetLoader;
  readonly services: ServiceRegistry;
}
```

- [ ] **Step 3b: Write minimal implementation**

```ts
import { tween, easeLinear } from "./transition";
import { BaseScene, type SceneConstructor } from "./scene";
import type {
  FrameInfo,
  GoOptions,
  SceneContext,
  SceneManagerHost,
  SceneStackEntry,
  Transition
} from "./types";

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
    const entry = await this.enter(key, opt);
    const prev = this.stack[this.stack.length - 1] ?? null;
    const transition = opt.transition ?? { type: "none" };

    if (prev && transition.type === "fade") {
      await this.fade(transition, (p) => {
        prev.instance.world.alpha = 1 - p;
        this.host.uiRoot.style.opacity = String(1 - p);
      });
    }

    if (prev) this.teardown(prev);
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
    }
    return entry.instance;
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
    const ctx: SceneContext = { services: this.host.services, store: this.host.bridge.store };
    const instance = new Ctor(ctx);
    await instance.onPreload(this.host.loader, Ctor.assets);
    this.host.stage.addChild(instance.world);
    instance.onCreate(opt.data);
    const tick = (frame: FrameInfo): void => instance.onUpdate(frame.deltaTime);
    this.host.ticker.add(tick);
    this.ticks.set(instance, tick);
    return { key, data: opt.data, Screen: Ctor.Screen, instance };
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run packages/core/src/scene-manager.dom.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/core/src/scene-manager.ts packages/core/src/types.ts packages/core/src/scene-manager.dom.test.ts
git commit -m "$(cat <<'EOF'
feat(core): add SceneManager with go/push/pop and ticker transitions

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 11: React glue (`react/`)

**Files:**
- Create: `packages/core/src/react/GameProvider.tsx`, `packages/core/src/react/hooks.ts`, `packages/core/src/react/Overlay.tsx`, `packages/core/src/react/mount.tsx`
- Test: `packages/core/src/react/Overlay.dom.test.tsx` (jsdom)

> `react/` may import `Game` only as a type (`import type`) to avoid a runtime import cycle with `game.ts`.

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Container } from "pixi.js";
import { createBridge } from "../bridge";
import { ServiceRegistry } from "../services";
import { AssetLoader } from "../asset-loader";
import { SceneManager } from "../scene-manager";
import { BaseScene } from "../scene";
import { GameProvider } from "./GameProvider";
import { Overlay } from "./Overlay";
import type { ReactNode } from "react";
import type { Game } from "../game";
import type { FrameInfo, SceneManagerHost, SceneScreenProps } from "../types";

function MenuScreen(_props: SceneScreenProps): ReactNode {
  return <button>Play</button>;
}
class MenuScene extends BaseScene {
  static key = "Menu";
  static Screen = MenuScreen;
}

function fakeGame(): Game {
  const ticks = new Set<(f: FrameInfo) => void>();
  const host: SceneManagerHost = {
    stage: new Container(),
    ticker: { add: (fn) => { ticks.add(fn); }, remove: (fn) => { ticks.delete(fn); } },
    uiRoot: document.createElement("div"),
    bridge: createBridge({}),
    loader: new AssetLoader(),
    services: new ServiceRegistry()
  };
  const scenes = new SceneManager(host);
  scenes.register(MenuScene);
  // Only the members Overlay/hooks touch are needed for this test.
  const game = { scenes, bridge: host.bridge } satisfies Pick<Game, "scenes" | "bridge">;
  return game as Game;
}

describe("Overlay", () => {
  it("renders the current scene's Screen from the stack", async () => {
    const game = fakeGame();
    await game.scenes.go("Menu");
    render(
      <GameProvider game={game}>
        <Overlay />
      </GameProvider>
    );
    expect(screen.getByRole("button", { name: "Play" })).toBeDefined();
  });
});
```

> The `game as Game` cast is the documented acceptable case for a test double: the fake provides exactly the members the unit under test reads (`scenes`, `bridge`), enforced by `satisfies Pick<Game, ...>`. No production code uses this cast.

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run packages/core/src/react/Overlay.dom.test.tsx`
Expected: FAIL — cannot find module `./GameProvider`.

- [ ] **Step 3: Write minimal implementations**

`packages/core/src/react/GameProvider.tsx`:
```tsx
import { createContext, useContext, type ReactNode } from "react";
import type { Game } from "../game";

const GameContext = createContext<Game | null>(null);

export function GameProvider({ game, children }: { game: Game; children: ReactNode }): ReactNode {
  return <GameContext.Provider value={game}>{children}</GameContext.Provider>;
}

export function useGame(): Game {
  const game = useContext(GameContext);
  if (!game) throw new Error("useGame must be used within <GameProvider>");
  return game;
}
```

`packages/core/src/react/hooks.ts`:
```ts
import { useCallback, useRef, useSyncExternalStore } from "react";
import { useGame } from "./GameProvider";
import type { BaseScene, GameState, SceneStackEntry } from "../types";

const NO_VALUE = Symbol("no-value");

export function useStore<T>(selector: (state: GameState) => T): T {
  const store = useGame().bridge.store;
  const selectorRef = useRef(selector);
  selectorRef.current = selector;
  const cache = useRef<T | typeof NO_VALUE>(NO_VALUE);

  const getSnapshot = useCallback((): T => {
    const next = selectorRef.current(store.getState());
    const cached = cache.current;
    if (cached !== NO_VALUE && Object.is(cached, next)) return cached;
    cache.current = next;
    return next;
  }, [store]);

  return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}

export function useSceneStack(): readonly SceneStackEntry[] {
  const scenes = useGame().scenes;
  return useSyncExternalStore(scenes.subscribe, scenes.getStack, scenes.getStack);
}

export function useScene(): BaseScene | null {
  const stack = useSceneStack();
  return stack[stack.length - 1]?.instance ?? null;
}

export { useGame };
```

`packages/core/src/react/Overlay.tsx`:
```tsx
import type { ReactNode } from "react";
import { useSceneStack } from "./hooks";

export function Overlay(): ReactNode {
  const stack = useSceneStack();
  return (
    <>
      {stack.map((entry) =>
        entry.Screen ? (
          <entry.Screen key={entry.key} data={entry.data} scene={entry.instance} />
        ) : null
      )}
    </>
  );
}
```

`packages/core/src/react/mount.tsx`:
```tsx
import { createRoot, type Root } from "react-dom/client";
import { GameProvider } from "./GameProvider";
import { Overlay } from "./Overlay";
import type { Game } from "../game";

export function mountOverlay(uiRoot: HTMLElement, game: Game): Root {
  const root = createRoot(uiRoot);
  root.render(
    <GameProvider game={game}>
      <Overlay />
    </GameProvider>
  );
  return root;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run packages/core/src/react/Overlay.dom.test.tsx`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add packages/core/src/react
git commit -m "$(cat <<'EOF'
feat(core): add React glue (provider, hooks, overlay, mount)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 12: Game boot (`game.ts`)

**Files:**
- Create: `packages/core/src/game.ts`
- Test: `packages/core/src/game.dom.test.ts` (jsdom — construction only; `start()` needs WebGL and is proven by the demo)

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { createGame } from "./game";
import { BaseScene } from "./scene";

class Boot extends BaseScene {
  static key = "Boot";
}

describe("createGame", () => {
  it("constructs a frozen-config Game with registered scenes, before start()", () => {
    const game = createGame({
      mount: "#app",
      view: { design: [1280, 720] },
      initialScene: "Boot",
      initialState: {},
      scenes: [Boot]
    });
    expect(game.config.initialScene).toBe("Boot");
    expect(Object.isFrozen(game.config)).toBe(true);
    expect(game.scenes.current).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run packages/core/src/game.dom.test.ts`
Expected: FAIL — cannot find module `./game`. (Add `GameConfig` to `types.ts` in Step 3a.)

- [ ] **Step 3a: Add `GameConfig` to `types.ts`**

Append to `packages/core/src/types.ts`:
```ts
import type { SceneConstructor } from "./scene";

export interface GamePlugin {
  install(game: import("./game").Game): void | Promise<void>;
}

export interface GameHooks {
  onReady?(game: import("./game").Game): void | Promise<void>;
  onError?(error: unknown): void;
}

export interface GameConfig {
  mount?: string;
  view: ViewConfig;
  initialScene: string;
  initialState: Omit<GameState, "route">;
  scenes: SceneConstructor[];
  manifest?: string;
  plugins?: GamePlugin[];
  hooks?: GameHooks;
}
```

- [ ] **Step 3b: Write minimal implementation**

```ts
import { Application } from "pixi.js";
import type { Root } from "react-dom/client";
import { createBridge, type Bridge } from "./bridge";
import { ServiceRegistry } from "./services";
import { AssetLoader } from "./asset-loader";
import { SceneManager } from "./scene-manager";
import { applyView } from "./view";
import { mountOverlay } from "./react/mount";
import { injectBaseStyles } from "./react/styles";
import type { GameConfig, SceneManagerHost } from "./types";

export class Game {
  readonly config: Readonly<GameConfig>;
  readonly app: Application = new Application();
  readonly services: ServiceRegistry = new ServiceRegistry();
  readonly bridge: Bridge;
  readonly loader: AssetLoader = new AssetLoader();
  readonly scenes: SceneManager;

  uiRoot: HTMLElement | null = null;
  private reactRoot: Root | null = null;
  private disposeView: (() => void) | null = null;
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
      bridge: this.bridge,
      loader: this.loader,
      services: this.services
    };

    this.scenes = new SceneManager(host, config.hooks?.onError);
    for (const ctor of config.scenes) this.scenes.register(ctor);
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

    this.disposeView = applyView(this.app, this.config.view, mount, uiRoot);

    if (this.config.manifest) await this.loader.init(this.config.manifest);

    this.reactRoot = mountOverlay(uiRoot, this);

    for (const plugin of this.config.plugins ?? []) await plugin.install(this);
    await this.config.hooks?.onReady?.(this);

    await this.scenes.go(this.config.initialScene);
  }

  stop(): void {
    this.disposeView?.();
    this.reactRoot?.unmount();
    this.app.destroy(true, { children: true });
  }
}

export function createGame(config: GameConfig): Game {
  return new Game(config);
}
```

- [ ] **Step 3c: Create `packages/core/src/react/styles.ts`**

```ts
const STYLE_ID = "studio-core-styles";

const CSS = `
#ui-root {
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: top left;
  pointer-events: none;
}
#ui-root :where(button, input, select, textarea, a, [data-pe="auto"]) {
  pointer-events: auto;
}
`;

export function injectBaseStyles(): void {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = CSS;
  document.head.appendChild(style);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run packages/core/src/game.dom.test.ts`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add packages/core/src/game.ts packages/core/src/react/styles.ts packages/core/src/types.ts packages/core/src/game.dom.test.ts
git commit -m "$(cat <<'EOF'
feat(core): add Game boot (Pixi app + React overlay + scenes)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 13: Public surface (`index.ts`)

**Files:**
- Create: `packages/core/src/index.ts`

- [ ] **Step 1: Write the barrel**

```ts
export { createGame, Game } from "./game";
export { BaseScene, type SceneConstructor } from "./scene";
export { SceneManager } from "./scene-manager";
export { createBridge, type Bridge } from "./bridge";
export { createStore, type Store } from "./store";
export { ServiceRegistry, type ServiceKey } from "./services";
export { AssetLoader } from "./asset-loader";
export { applyView, fit } from "./view";
export { tween, easeLinear, easeInOutQuad, type Ease } from "./transition";
export { GameProvider } from "./react/GameProvider";
export { Overlay } from "./react/Overlay";
export { useGame, useStore, useScene, useSceneStack } from "./react/hooks";
export type {
  GameConfig,
  GameHooks,
  GamePlugin,
  GameState,
  Command,
  CommandMap,
  RouteEntry,
  ViewConfig,
  ViewFit,
  Transition,
  GoOptions,
  SceneContext,
  SceneScreenProps,
  SceneStackEntry,
  SceneManagerHost,
  TickerLike,
  FrameInfo
} from "./types";
```

- [ ] **Step 2: Typecheck the whole package**

Run: `pnpm --filter @studio/core exec tsc -b`
Expected: no errors. Fix any type errors surfaced across modules before committing.

- [ ] **Step 3: Run the full core test suite + coverage**

Run: `pnpm coverage`
Expected: all tests PASS; coverage ≥ 80% (lines/functions/branches/statements) over the included core modules. The browser-boot/DOM glue (`index.ts`, `game.ts`, `view.ts`, `react/mount.tsx`, `react/styles.ts`) is excluded from the threshold in `vitest.config.ts` because it is verified by the demo (Task 14), not unit tests. If the threshold fails, add the missing unit test — do not widen the exclude list.

- [ ] **Step 4: Commit**

```bash
git add packages/core/src/index.ts
git commit -m "$(cat <<'EOF'
feat(core): expose public API surface

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 14: Demo app (`apps/demo`)

**Files:**
- Create: `apps/demo/index.html`, `apps/demo/vite.config.ts`, `apps/demo/src/main.tsx`, `apps/demo/src/commands.ts`
- Create: `apps/demo/src/scenes/boot/scene.ts`
- Create: `apps/demo/src/scenes/menu/scene.ts`, `apps/demo/src/scenes/menu/Screen.tsx`
- Create: `apps/demo/src/scenes/game/scene.ts`, `apps/demo/src/scenes/game/Hud.tsx`
- Create: `apps/demo/src/scenes/pause/scene.ts`, `apps/demo/src/scenes/pause/Screen.tsx`

> No unit tests here — the demo is the manual proof of DoD 1–3 (E2E is a later cycle). Uses a Pixi `Graphics` hero (no asset pipeline needed in v1).

- [ ] **Step 1: HTML + Vite config**

`apps/demo/index.html`:
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Studio Demo</title>
    <style>
      html, body { margin: 0; height: 100%; background: #000; }
      #app { position: relative; width: 100vw; height: 100vh; overflow: hidden; }
      .panel { display: flex; flex-direction: column; gap: 12px; align-items: center; }
      .panel button { font-size: 20px; padding: 8px 24px; cursor: pointer; }
      .center { position: absolute; inset: 0; display: grid; place-items: center; color: #fff; font-family: sans-serif; }
      .modal { position: absolute; inset: 0; display: grid; place-items: center; background: rgba(0,0,0,0.5); }
      .modal .panel { background: #222; color: #fff; padding: 24px; border-radius: 8px; }
      .hud { position: absolute; top: 16px; left: 16px; color: #fff; font-family: sans-serif; font-size: 20px; }
    </style>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

`apps/demo/vite.config.ts`:
```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()]
});
```

- [ ] **Step 2: Game-state + command augmentation (`src/commands.ts`)**

```ts
import "@studio/core";

declare module "@studio/core" {
  interface GameState {
    hud: { coins: number };
  }
  interface CommandMap {
    "scene:go": { type: "scene:go"; key: string };
    "scene:push": { type: "scene:push"; key: string };
    "scene:pop": { type: "scene:pop" };
    "coin:add": { type: "coin:add"; amount: number };
  }
}
```

- [ ] **Step 3: Scenes**

`apps/demo/src/scenes/boot/scene.ts`:
```ts
import { BaseScene } from "@studio/core";

export class BootScene extends BaseScene {
  static key = "Boot";
}
```

> `Boot` is the initial scene with an empty world; `main.tsx` navigates to `Menu` right after `start()`. This keeps scene classes free of navigation wiring and gives a place to hang real preloading once the asset pipeline lands.

`apps/demo/src/scenes/menu/scene.ts`:
```ts
import { BaseScene } from "@studio/core";
import { MenuScreen } from "./Screen";

export class MenuScene extends BaseScene {
  static key = "Menu";
  static Screen = MenuScreen;
}
```

`apps/demo/src/scenes/menu/Screen.tsx`:
```tsx
import { useGame } from "@studio/core";
import type { ReactNode } from "react";

export function MenuScreen(): ReactNode {
  const game = useGame();
  return (
    <div className="center">
      <div className="panel">
        <h1>My Game</h1>
        <button onClick={() => game.bridge.dispatch({ type: "scene:go", key: "Game" })}>Play</button>
      </div>
    </div>
  );
}
```

`apps/demo/src/scenes/game/scene.ts`:
```ts
import { Graphics } from "pixi.js";
import { BaseScene } from "@studio/core";
import { GameHud } from "./Hud";

export class GameScene extends BaseScene {
  static key = "Game";
  static Screen = GameHud;

  private hero: Graphics | null = null;

  onCreate(): void {
    const hero = this.spawn(new Graphics().circle(0, 0, 40).fill(0xe74c3c));
    hero.position.set(640, 360);
    this.hero = hero;
  }

  onUpdate(dt: number): void {
    if (!this.hero) return;
    this.hero.x += 0.6 * dt;
    if (this.hero.x > 1320) this.hero.x = -40;
  }
}
```

`apps/demo/src/scenes/game/Hud.tsx`:
```tsx
import { useGame, useStore } from "@studio/core";
import type { ReactNode } from "react";

export function GameHud(): ReactNode {
  const game = useGame();
  const coins = useStore((s) => s.hud.coins);
  return (
    <>
      <div className="hud">Coins: {coins}</div>
      <div style={{ position: "absolute", top: 16, right: 16, display: "flex", gap: 8 }}>
        <button onClick={() => game.bridge.dispatch({ type: "coin:add", amount: 1 })}>+1 Coin</button>
        <button onClick={() => game.bridge.dispatch({ type: "scene:push", key: "Pause" })}>Pause</button>
      </div>
    </>
  );
}
```

`apps/demo/src/scenes/pause/scene.ts`:
```ts
import { BaseScene } from "@studio/core";
import { PauseScreen } from "./Screen";

export class PauseScene extends BaseScene {
  static key = "Pause";
  static Screen = PauseScreen;
}
```

`apps/demo/src/scenes/pause/Screen.tsx`:
```tsx
import { useGame } from "@studio/core";
import type { ReactNode } from "react";

export function PauseScreen(): ReactNode {
  const game = useGame();
  return (
    <div className="modal">
      <div className="panel">
        <h2>Paused</h2>
        <button onClick={() => game.bridge.dispatch({ type: "scene:pop" })}>Resume</button>
        <button onClick={() => game.bridge.dispatch({ type: "scene:go", key: "Menu" })}>Quit to Menu</button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Wire it up (`src/main.tsx`)**

```tsx
import "./commands";
import { createGame } from "@studio/core";
import { BootScene } from "./scenes/boot/scene";
import { MenuScene } from "./scenes/menu/scene";
import { GameScene } from "./scenes/game/scene";
import { PauseScene } from "./scenes/pause/scene";

const game = createGame({
  mount: "#app",
  view: { design: [1280, 720], fit: "contain", background: "#1a1a2e" },
  initialScene: "Boot",
  initialState: { hud: { coins: 0 } },
  scenes: [BootScene, MenuScene, GameScene, PauseScene]
});

game.bridge.onCommand((cmd) => {
  switch (cmd.type) {
    case "scene:go":
      void game.scenes.go(cmd.key, { transition: { type: "fade", duration: 250 } });
      break;
    case "scene:push":
      void game.scenes.push(cmd.key);
      break;
    case "scene:pop":
      game.scenes.pop();
      break;
    case "coin:add":
      game.bridge.store.setState((s) => ({ ...s, hud: { ...s.hud, coins: s.hud.coins + cmd.amount } }));
      break;
  }
});

void game.start().then(() => {
  void game.scenes.go("Menu", { transition: { type: "fade", duration: 250 } });
});
```

- [ ] **Step 5: Run typecheck + dev server, verify manually**

Run: `pnpm typecheck`
Expected: no errors across core + demo.

Run: `pnpm dev`
Expected: Vite serves the demo. In a browser, confirm DoD 1–3:
1. Menu (pure-React) shows; **Play** fades into the Game scene with a moving red circle (Pixi world) + HUD overlay (React).
2. **+1 Coin** increments the HUD number (store read in React). **Pause** opens a modal over the running game (`push`); **Resume** closes it (`pop`); **Quit to Menu** returns via `go`.
3. Clicking an empty overlay region does not block — the game keeps animating (pointer-events fall-through). Interactive buttons still work.

(If `pnpm dev` cannot be verified by the agent, state that explicitly and leave the browser check to the user.)

- [ ] **Step 6: Commit**

```bash
git add apps/demo
git commit -m "$(cat <<'EOF'
feat(demo): boot/menu/game+HUD/pause demo proving DoD 1-3

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 15: Enforce the engine-agnostic boundary

**Files:**
- Create: `.dependency-cruiser.cjs`

- [ ] **Step 1: Write the dependency-cruiser config**

```cjs
/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "core-no-pixi-react",
      comment: "store/bridge/services must stay engine-agnostic (no pixi.js or react)",
      severity: "error",
      from: { path: "packages/core/src/(store|bridge|services)\\.ts$" },
      to: { path: "node_modules/(pixi\\.js|react|react-dom)" }
    },
    {
      name: "no-circular",
      severity: "error",
      from: {},
      to: { circular: true }
    }
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    tsConfig: { fileName: "packages/core/tsconfig.json" },
    enhancedResolveOptions: { exportsFields: ["exports"], conditionNames: ["import", "require"] }
  }
};
```

- [ ] **Step 2: Run the boundary check — verify it passes**

Run: `pnpm depcruise`
Expected: `no dependency violations found`. (If `store`/`bridge`/`services` accidentally import Pixi/React, this reports an error — fix the offending import, do not relax the rule.)

- [ ] **Step 3: Add a deliberate violation to confirm the rule bites, then revert**

Temporarily add `import { Container } from "pixi.js";` to `packages/core/src/store.ts`.
Run: `pnpm depcruise`
Expected: FAIL — `core-no-pixi-react` violation reported.
Then remove the import and re-run `pnpm depcruise` → passes.

- [ ] **Step 4: Final full verification**

Run: `pnpm typecheck && pnpm coverage && pnpm depcruise`
Expected: typecheck clean; tests pass with core coverage ≥ 80%; no dependency violations.

- [ ] **Step 5: Commit**

```bash
git add .dependency-cruiser.cjs
git commit -m "$(cat <<'EOF'
chore: enforce engine-agnostic core boundary via dependency-cruiser

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Definition of Done (this plan)

- [ ] `pnpm typecheck` clean (strict, no `any`/`as any`/`!`)
- [ ] `pnpm coverage` passes; `packages/core/src` ≥ 80%
- [ ] `pnpm depcruise` clean; `store`/`bridge`/`services` leak neither Pixi nor React
- [ ] `pnpm dev` runs the demo: pure-React Menu, Pixi-world+HUD Game, `go`/`push`/`pop`, Pause modal, fade transition, pointer-events fall-through, HUD reads store, buttons dispatch commands
- [ ] All files within size budget (≤ 800 lines; functions < 50 lines)
