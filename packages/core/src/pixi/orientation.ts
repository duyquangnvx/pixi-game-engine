import type { Orientation } from "../types";

/**
 * Best-effort orientation lock. Resolves silently when no target is given or
 * the Screen Orientation API is unavailable, and swallows the rejection many
 * browsers throw when not in fullscreen — locking is a hint, not a guarantee.
 */
export async function tryLockOrientation(target?: Orientation): Promise<void> {
  if (!target) return;
  if (typeof screen === "undefined") return;
  const orientation = screen.orientation;
  // `lock` is not in this TS lib's ScreenOrientation type; narrow it at runtime.
  if (!orientation || !("lock" in orientation)) return;
  const lock = orientation.lock;
  if (typeof lock !== "function") return;
  try {
    await lock.call(orientation, target);
  } catch {
    // Most browsers reject unless the document is fullscreen; nothing to do.
  }
}
