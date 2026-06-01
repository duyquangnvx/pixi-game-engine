import type { InputEventSource, RawKeyboardEvent, RawPointerEvent } from "@studio/core";

export interface DomInputSourceOptions {
  /** Max pointer travel (CSS px) between down and up to still count as a tap. */
  tapMaxDistance?: number;
  /** Max press duration (ms) to count as a tap. */
  tapMaxDuration?: number;
  /** Return false to suppress keyboard input (e.g. while a form field is focused). */
  keyboardEnabled?: () => boolean;
}

const DEFAULT_TAP_DISTANCE = 10;
const DEFAULT_TAP_DURATION = 250;

function defaultKeyboardEnabled(): boolean {
  const active = document.activeElement;
  if (!active) return true;
  const tag = active.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return false;
  return !(active instanceof HTMLElement && active.isContentEditable);
}

/**
 * DOM-backed {@link InputEventSource}: pointer events on the canvas (with tap
 * synthesis) and keyboard events on the window. Pointer coordinates are
 * canvas-relative CSS pixels; the input runtime maps them to design space.
 */
export function createDomInputSource(
  canvas: HTMLCanvasElement,
  options: DomInputSourceOptions = {}
): InputEventSource {
  const tapMaxDistance = options.tapMaxDistance ?? DEFAULT_TAP_DISTANCE;
  const tapMaxDuration = options.tapMaxDuration ?? DEFAULT_TAP_DURATION;
  const keyboardEnabled = options.keyboardEnabled ?? defaultKeyboardEnabled;

  const pointerListeners = new Set<(e: RawPointerEvent) => void>();
  const keyListeners = new Set<(e: RawKeyboardEvent) => void>();
  const presses = new Map<number, { x: number; y: number; t: number }>();

  const emitPointer = (e: RawPointerEvent): void => {
    for (const fn of pointerListeners) fn(e);
  };
  const emitKey = (e: RawKeyboardEvent): void => {
    for (const fn of keyListeners) fn(e);
  };

  const toCanvas = (clientX: number, clientY: number): { x: number; y: number } => {
    const rect = canvas.getBoundingClientRect();
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const onPointerDown = (ev: PointerEvent): void => {
    const { x, y } = toCanvas(ev.clientX, ev.clientY);
    presses.set(ev.pointerId, { x, y, t: performance.now() });
    emitPointer({ type: "down", pointerId: ev.pointerId, viewportX: x, viewportY: y });
  };

  const onPointerMove = (ev: PointerEvent): void => {
    const { x, y } = toCanvas(ev.clientX, ev.clientY);
    emitPointer({ type: "move", pointerId: ev.pointerId, viewportX: x, viewportY: y });
  };

  const onPointerUp = (ev: PointerEvent): void => {
    const { x, y } = toCanvas(ev.clientX, ev.clientY);
    emitPointer({ type: "up", pointerId: ev.pointerId, viewportX: x, viewportY: y });
    const start = presses.get(ev.pointerId);
    presses.delete(ev.pointerId);
    if (!start) return;
    const distance = Math.hypot(x - start.x, y - start.y);
    if (distance <= tapMaxDistance && performance.now() - start.t <= tapMaxDuration) {
      emitPointer({ type: "tap", pointerId: ev.pointerId, viewportX: x, viewportY: y });
    }
  };

  const onPointerCancel = (ev: PointerEvent): void => {
    const { x, y } = toCanvas(ev.clientX, ev.clientY);
    presses.delete(ev.pointerId);
    emitPointer({ type: "cancel", pointerId: ev.pointerId, viewportX: x, viewportY: y });
  };

  const onKeyDown = (ev: KeyboardEvent): void => {
    if (!keyboardEnabled()) return;
    emitKey({ type: "down", code: ev.code, repeat: ev.repeat });
  };
  const onKeyUp = (ev: KeyboardEvent): void => {
    if (!keyboardEnabled()) return;
    emitKey({ type: "up", code: ev.code, repeat: false });
  };

  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerCancel);
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);

  let destroyed = false;

  return {
    onPointer(fn) {
      pointerListeners.add(fn);
      return () => pointerListeners.delete(fn);
    },
    onKey(fn) {
      keyListeners.add(fn);
      return () => keyListeners.delete(fn);
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerCancel);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      pointerListeners.clear();
      keyListeners.clear();
      presses.clear();
    }
  };
}
