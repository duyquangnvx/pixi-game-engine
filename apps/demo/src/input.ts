import { defineInput, type InferInputActions } from "@studio/core";

export const input = defineInput({
  move: { axis: { x: ["KeyA", "KeyD"], y: ["KeyW", "KeyS"] } },
  jump: { keys: ["Space"] },
  warp: { pointer: "tap" }
});

declare module "@studio/core" {
  interface InputActions extends InferInputActions<typeof input> {}
}
