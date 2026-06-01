import { createContext, useContext, type ReactNode } from "react";
import type { Game } from "../game";

const GameContext = createContext<Game | null>(null);

export function GameProvider({ game, children }: { game: Game; children: ReactNode }): ReactNode {
  return <GameContext.Provider value={game}>{children}</GameContext.Provider>;
}

export function useGame(): Game {
  const game = useContext(GameContext);
  if (!game) throw new Error("useGame must be used within <GameProvider>");
  return game;
}
