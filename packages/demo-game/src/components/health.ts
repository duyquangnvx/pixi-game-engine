import { Component } from '@pge/core';

/**
 * Health tracking component.
 */
export class HealthComponent extends Component {
  private _health: number;

  constructor(public maxHealth = 100) {
    super();
    this._health = maxHealth;
  }

  get health(): number {
    return this._health;
  }

  onAttach(): void {
    console.log(`[HealthComponent] Attached with ${this.maxHealth} HP`);
  }

  takeDamage(amount: number): void {
    this._health = Math.max(0, this._health - amount);
    console.log(`[HealthComponent] ${this.owner.id} took ${amount} damage, HP: ${this._health}`);

    if (this._health <= 0) {
      console.log(`[HealthComponent] ${this.owner.id} died!`);
      this.owner.destroy();
    }
  }

  heal(amount: number): void {
    this._health = Math.min(this.maxHealth, this._health + amount);
  }
}
