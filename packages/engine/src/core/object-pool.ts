import { eventBus } from './event-bus';

/**
 * Generic object pool for reusing game objects.
 * Prevents GC pauses by pre-allocating and recycling.
 *
 * @example
 * const bulletPool = new ObjectPool('bullets', () => new Bullet(scene));
 * bulletPool.prewarm(50);
 *
 * const bullet = bulletPool.acquire();
 * // ... use bullet
 * bulletPool.release(bullet);
 */
export class ObjectPool<T extends { active: boolean }> {
  private pool: T[] = [];
  private activeSet = new Set<T>();
  private readonly factory: () => T;
  private readonly resetFn?: (obj: T) => void;

  /** Pool identifier for debugging */
  readonly name: string;

  /** Max pool size (0 = unlimited) */
  maxSize: number;

  constructor(
    name: string,
    factory: () => T,
    options?: {
      maxSize?: number;
      reset?: (obj: T) => void;
    }
  ) {
    this.name = name;
    this.factory = factory;
    this.maxSize = options?.maxSize ?? 0;
    this.resetFn = options?.reset;
  }

  /**
   * Pre-allocate objects to avoid runtime allocations.
   */
  prewarm(count: number): void {
    for (let i = 0; i < count; i++) {
      const obj = this.factory();
      obj.active = false;
      this.pool.push(obj);
    }
  }

  /**
   * Get an object from the pool or create new if empty.
   */
  acquire(): T {
    let obj = this.pool.pop();

    if (!obj) {
      // Pool exhausted - create new or reject
      if (this.maxSize > 0 && this.activeSet.size >= this.maxSize) {
        eventBus.emit('pool:exhausted', this.name);
        throw new Error(`Pool "${this.name}" exhausted (max: ${this.maxSize})`);
      }

      obj = this.factory();

      if (this.activeSet.size > 0 && this.activeSet.size % 100 === 0) {
        eventBus.emit('pool:expanded', this.name, this.activeSet.size);
      }
    }

    obj.active = true;
    this.activeSet.add(obj);
    return obj;
  }

  /**
   * Return object to pool for reuse.
   */
  release(obj: T): void {
    if (!this.activeSet.has(obj)) {
      console.warn(`Object not from pool "${this.name}"`);
      return;
    }

    obj.active = false;
    this.activeSet.delete(obj);

    // Reset object state if reset function provided
    if (this.resetFn) {
      this.resetFn(obj);
    }

    this.pool.push(obj);
  }

  /**
   * Release all active objects back to pool.
   */
  releaseAll(): void {
    for (const obj of this.activeSet) {
      obj.active = false;
      if (this.resetFn) {
        this.resetFn(obj);
      }
      this.pool.push(obj);
    }
    this.activeSet.clear();
  }

  /** Number of available objects in pool */
  get available(): number {
    return this.pool.length;
  }

  /** Number of currently active objects */
  get activeCount(): number {
    return this.activeSet.size;
  }

  /** Total objects managed (available + active) */
  get totalSize(): number {
    return this.pool.length + this.activeSet.size;
  }
}
