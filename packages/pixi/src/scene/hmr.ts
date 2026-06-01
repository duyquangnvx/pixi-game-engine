import type { SceneConstructor } from "./base-scene";

/** Structural view of a running game — avoids importing Game (no dep cycle). */
interface ReloadableGame {
  scenes: { reload(ctor: SceneConstructor): Promise<void> };
}

const liveGames = new Set<ReloadableGame>();

export function registerGame(game: ReloadableGame): void {
  liveGames.add(game);
}

export function unregisterGame(game: ReloadableGame): void {
  liveGames.delete(game);
}

/**
 * Hot-replace a scene class across every live game. Call from a scene module's
 * own HMR block — Vite detects self-accept by statically scanning for a literal
 * `import.meta.hot.accept()` in the module, so the `accept()` call must live in
 * the scene file, not be hidden behind a helper:
 *
 * ```ts
 * if (import.meta.hot) {
 *   import.meta.hot.accept();
 *   hotReplaceScene(MyScene);
 * }
 * ```
 *
 * Vite re-executes the self-accepting module on edit, re-invoking this with the
 * freshly-defined class. React Fast Refresh already handles the scene's `Screen`.
 */
export function hotReplaceScene(ctor: SceneConstructor): void {
  for (const game of liveGames) void game.scenes.reload(ctor);
}
