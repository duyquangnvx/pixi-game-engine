import { describe, expect, it } from "vitest";
import { defineInput } from "./define-input";

describe("defineInput", () => {
  it("returns the binding map unchanged", () => {
    const map = { jump: { keys: ["Space"] }, move: { axis: { x: ["KeyA", "KeyD"] } } } as const;
    expect(defineInput(map)).toBe(map);
  });
});
