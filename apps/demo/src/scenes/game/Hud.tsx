import { useGame, useStore } from "@studio/core";
import type { ReactNode } from "react";

export function GameHud(): ReactNode {
  const game = useGame();
  const coins = useStore((s) => s.hud.coins);
  return (
    <>
      <div className="hud">Coins: {coins}</div>
      <div style={{ position: "absolute", top: 16, right: 16, display: "flex", gap: 8 }}>
        <button onClick={() => game.bridge.dispatch({ type: "coin:add", amount: 1 })}>+1 Coin</button>
        <button onClick={() => game.bridge.dispatch({ type: "scene:push", key: "Pause" })}>Pause</button>
      </div>
    </>
  );
}
