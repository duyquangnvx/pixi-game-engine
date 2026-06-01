import { Graphics } from "pixi.js";
import { BaseScene, hotReplaceScene } from "@studio/core";
import { GameHud } from "./Hud";

export class GameScene extends BaseScene {
  static override key = "Game";
  static override Screen = GameHud;

  private hero: Graphics | null = null;

  override onCreate(): void {
    const hero = this.spawn(new Graphics().circle(0, 0, 40).fill(0xe74c3c));
    hero.position.set(640, 360);
    this.hero = hero;
  }

  override onUpdate(dt: number): void {
    if (!this.hero) return;
    this.hero.x += 0.6 * dt;
    if (this.hero.x > 1320) this.hero.x = -40;
  }
}

if (import.meta.hot) {
  import.meta.hot.accept();
  hotReplaceScene(GameScene);
}
