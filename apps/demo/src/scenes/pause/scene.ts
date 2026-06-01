import { BaseScene } from "@studio/core";
import { PauseScreen } from "./Screen";

export class PauseScene extends BaseScene {
  static override key = "Pause";
  static override Screen = PauseScreen;
}
