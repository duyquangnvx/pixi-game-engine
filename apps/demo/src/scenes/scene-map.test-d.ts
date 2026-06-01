import { expectTypeOf } from "vitest";
import { createGame } from "@studio/react";
import "./scene-map";

declare const game: ReturnType<typeof createGame>;

// keys + data are constrained by the augmented SceneMap
expectTypeOf(game.scenes.go).toBeCallableWith("Game", { data: { level: 3 } });
expectTypeOf(game.scenes.go).toBeCallableWith("Menu");

// @ts-expect-error unknown scene key is rejected
game.scenes.go("Gmae");

// @ts-expect-error wrong data shape is rejected
game.scenes.go("Game", { data: { lvl: 3 } });
