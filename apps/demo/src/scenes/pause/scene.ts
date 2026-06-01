import { BaseScene, hotReplaceScene } from "@studio/pixi";
import { PauseScreen } from "./Screen";

export class PauseScene extends BaseScene {
  static override key = "Pause";
  static override Screen = PauseScreen;
}

if (import.meta.hot) {
  import.meta.hot.accept();
  hotReplaceScene(PauseScene);
}
