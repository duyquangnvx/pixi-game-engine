import { describe, expect, it } from "vitest";
import { ServiceRegistry, type ServiceKey } from "./services";

interface Audio {
  play(name: string): void;
}
const AUDIO: ServiceKey<Audio> = { id: "audio" };

describe("ServiceRegistry", () => {
  it("registers and resolves a service by typed key", () => {
    const registry = new ServiceRegistry();
    const audio: Audio = { play: () => undefined };
    registry.register(AUDIO, audio);
    expect(registry.get(AUDIO)).toBe(audio);
  });

  it("throws a clear error when a key is missing", () => {
    const registry = new ServiceRegistry();
    expect(() => registry.get(AUDIO)).toThrowError(/audio/);
  });
});
