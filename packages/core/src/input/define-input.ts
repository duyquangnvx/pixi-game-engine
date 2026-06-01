import type { InputMapDef } from "./types";

/**
 * Literal-preserving identity for an input binding map. The `<const M>`
 * generic keeps action names and binding shapes as literal types so
 * `InferInputActions<typeof input>` yields a precise action-kind registry.
 * Pure runtime no-op.
 */
export function defineInput<const M extends InputMapDef>(map: M): M {
  return map;
}
