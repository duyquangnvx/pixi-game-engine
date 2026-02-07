import gsap from 'gsap';
import { PixiPlugin } from 'gsap/PixiPlugin';
import * as PIXI from 'pixi.js';

// Register PixiPlugin
gsap.registerPlugin(PixiPlugin);
PixiPlugin.registerPIXI(PIXI);

export interface TweenConfig {
    duration?: number;
    delay?: number;
    ease?: string;
    repeat?: number;
    yoyo?: boolean;
    onComplete?: () => void;
    onUpdate?: () => void;
    [key: string]: unknown;
}

export class TweenManager {
    private tweens: Set<gsap.core.Tween> = new Set();

    /** Animate target to new values */
    public to(target: object, config: TweenConfig): gsap.core.Tween {
        const tween = gsap.to(target, {
            duration: config.duration ?? 0.5,
            delay: config.delay ?? 0,
            ease: config.ease ?? 'power2.out',
            repeat: config.repeat ?? 0,
            yoyo: config.yoyo ?? false,
            onUpdate: config.onUpdate,
            onComplete: () => {
                this.tweens.delete(tween);
                config.onComplete?.();
            },
            ...this.extractProps(config),
        });

        this.tweens.add(tween);
        return tween;
    }

    /** Animate target from values */
    public from(target: object, config: TweenConfig): gsap.core.Tween {
        const tween = gsap.from(target, {
            duration: config.duration ?? 0.5,
            delay: config.delay ?? 0,
            ease: config.ease ?? 'power2.out',
            repeat: config.repeat ?? 0,
            yoyo: config.yoyo ?? false,
            onUpdate: config.onUpdate,
            onComplete: () => {
                this.tweens.delete(tween);
                config.onComplete?.();
            },
            ...this.extractProps(config),
        });

        this.tweens.add(tween);
        return tween;
    }

    /** Animate from one set of values to another */
    public fromTo(target: object, fromConfig: TweenConfig, toConfig: TweenConfig): gsap.core.Tween {
        const tween = gsap.fromTo(target, this.extractProps(fromConfig), {
            duration: toConfig.duration ?? 0.5,
            delay: toConfig.delay ?? 0,
            ease: toConfig.ease ?? 'power2.out',
            repeat: toConfig.repeat ?? 0,
            yoyo: toConfig.yoyo ?? false,
            onUpdate: toConfig.onUpdate,
            onComplete: () => {
                this.tweens.delete(tween);
                toConfig.onComplete?.();
            },
            ...this.extractProps(toConfig),
        });

        this.tweens.add(tween);
        return tween;
    }

    /** Create a timeline */
    public timeline(config?: gsap.TimelineVars): gsap.core.Timeline {
        return gsap.timeline(config);
    }

    /** Kill a specific tween */
    public kill(tween: gsap.core.Tween): void {
        tween.kill();
        this.tweens.delete(tween);
    }

    /** Kill all tweens for a target */
    public killTweensOf(target: object): void {
        gsap.killTweensOf(target);
    }

    /** Kill all managed tweens */
    public killAll(): void {
        for (const tween of this.tweens) {
            tween.kill();
        }
        this.tweens.clear();
    }

    private extractProps(config: TweenConfig): Record<string, unknown> {
        const reserved = ['duration', 'delay', 'ease', 'repeat', 'yoyo', 'onComplete', 'onUpdate'];
        return Object.fromEntries(
            Object.entries(config).filter(([key]) => !reserved.includes(key))
        );
    }

    /** Get number of active tweens */
    public get count(): number {
        return this.tweens.size;
    }

    /** Clean up */
    public destroy(): void {
        this.killAll();
    }
}
