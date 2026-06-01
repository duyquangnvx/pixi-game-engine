import { useGame } from "@studio/react";
import type { ReactNode } from "react";
import { GameScene } from "../game/scene";

export function MenuScreen(): ReactNode {
  const game = useGame();

  const play = async (level: number): Promise<void> => {
    const scene = await game.bridge.invoke("scene:go", { key: "Game", level });
    if (scene instanceof GameScene) scene.flashHero();
  };

  return (
    <div className="center">
      <div className="panel">
        <h1>My Game</h1>
        <div style={{ display: "flex", gap: 8 }}>
          {[1, 2, 3].map((level) => (
            <button key={level} onClick={() => void play(level)}>
              Play L{level}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
