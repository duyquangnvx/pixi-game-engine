import { useGame } from "@studio/react";
import type { ReactNode } from "react";

export function MenuScreen(): ReactNode {
  const game = useGame();
  return (
    <div className="center">
      <div className="panel">
        <h1>My Game</h1>
        <div style={{ display: "flex", gap: 8 }}>
          {[1, 2, 3].map((level) => (
            <button key={level} onClick={() => game.bridge.dispatch({ type: "scene:go", key: "Game", level })}>
              Play L{level}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
