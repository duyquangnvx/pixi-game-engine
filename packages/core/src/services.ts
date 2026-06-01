export interface ServiceKey<T> {
  readonly id: string;
  readonly __type?: T; // phantom — carries T for inference, never assigned
}

export class ServiceRegistry {
  private readonly services = new Map<string, unknown>();

  register<T>(key: ServiceKey<T>, value: T): void {
    this.services.set(key.id, value);
  }

  get<T>(key: ServiceKey<T>): T {
    if (!this.services.has(key.id)) {
      throw new Error(`Service "${key.id}" is not registered`);
    }
    const value = this.services.get(key.id);
    return value as T; // safe: only register<T> writes this key, validated by has()
  }
}
