import Phaser from 'phaser';
import EventEmitter from 'eventemitter3';
import { Component } from '../game-objects/component';
import type { GameObject } from '../game-objects/game-object';

/**
 * Collider shape type.
 */
export type ColliderShape = 'box' | 'circle';

/**
 * Events emitted by Collider.
 */
export interface ColliderEvents {
  /** Fired on collision start */
  collisionEnter: (other: GameObject) => void;
  /** Fired while colliding */
  collisionStay: (other: GameObject) => void;
  /** Fired when collision ends */
  collisionExit: (other: GameObject) => void;
  /** Fired on overlap start (trigger mode) */
  triggerEnter: (other: GameObject) => void;
  /** Fired while overlapping (trigger mode) */
  triggerStay: (other: GameObject) => void;
  /** Fired when overlap ends (trigger mode) */
  triggerExit: (other: GameObject) => void;
}

/**
 * Configuration for Collider component.
 */
export interface ColliderConfig {
  /** Shape type */
  shape?: ColliderShape;
  /** Width for box, diameter for circle */
  width?: number;
  /** Height for box */
  height?: number;
  /** Offset from owner position */
  offset?: { x: number; y: number };
  /** Trigger mode (no physics response) */
  isTrigger?: boolean;
}

/**
 * Component wrapping Arcade Physics body.
 *
 * @example
 * const collider = player.addComponent(new Collider({ width: 32, height: 48 }));
 * collider.events.on('collisionEnter', (other) => console.log('Hit!', other));
 */
export class Collider extends Component {
  /** Registry of all active colliders per scene (by scene key) */
  private static registry = new Map<string, Set<Collider>>();

  private body: Phaser.Physics.Arcade.Body | null = null;
  private config: Required<ColliderConfig>;
  private debugGraphics: Phaser.GameObjects.Graphics | null = null;

  /** Track current frame collisions for enter/stay/exit detection */
  private currentCollisions = new Set<GameObject>();
  private previousCollisions = new Set<GameObject>();

  /** Phaser collider/overlap objects for cleanup */
  private phaserColliders: Phaser.Physics.Arcade.Collider[] = [];

  /** Event emitter for collision events */
  readonly events = new EventEmitter<ColliderEvents>();

  /** Collision groups/layers for filtering */
  collisionGroup = 0;
  collisionMask = 0xffffffff;

  priority = 90; // High priority - before most logic

  constructor(config: ColliderConfig = {}) {
    super();
    this.config = {
      shape: config.shape ?? 'box',
      width: config.width ?? 32,
      height: config.height ?? 32,
      offset: config.offset ?? { x: 0, y: 0 },
      isTrigger: config.isTrigger ?? false,
    };
  }

  onAttach(): void {
    // Enable physics on owner
    this.scene.physics.add.existing(this.owner);
    this.body = this.owner.body as Phaser.Physics.Arcade.Body;

    if (!this.body) {
      console.warn(`Failed to create physics body for ${this.owner.id}`);
      return;
    }

    this.applyConfig();
    this.registerAndSetupCollisions();
  }

  /** Register this collider and set up collision callbacks with existing colliders */
  private registerAndSetupCollisions(): void {
    const sceneKey = this.scene.scene.key;

    // Get or create registry for this scene
    if (!Collider.registry.has(sceneKey)) {
      Collider.registry.set(sceneKey, new Set());
    }
    const sceneColliders = Collider.registry.get(sceneKey)!;

    // Set up collision/overlap with all existing colliders
    for (const other of sceneColliders) {
      if (other === this || !other.body) continue;
      this.setupCollisionPair(other);
    }

    // Register this collider
    sceneColliders.add(this);
  }

  /** Set up collision or overlap between this collider and another */
  private setupCollisionPair(other: Collider): void {
    if (!this.body || !other.body) return;

    const callback: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (obj1, obj2) => {
      // obj1/obj2 can be Body, StaticBody, GameObjectWithBody, or Tile
      // We need the game objects, which are stored in body.gameObject
      const go1 = this.resolveGameObject(obj1);
      const go2 = this.resolveGameObject(obj2);

      if (!go1 || !go2) return;

      // Check collision masks
      if (!this.canCollideWith(other)) return;

      // Track collision for this frame
      this.currentCollisions.add(go2);
      other.currentCollisions.add(go1);
    };

    // Use overlap for triggers, collide for solid bodies
    const useTrigger = this.config.isTrigger || other.config.isTrigger;

    if (useTrigger) {
      const overlap = this.scene.physics.add.overlap(this.owner, other.owner, callback);
      this.phaserColliders.push(overlap);
      other.phaserColliders.push(overlap);
    } else {
      const collider = this.scene.physics.add.collider(this.owner, other.owner, callback);
      this.phaserColliders.push(collider);
      other.phaserColliders.push(collider);
    }
  }

  /** Resolve a Phaser physics object to our GameObject */
  private resolveGameObject(
    obj: Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ): GameObject | null {
    if ('gameObject' in obj && obj.gameObject) {
      return obj.gameObject as GameObject;
    }
    if ('body' in obj) {
      return obj as unknown as GameObject;
    }
    return null;
  }

  private applyConfig(): void {
    if (!this.body) return;

    const { shape, width, height, offset, isTrigger } = this.config;

    if (shape === 'circle') {
      this.body.setCircle(width / 2, offset.x, offset.y);
    } else {
      this.body.setSize(width, height);
      this.body.setOffset(offset.x, offset.y);
    }

    // Triggers don't have physics response
    if (isTrigger) {
      this.body.setImmovable(true);
      // Overlap check handled by RigidBody or manual setup
    }
  }

  /** Get underlying Arcade Physics body */
  getBody(): Phaser.Physics.Arcade.Body | null {
    return this.body;
  }

  /** Update collider size */
  setSize(width: number, height?: number): void {
    this.config.width = width;
    this.config.height = height ?? width;
    if (this.body) {
      if (this.config.shape === 'circle') {
        this.body.setCircle(width / 2);
      } else {
        this.body.setSize(width, this.config.height);
      }
    }
  }

  /** Update collider offset */
  setOffset(x: number, y: number): void {
    this.config.offset = { x, y };
    this.body?.setOffset(x, y);
  }

  /** Enable/disable trigger mode */
  set isTrigger(value: boolean) {
    this.config.isTrigger = value;
    if (this.body) {
      this.body.setImmovable(value);
    }
  }

  get isTrigger(): boolean {
    return this.config.isTrigger;
  }

  /** Check if this collider can collide with another based on masks */
  canCollideWith(other: Collider): boolean {
    return (this.collisionMask & other.collisionGroup) !== 0 && (other.collisionMask & this.collisionGroup) !== 0;
  }

  /** Show debug visualization */
  showDebug(show: boolean): void {
    if (show && !this.debugGraphics) {
      this.debugGraphics = this.scene.add.graphics();
      this.debugGraphics.lineStyle(1, 0x00ff00, 1);
    } else if (!show && this.debugGraphics) {
      this.debugGraphics.destroy();
      this.debugGraphics = null;
    }
  }

  lateUpdate(): void {
    // Process collision state changes and emit events
    this.processCollisionEvents();

    // Update debug visualization
    if (this.debugGraphics && this.body) {
      this.debugGraphics.clear();
      this.debugGraphics.lineStyle(1, 0x00ff00, 0.8);

      if (this.config.shape === 'circle') {
        this.debugGraphics.strokeCircle(this.body.center.x, this.body.center.y, this.config.width / 2);
      } else {
        this.debugGraphics.strokeRect(this.body.x, this.body.y, this.body.width, this.body.height);
      }
    }
  }

  /** Process collision state changes and emit appropriate events */
  private processCollisionEvents(): void {
    const isTrigger = this.config.isTrigger;

    // Check for new collisions (enter)
    for (const other of this.currentCollisions) {
      if (!this.previousCollisions.has(other)) {
        // New collision
        if (isTrigger) {
          this.events.emit('triggerEnter', other);
        } else {
          this.events.emit('collisionEnter', other);
        }
      } else {
        // Ongoing collision (stay)
        if (isTrigger) {
          this.events.emit('triggerStay', other);
        } else {
          this.events.emit('collisionStay', other);
        }
      }
    }

    // Check for ended collisions (exit)
    for (const other of this.previousCollisions) {
      if (!this.currentCollisions.has(other)) {
        if (isTrigger) {
          this.events.emit('triggerExit', other);
        } else {
          this.events.emit('collisionExit', other);
        }
      }
    }

    // Swap buffers for next frame
    this.previousCollisions = new Set(this.currentCollisions);
    this.currentCollisions.clear();
  }

  onDetach(): void {
    // Unregister from scene registry
    const sceneKey = this.scene.scene.key;
    const sceneColliders = Collider.registry.get(sceneKey);
    if (sceneColliders) {
      sceneColliders.delete(this);
      if (sceneColliders.size === 0) {
        Collider.registry.delete(sceneKey);
      }
    }

    // Destroy Phaser colliders
    for (const collider of this.phaserColliders) {
      if (collider.active) {
        collider.destroy();
      }
    }
    this.phaserColliders = [];

    // Clear collision tracking
    this.currentCollisions.clear();
    this.previousCollisions.clear();

    if (this.debugGraphics) {
      this.debugGraphics.destroy();
      this.debugGraphics = null;
    }
    this.events.removeAllListeners();
    // Body cleanup handled by Phaser
  }
}
