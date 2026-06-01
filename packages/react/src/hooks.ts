import { useCallback, useRef, useSyncExternalStore } from "react";
import { useGame } from "./GameProvider";
import type { BaseScene, GameState, SceneStackEntry } from "@studio/core";

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
