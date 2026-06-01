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
