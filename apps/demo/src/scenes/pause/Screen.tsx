import { useGame } from "@studio/react";
import type { ReactNode } from "react";

export function PauseScreen(): ReactNode {
  const game = useGame();
  return (
    <div className="modal">
      <div className="panel">
        <h2>Paused</h2>
        <button onClick={() => game.bridge.dispatch({ type: "scene:pop" })}>Resume</button>
        <button onClick={() => game.bridge.dispatch({ type: "scene:go", key: "Menu" })}>Quit to Menu</button>
      </div>
    </div>
  );
}
