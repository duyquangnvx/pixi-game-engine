import { BaseScene } from "@studio/core";
import { MenuScreen } from "./Screen";

export class MenuScene extends BaseScene {
  static override key = "Menu";
  static override Screen = MenuScreen;
}
