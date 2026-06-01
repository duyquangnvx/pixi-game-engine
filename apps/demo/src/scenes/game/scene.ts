import { Graphics } from "pixi.js";
import { BaseScene, hotReplaceScene } from "@studio/pixi";
import { GameHud } from "./Hud";

export class GameScene extends BaseScene {
  static override key = "Game";
  static override Screen = GameHud;

  private hero: Graphics | null = null;

  override onCreate(): void {
    const hero = this.spawn(new Graphics().circle(0, 0, 40).fill(0xe74c3c));
    hero.position.set(640, 360);
    this.hero = hero;

    this.input.onDown("jump", () => this.hero?.scale.set(1.4));
    this.input.onUp("jump", () => this.hero?.scale.set(1));
    this.input.onTap("warp", (e) => {
      if (e.designX !== undefined && e.designY !== undefined) this.hero?.position.set(e.designX, e.designY);
    });

    this.interval(1000, () => {
      this.store.setState((s) => ({ ...s, hud: { ...s.hud, coins: s.hud.coins + 1 } }));
    });
  }

  override onUpdate(dt: number): void {
    if (!this.hero) return;
    const { x, y } = this.input.axis("move");
    this.hero.x += x * 6 * dt;
    this.hero.y += y * 6 * dt;
  }
}

if (import.meta.hot) {
  import.meta.hot.accept();
  hotReplaceScene(GameScene);
}
