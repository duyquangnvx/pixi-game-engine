import { BaseScene, hotReplaceScene } from "@studio/core";
import { MenuScreen } from "./Screen";

export class MenuScene extends BaseScene {
  static override key = "Menu";
  static override Screen = MenuScreen;
}

if (import.meta.hot) {
  import.meta.hot.accept();
  hotReplaceScene(MenuScene);
}
