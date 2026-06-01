import { BaseScene, hotReplaceScene } from "@studio/pixi";

export class BootScene extends BaseScene {
  static override key = "Boot";
}

if (import.meta.hot) {
  import.meta.hot.accept();
  hotReplaceScene(BootScene);
}
