import { Graphics } from "pixi.js";
import { BaseScene, hotReplaceScene } from "@studio/pixi";
import { GameHud } from "./Hud";

export class GameScene extends BaseScene<{ level?: number }> {
  static override key = "Game";
  static override Screen = GameHud;

  private hero: Graphics | null = null;
  private level = 1;

  override onCreate(data: { level?: number }): void {
    this.level = data.level ?? 1;
    this.store.setState((s) => ({ ...s, hud: { ...s.hud, level: this.level } }));

    const hero = this.spawn(new Graphics().circle(0, 0, 40).fill(0xe74c3c));
    hero.position.set(640, 360);
    this.hero = hero;

    this.input.onDown("jump", () => this.hero?.scale.set(1.4));
    this.input.onUp("jump", () => this.hero?.scale.set(1));
    this.input.onTap("warp", (e) => {
      if (e.designX !== undefined && e.designY !== undefined) this.hero?.position.set(e.designX, e.designY);
    });

    this.interval(1000, () => {
      this.store.setState((s) => ({ ...s, hud: { ...s.hud, coins: s.hud.coins + this.level } }));
    });
  }

  override onUpdate(dt: number): void {
    if (!this.hero) return;
    const { x, y } = this.input.axis("move");
    const speed = 6 + (this.level - 1) * 2;
    this.hero.x += x * speed * dt;
    this.hero.y += y * speed * dt;
  }
}

if (import.meta.hot) {
  import.meta.hot.accept();
  hotReplaceScene(GameScene);
}
