import { createRoot, type Root } from "react-dom/client";
import { GameProvider } from "./GameProvider";
import { Overlay } from "./Overlay";
import type { Game } from "./game";

export function mountOverlay(uiRoot: HTMLElement, game: Game): Root {
  const root = createRoot(uiRoot);
  root.render(
    <GameProvider game={game}>
      <Overlay />
    </GameProvider>
  );
  return root;
}
