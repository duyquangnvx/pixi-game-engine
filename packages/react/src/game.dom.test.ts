import { describe, expect, it } from "vitest";
import { createGame } from "./game";
import { BaseScene } from "@studio/core";

class Boot extends BaseScene {
  static override key = "Boot";
}

describe("createGame", () => {
  it("constructs a frozen-config Game with registered scenes, before start()", () => {
    const game = createGame({
      mount: "#app",
      view: { design: [1280, 720] },
      initialScene: "Boot",
      initialState: {},
      scenes: [Boot]
    });
    expect(game.config.initialScene).toBe("Boot");
    expect(Object.isFrozen(game.config)).toBe(true);
    expect(game.scenes.current).toBeNull();
  });
});
