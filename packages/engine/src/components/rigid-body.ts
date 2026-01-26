import Phaser from 'phaser';
import { Component } from '../game-objects/component';
import { Collider } from './collider';

/**
 * Configuration for RigidBody component.
 */
export interface RigidBodyConfig {
  /** Mass (affects collision response) */
  mass?: number;
  /** Linear drag (0-1) */
  drag?: number;
  /** Angular drag */
  angularDrag?: number;
  /** Bounciness (0-1) */
  bounce?: number;
  /** Gravity scale (0 = no gravity) */
  gravityScale?: number;
  /** Fixed rotation (no angular velocity) */
  fixedRotation?: boolean;
  /** Maximum velocity */
  maxVelocity?: { x: number; y: number };
}

/**
 * Component for physics-based movement.
 * Requires Collider component on same GameObject.
 *
 * @example
 * player.addComponent(new Collider({ width: 32, height: 48 }));
 * const rb = player.addComponent(new RigidBody({ gravityScale: 1 }));
 * rb.velocity.x = 100;
 */
export class RigidBody extends Component {
  private collider: Collider | null = null;
  private config: Required<RigidBodyConfig>;

  priority = 80; // After Collider but before movement logic

  constructor(config: RigidBodyConfig = {}) {
    super();
    this.config = {
      mass: config.mass ?? 1,
      drag: config.drag ?? 0,
      angularDrag: config.angularDrag ?? 0,
      bounce: config.bounce ?? 0,
      gravityScale: config.gravityScale ?? 1,
      fixedRotation: config.fixedRotation ?? false,
      maxVelocity: config.maxVelocity ?? { x: 1000, y: 1000 },
    };
  }

  onAttach(): void {
    this.collider = this.owner.getComponent(Collider);
    if (!this.collider) {
      console.warn(`RigidBody requires Collider on ${this.owner.id}`);
      return;
    }

    this.applyConfig();
  }

  private applyConfig(): void {
    const body = this.collider?.getBody();
    if (!body) return;

    body.setMass(this.config.mass);
    body.setDrag(this.config.drag, this.config.drag);
    body.setAngularDrag(this.config.angularDrag);
    body.setBounce(this.config.bounce, this.config.bounce);
    body.setGravityY(this.scene.physics.world.gravity.y * this.config.gravityScale);
    body.setMaxVelocity(this.config.maxVelocity.x, this.config.maxVelocity.y);

    if (this.config.fixedRotation) {
      body.setAllowRotation(false);
    }
  }

  /** Get underlying physics body */
  private get body(): Phaser.Physics.Arcade.Body | null {
    return this.collider?.getBody() ?? null;
  }

  /** Current velocity */
  get velocity(): Phaser.Math.Vector2 {
    return this.body?.velocity ?? new Phaser.Math.Vector2();
  }

  /** Set velocity directly */
  setVelocity(x: number, y: number): void {
    this.body?.setVelocity(x, y);
  }

  /** Set horizontal velocity */
  setVelocityX(x: number): void {
    this.body?.setVelocityX(x);
  }

  /** Set vertical velocity */
  setVelocityY(y: number): void {
    this.body?.setVelocityY(y);
  }

  /** Apply instant force (impulse) */
  applyImpulse(x: number, y: number): void {
    if (this.body) {
      this.body.velocity.x += x;
      this.body.velocity.y += y;
    }
  }

  /** Apply continuous force */
  applyForce(x: number, y: number): void {
    if (this.body) {
      this.body.setAcceleration(x, y);
    }
  }

  /** Stop all movement */
  stop(): void {
    this.body?.setVelocity(0, 0);
    this.body?.setAcceleration(0, 0);
  }

  /** Check if touching ground (for platformers) */
  get isGrounded(): boolean {
    return this.body?.blocked.down ?? false;
  }

  /** Check if touching ceiling */
  get isTouchingCeiling(): boolean {
    return this.body?.blocked.up ?? false;
  }

  /** Check if touching wall on left */
  get isTouchingLeft(): boolean {
    return this.body?.blocked.left ?? false;
  }

  /** Check if touching wall on right */
  get isTouchingRight(): boolean {
    return this.body?.blocked.right ?? false;
  }

  /** Make this body immovable (static) */
  set isStatic(value: boolean) {
    this.body?.setImmovable(value);
  }

  get isStatic(): boolean {
    return this.body?.immovable ?? false;
  }

  /** Set gravity scale (0 = ignore gravity) */
  set gravityScale(value: number) {
    this.config.gravityScale = value;
    if (this.body) {
      this.body.setGravityY(this.scene.physics.world.gravity.y * value);
    }
  }

  get gravityScale(): number {
    return this.config.gravityScale;
  }

  /** Set mass */
  set mass(value: number) {
    this.config.mass = value;
    this.body?.setMass(value);
  }

  get mass(): number {
    return this.config.mass;
  }

  /** Set bounce (0-1) */
  set bounce(value: number) {
    this.config.bounce = value;
    this.body?.setBounce(value, value);
  }

  get bounce(): number {
    return this.config.bounce;
  }

  /** Set drag */
  set drag(value: number) {
    this.config.drag = value;
    this.body?.setDrag(value, value);
  }

  get drag(): number {
    return this.config.drag;
  }
}
