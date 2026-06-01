import type { Viewport } from "../types";
import type {
  ActionEvent,
  AxisBinding,
  AxisValue,
  InputEventSource,
  InputFacade,
  InputMapDef,
  InputRuntime
} from "./types";

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

export interface CreateInputRuntimeArgs {
  map: InputMapDef;
  source: InputEventSource;
  viewport: Viewport;
  onError?: (error: Error) => void;
}

type ActionListeners = Map<string, Set<(e: ActionEvent) => void>>;

export function createInputRuntime(args: CreateInputRuntimeArgs): InputRuntime {
  const onError = args.onError ?? ((): void => undefined);
  const { map, source, viewport } = args;

  const keyToActions = new Map<string, string[]>();
  const gestureToActions = new Map<string, string[]>();
  const axisDefs: Array<{ name: string; binding: AxisBinding }> = [];

  for (const name of Object.keys(map)) {
    const binding = map[name];
    if (!binding) continue;
    if ("axis" in binding) {
      axisDefs.push({ name, binding: binding.axis });
      continue;
    }
    for (const code of binding.keys ?? []) {
      const list = keyToActions.get(code) ?? [];
      list.push(name);
      keyToActions.set(code, list);
    }
    if (binding.pointer) {
      const list = gestureToActions.get(binding.pointer) ?? [];
      list.push(name);
      gestureToActions.set(binding.pointer, list);
    }
  }

  const downKeys = new Set<string>();
  const downActions = new Set<string>();
  const downListeners: ActionListeners = new Map();
  const upListeners: ActionListeners = new Map();
  const tapListeners: ActionListeners = new Map();
  const axisListeners = new Map<string, Set<(e: AxisValue) => void>>();
  const axisValues = new Map<string, AxisValue>();

  const keysOf = (action: string): readonly string[] => {
    const binding = map[action];
    return binding && !("axis" in binding) ? binding.keys ?? [] : [];
  };

  const computeAxis = (binding: AxisBinding): AxisValue => {
    const along = (pair?: readonly [string, string]): number =>
      pair ? (downKeys.has(pair[1]) ? 1 : 0) - (downKeys.has(pair[0]) ? 1 : 0) : 0;
    return { x: along(binding.x), y: along(binding.y) };
  };

  for (const def of axisDefs) axisValues.set(def.name, computeAxis(def.binding));

  const dispatch = (listeners: ActionListeners, action: string, event: ActionEvent): void => {
    const set = listeners.get(action);
    if (!set) return;
    for (const handler of set) {
      try {
        handler(event);
      } catch (error: unknown) {
        onError(toError(error));
      }
    }
  };

  const refreshAxes = (): void => {
    for (const def of axisDefs) {
      const next = computeAxis(def.binding);
      const prev = axisValues.get(def.name);
      if (prev && prev.x === next.x && prev.y === next.y) continue;
      axisValues.set(def.name, next);
      for (const handler of axisListeners.get(def.name) ?? []) {
        try {
          handler(next);
        } catch (error: unknown) {
          onError(toError(error));
        }
      }
    }
  };

  const offKey = source.onKey((e) => {
    if (e.type === "down") {
      if (e.repeat || downKeys.has(e.code)) return;
      downKeys.add(e.code);
      for (const action of keyToActions.get(e.code) ?? []) {
        if (!downActions.has(action)) {
          downActions.add(action);
          dispatch(downListeners, action, { type: "down" });
        }
      }
      refreshAxes();
    } else {
      if (!downKeys.has(e.code)) return;
      downKeys.delete(e.code);
      for (const action of keyToActions.get(e.code) ?? []) {
        if (!keysOf(action).some((code) => downKeys.has(code)) && downActions.has(action)) {
          downActions.delete(action);
          dispatch(upListeners, action, { type: "up" });
        }
      }
      refreshAxes();
    }
  });

  const offPointer = source.onPointer((e) => {
    if (e.type === "move" || e.type === "cancel") return;
    const actions = gestureToActions.get(e.type) ?? [];
    if (actions.length === 0) return;
    const point = viewport.viewportToDesign(e.viewportX, e.viewportY);
    const listeners = e.type === "down" ? downListeners : e.type === "up" ? upListeners : tapListeners;
    for (const action of actions) {
      dispatch(listeners, action, { type: e.type, designX: point.x, designY: point.y });
    }
  });

  const add = <H>(
    registry: Map<string, Set<H>>,
    key: string,
    handler: H,
    track: (unsub: () => void) => void
  ): void => {
    const set = registry.get(key) ?? new Set<H>();
    set.add(handler);
    registry.set(key, set);
    track(() => set.delete(handler));
  };

  let destroyed = false;

  return {
    facade(track) {
      const facade: InputFacade = {
        onDown: (action, handler) => add(downListeners, action, handler, track),
        onUp: (action, handler) => add(upListeners, action, handler, track),
        onTap: (action, handler) => add(tapListeners, action, handler, track),
        onAxis: (name, handler) => add(axisListeners, name, handler, track),
        isDown: (action) => downActions.has(action),
        axis: (name) => {
          const def = axisDefs.find((d) => d.name === name);
          return def ? computeAxis(def.binding) : { x: 0, y: 0 };
        }
      };
      return facade;
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      offKey();
      offPointer();
      source.destroy();
      downListeners.clear();
      upListeners.clear();
      tapListeners.clear();
      axisListeners.clear();
      downKeys.clear();
      downActions.clear();
    }
  };
}

export function emptyInputRuntime(): InputRuntime {
  return {
    facade() {
      return {
        onDown: () => undefined,
        onUp: () => undefined,
        onTap: () => undefined,
        onAxis: () => undefined,
        isDown: () => false,
        axis: () => ({ x: 0, y: 0 })
      };
    },
    destroy: () => undefined
  };
}
