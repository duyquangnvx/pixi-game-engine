import { useGame } from "@studio/core";
import type { ReactNode } from "react";

export function MenuScreen(): ReactNode {
  const game = useGame();
  return (
    <div className="center">
      <div className="panel">
        <h1>My Game</h1>
        <button onClick={() => game.bridge.dispatch({ type: "scene:go", key: "Game" })}>Play</button>
      </div>
    </div>
  );
}
