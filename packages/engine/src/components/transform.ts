import { Component } from '../game-objects/component';

/**
 * Component for position, rotation, and scale management.
 * Supports parent-child hierarchy with local/world transforms.
 *
 * @example
 * const player = new GameObject(scene, 100, 200);
 * const transform = player.addComponent(new Transform());
 * transform.localRotation = Math.PI / 4;
 */
export class Transform extends Component {
  /** Local position relative to parent */
  localPosition = { x: 0, y: 0 };

  /** Local rotation in radians */
  localRotation = 0;

  /** Local scale */
  localScale = { x: 1, y: 1 };

  /** Parent transform for hierarchy */
  parent: Transform | null = null;

  /** Child transforms */
  private children: Transform[] = [];

  priority = 100; // High priority - update transform first

  onAttach(): void {
    // Sync initial position from owner
    this.localPosition.x = this.owner.x;
    this.localPosition.y = this.owner.y;
    this.localRotation = this.owner.rotation;
    this.localScale.x = this.owner.scaleX;
    this.localScale.y = this.owner.scaleY;
  }

  /**
   * World position (computed from parent hierarchy).
   */
  get position(): { x: number; y: number } {
    if (!this.parent) {
      return { x: this.localPosition.x, y: this.localPosition.y };
    }

    const parentPos = this.parent.position;
    const parentRot = this.parent.rotation;
    const parentScale = this.parent.scale;

    // Rotate local position by parent rotation
    const cos = Math.cos(parentRot);
    const sin = Math.sin(parentRot);
    const scaledX = this.localPosition.x * parentScale.x;
    const scaledY = this.localPosition.y * parentScale.y;

    return {
      x: parentPos.x + cos * scaledX - sin * scaledY,
      y: parentPos.y + sin * scaledX + cos * scaledY,
    };
  }

  /**
   * Set world position (converts to local if parent exists).
   */
  set position(value: { x: number; y: number }) {
    if (!this.parent) {
      this.localPosition.x = value.x;
      this.localPosition.y = value.y;
      return;
    }

    const parentPos = this.parent.position;
    const parentRot = this.parent.rotation;
    const parentScale = this.parent.scale;
    const cos = Math.cos(-parentRot);
    const sin = Math.sin(-parentRot);
    const dx = value.x - parentPos.x;
    const dy = value.y - parentPos.y;

    this.localPosition.x = (cos * dx - sin * dy) / parentScale.x;
    this.localPosition.y = (sin * dx + cos * dy) / parentScale.y;
  }

  /**
   * World rotation (accumulated from parent hierarchy).
   */
  get rotation(): number {
    if (!this.parent) {
      return this.localRotation;
    }
    return this.parent.rotation + this.localRotation;
  }

  /**
   * Set world rotation (converts to local if parent exists).
   */
  set rotation(value: number) {
    if (!this.parent) {
      this.localRotation = value;
      return;
    }
    this.localRotation = value - this.parent.rotation;
  }

  /**
   * World scale (multiplied through parent hierarchy).
   */
  get scale(): { x: number; y: number } {
    if (!this.parent) {
      return { x: this.localScale.x, y: this.localScale.y };
    }

    const parentScale = this.parent.scale;
    return {
      x: parentScale.x * this.localScale.x,
      y: parentScale.y * this.localScale.y,
    };
  }

  /**
   * Set parent transform for hierarchy.
   */
  setParent(parent: Transform | null): void {
    // Remove from old parent
    if (this.parent) {
      const idx = this.parent.children.indexOf(this);
      if (idx !== -1) {
        this.parent.children.splice(idx, 1);
      }
    }

    this.parent = parent;

    // Add to new parent
    if (parent) {
      parent.children.push(this);
    }
  }

  /**
   * Get all child transforms.
   */
  getChildren(): readonly Transform[] {
    return this.children;
  }

  update(): void {
    // Sync owner position with world transform
    const pos = this.position;
    this.owner.setPosition(pos.x, pos.y);
    this.owner.setRotation(this.rotation);
    const scale = this.scale;
    this.owner.setScale(scale.x, scale.y);
  }

  onDetach(): void {
    // Remove from parent
    this.setParent(null);

    // Detach all children
    for (const child of [...this.children]) {
      child.setParent(null);
    }
  }
}
