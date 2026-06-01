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
