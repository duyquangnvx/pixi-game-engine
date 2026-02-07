import { Emitter, type EmitterConfigV3 } from '@pixi/particle-emitter';
import * as PIXI from 'pixi.js';

export interface ParticleConfig extends Partial<EmitterConfigV3> {
    textures: string[];
}

export class ParticleManager {
    private emitters: Set<Emitter> = new Set();

    /** Create a particle emitter */
    public create(container: PIXI.Container, config: ParticleConfig): Emitter {
        // Convert texture aliases to PIXI textures
        const textures = config.textures.map((alias) => PIXI.Assets.get<PIXI.Texture>(alias));

        const emitterConfig: EmitterConfigV3 = {
            lifetime: config.lifetime ?? { min: 0.5, max: 1 },
            frequency: config.frequency ?? 0.01,
            emitterLifetime: config.emitterLifetime ?? -1,
            maxParticles: config.maxParticles ?? 100,
            addAtBack: config.addAtBack ?? false,
            pos: config.pos ?? { x: 0, y: 0 },
            behaviors: config.behaviors ?? [
                {
                    type: 'alpha',
                    config: {
                        alpha: {
                            list: [
                                { time: 0, value: 1 },
                                { time: 1, value: 0 },
                            ],
                        },
                    },
                },
                {
                    type: 'scale',
                    config: {
                        scale: {
                            list: [
                                { time: 0, value: 1 },
                                { time: 1, value: 0.5 },
                            ],
                        },
                    },
                },
                {
                    type: 'moveSpeed',
                    config: {
                        speed: {
                            list: [
                                { time: 0, value: 200 },
                                { time: 1, value: 100 },
                            ],
                        },
                    },
                },
                {
                    type: 'rotationStatic',
                    config: { min: 0, max: 360 },
                },
                {
                    type: 'spawnShape',
                    config: { type: 'torus', data: { x: 0, y: 0, radius: 10 } },
                },
                {
                    type: 'textureSingle',
                    config: { texture: textures[0] },
                },
            ],
        };

        const emitter = new Emitter(container, emitterConfig);
        this.emitters.add(emitter);

        return emitter;
    }

    /** Update all emitters */
    public update(delta: number): void {
        const dt = delta / 60; // Convert to seconds
        for (const emitter of this.emitters) {
            emitter.update(dt);
        }
    }

    /** Remove an emitter */
    public remove(emitter: Emitter): void {
        emitter.destroy();
        this.emitters.delete(emitter);
    }

    /** Remove all emitters */
    public removeAll(): void {
        for (const emitter of this.emitters) {
            emitter.destroy();
        }
        this.emitters.clear();
    }

    /** Get number of active emitters */
    public get count(): number {
        return this.emitters.size;
    }

    /** Clean up */
    public destroy(): void {
        this.removeAll();
    }
}
