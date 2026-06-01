import type { FrameInfo, FrameLoop, ScheduleHandle, TickerLike } from "./types";

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

export interface CreateFrameLoopOptions {
  onError?: (error: Error) => void;
}

interface TimerTask {
  kind: "timer";
  fireAt: number;
  fn: () => void;
}

interface IntervalTask {
  kind: "interval";
  intervalMs: number;
  nextFireAt: number;
  fn: () => void;
}

type Task = TimerTask | IntervalTask;

/** Bound on interval fires per frame so a long stall can't trigger a runaway burst. */
const MAX_CATCH_UP_FIRES = 4;

/**
 * Schedules timers and intervals against a ticker, measured in accumulated
 * `deltaMS`. When the ticker is stopped (e.g. a paused game) time stops
 * accumulating, so scheduled work pauses with it. Pure — no DOM or Pixi.
 */
export function createFrameLoop(ticker: TickerLike, options: CreateFrameLoopOptions = {}): FrameLoop {
  const onError = options.onError ?? ((): void => undefined);
  const tasks = new Map<number, Task>();
  let nextId = 0;
  let elapsed = 0;

  const run = (fn: () => void): void => {
    try {
      fn();
    } catch (error: unknown) {
      onError(toError(error));
    }
  };

  const tick = (frame: FrameInfo): void => {
    elapsed += frame.deltaMS;
    for (const id of Array.from(tasks.keys())) {
      const task = tasks.get(id);
      if (!task) continue;
      if (task.kind === "timer") {
        if (elapsed >= task.fireAt) {
          tasks.delete(id);
          run(task.fn);
        }
        continue;
      }
      let fires = 0;
      while (elapsed >= task.nextFireAt && fires < MAX_CATCH_UP_FIRES) {
        task.nextFireAt += task.intervalMs;
        fires += 1;
        run(task.fn);
        if (!tasks.has(id)) break;
      }
    }
  };

  ticker.add(tick);

  const handleFor = (id: number): ScheduleHandle => ({
    cancel: () => {
      tasks.delete(id);
    }
  });

  let destroyed = false;

  return {
    timer(ms, fn) {
      const id = nextId++;
      tasks.set(id, { kind: "timer", fireAt: elapsed + ms, fn });
      return handleFor(id);
    },
    interval(ms, fn) {
      const id = nextId++;
      tasks.set(id, { kind: "interval", intervalMs: ms, nextFireAt: elapsed + ms, fn });
      return handleFor(id);
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      ticker.remove(tick);
      tasks.clear();
    }
  };
}

/** Inert loop used before a game starts (no ticker yet). */
export function emptyFrameLoop(): FrameLoop {
  const noopHandle: ScheduleHandle = { cancel: () => undefined };
  return {
    timer: () => noopHandle,
    interval: () => noopHandle,
    destroy: () => undefined
  };
}
