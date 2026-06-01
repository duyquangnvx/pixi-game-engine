import { describe, expect, it } from "vitest";
import { hotReplaceScene, registerGame, unregisterGame } from "./hmr";
import { BaseScene } from "./base-scene";
import type { SceneConstructor } from "./base-scene";

class Demo extends BaseScene {
  static override key = "Demo";
}

function makeGameLike(): { game: { scenes: { reload(c: SceneConstructor): Promise<void> } }; reloaded: SceneConstructor[] } {
  const reloaded: SceneConstructor[] = [];
  return {
    game: { scenes: { reload: (c) => { reloaded.push(c); return Promise.resolve(); } } },
    reloaded
  };
}

describe("scene HMR", () => {
  it("hotReplaceScene reloads the scene on every live game", () => {
    const a = makeGameLike();
    const b = makeGameLike();
    registerGame(a.game);
    registerGame(b.game);
    try {
      hotReplaceScene(Demo);
      expect(a.reloaded).toEqual([Demo]);
      expect(b.reloaded).toEqual([Demo]);
    } finally {
      unregisterGame(a.game);
      unregisterGame(b.game);
    }
  });

  it("unregisterGame stops further replacements", () => {
    const { game, reloaded } = makeGameLike();
    registerGame(game);
    unregisterGame(game);
    hotReplaceScene(Demo);
    expect(reloaded).toEqual([]);
  });
});
