import { createStore, type Store } from "./store";
import type {
  CommandArgs,
  CommandHandler,
  CommandName,
  CommandResult,
  GameState,
  RouteEntry
} from "./scene-contract";

export interface Bridge {
  store: Store<GameState>;
  invoke<K extends CommandName>(name: K, ...args: CommandArgs<K>): Promise<CommandResult<K>>;
  handle<K extends CommandName>(name: K, handler: CommandHandler<K>): () => void;
  setRoute(stack: ReadonlyArray<RouteEntry>): void;
}

type StoredHandler = (...args: never[]) => unknown;

export function createBridge(initial: Omit<GameState, "route">): Bridge {
  const store = createStore<GameState>({ ...initial, route: [] });
  const handlers = new Map<CommandName, StoredHandler>();

  return {
    store,
    invoke: async <K extends CommandName>(
      name: K,
      ...args: CommandArgs<K>
    ): Promise<CommandResult<K>> => {
      const handler = handlers.get(name);
      if (!handler) {
        throw new Error(`No handler registered for command "${name}"`);
      }
      // The handler stored under `name` is the one registered for K, so its
      // args and result match — the Map's loose value type can't express that.
      const run = handler as CommandHandler<K>;
      return await run(...args);
    },
    handle: <K extends CommandName>(name: K, handler: CommandHandler<K>) => {
      const stored = handler as StoredHandler;
      handlers.set(name, stored);
      return () => {
        if (handlers.get(name) === stored) handlers.delete(name);
      };
    },
    setRoute: (stack) => {
      store.setState((prev) => ({ ...prev, route: [...stack] }));
    }
  };
}
