/**
 * Manages localStorage with JSON serialization and namespacing.
 *
 * @example
 * const storage = new StorageManager('myGame');
 *
 * // Save data
 * storage.save('playerData', { level: 5, coins: 100 });
 *
 * // Load data
 * const data = storage.load<{ level: number; coins: number }>('playerData');
 *
 * // With default value
 * const settings = storage.load('settings', { volume: 1, difficulty: 'normal' });
 */
export class StorageManager {
  private prefix: string;
  private storage: Storage | null;

  /**
   * @param namespace Prefix for all keys to avoid collisions
   */
  constructor(namespace = 'pge') {
    this.prefix = namespace ? `${namespace}_` : '';
    this.storage = this.getStorage();
  }

  private getStorage(): Storage | null {
    try {
      // Test localStorage availability
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return localStorage;
    } catch {
      console.warn('localStorage not available, using memory fallback');
      return null;
    }
  }

  private memoryStorage = new Map<string, string>();

  private getItem(key: string): string | null {
    if (this.storage) {
      return this.storage.getItem(key);
    }
    return this.memoryStorage.get(key) ?? null;
  }

  private setItem(key: string, value: string): void {
    if (this.storage) {
      this.storage.setItem(key, value);
    } else {
      this.memoryStorage.set(key, value);
    }
  }

  private removeItem(key: string): void {
    if (this.storage) {
      this.storage.removeItem(key);
    } else {
      this.memoryStorage.delete(key);
    }
  }

  /**
   * Save value to storage.
   */
  save<T>(key: string, value: T): void {
    const fullKey = this.prefix + key;
    try {
      const json = JSON.stringify(value);
      this.setItem(fullKey, json);
    } catch (error) {
      console.error(`Failed to save "${key}":`, error);
    }
  }

  /**
   * Load value from storage.
   * @returns Stored value or defaultValue if not found
   */
  load<T>(key: string, defaultValue?: T): T | undefined {
    const fullKey = this.prefix + key;
    try {
      const json = this.getItem(fullKey);
      if (json === null) {
        return defaultValue;
      }
      return JSON.parse(json) as T;
    } catch (error) {
      console.error(`Failed to load "${key}":`, error);
      return defaultValue;
    }
  }

  /**
   * Check if key exists in storage.
   */
  has(key: string): boolean {
    const fullKey = this.prefix + key;
    return this.getItem(fullKey) !== null;
  }

  /**
   * Delete specific key from storage.
   */
  delete(key: string): void {
    const fullKey = this.prefix + key;
    this.removeItem(fullKey);
  }

  /**
   * Clear all data in this namespace.
   */
  clear(): void {
    if (this.storage) {
      const keysToRemove: string[] = [];

      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i);
        if (key?.startsWith(this.prefix)) {
          keysToRemove.push(key);
        }
      }

      for (const key of keysToRemove) {
        this.storage.removeItem(key);
      }
    } else {
      for (const key of this.memoryStorage.keys()) {
        if (key.startsWith(this.prefix)) {
          this.memoryStorage.delete(key);
        }
      }
    }
  }

  /**
   * Get all keys in this namespace.
   */
  keys(): string[] {
    const result: string[] = [];
    const prefixLen = this.prefix.length;

    if (this.storage) {
      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i);
        if (key?.startsWith(this.prefix)) {
          result.push(key.slice(prefixLen));
        }
      }
    } else {
      for (const key of this.memoryStorage.keys()) {
        if (key.startsWith(this.prefix)) {
          result.push(key.slice(prefixLen));
        }
      }
    }

    return result;
  }

  /**
   * Check if localStorage is available.
   */
  get isAvailable(): boolean {
    return this.storage !== null;
  }
}
