import * as PIXI from 'pixi.js';
// Import pixi-spine to register its asset loaders with PIXI.Assets
// Main bundle includes Spine 3.7, 3.8, and 4.0 runtimes
import 'pixi-spine';
import { type ISkeletonData, Spine, type IAnimationStateListener } from 'pixi-spine';

// pixi-spine ITrackEntry omits `animation` but the runtime exposes it
interface TrackEntryWithAnimation {
    animation?: { name: string };
}

export class SpineManager {
    /** Create a Spine animation from loaded skeleton data */
    public create(alias: string): Spine {
        const resource = PIXI.Assets.get(alias);
        if (!resource) {
            throw new Error(`Spine skeleton "${alias}" not found. Make sure it's loaded.`);
        }

        // pixi-spine loader returns { spineData: ISkeletonData } wrapper
        const skeletonData = (resource as any).spineData || resource;
        return new Spine(skeletonData);
    }

    /** Create a Spine animation from skeleton data directly */
    public fromData(skeletonData: ISkeletonData): Spine {
        return new Spine(skeletonData);
    }

    /** Play an animation on a Spine instance.
     *  By default skips if the same animation is already playing (avoids restart).
     *  Pass `force: true` to restart from frame 0. */
    public play(
        spine: Spine,
        animationName: string,
        loop: boolean = true,
        trackIndex: number = 0,
        options?: { force?: boolean }
    ): void {
        if (!options?.force) {
            const current = spine.state.tracks[trackIndex] as TrackEntryWithAnimation | null;
            if (current?.animation?.name === animationName) return;
        }
        spine.state.setAnimation(trackIndex, animationName, loop);
    }

    /** Play a non-looping animation and resolve when it completes. */
    public playOnce(
        spine: Spine,
        animationName: string,
        trackIndex: number = 0
    ): Promise<void> {
        return new Promise<void>((resolve) => {
            spine.state.setAnimation(trackIndex, animationName, false);
            const listener: IAnimationStateListener = {
                complete: (entry) => {
                    const track = entry as TrackEntryWithAnimation;
                    if (track.animation?.name === animationName) {
                        spine.state.removeListener(listener);
                        resolve();
                    }
                },
            };
            spine.state.addListener(listener);
        });
    }

    /** Add an animation to the queue */
    public queue(
        spine: Spine,
        animationName: string,
        loop: boolean = false,
        delay: number = 0,
        trackIndex: number = 0
    ): void {
        spine.state.addAnimation(trackIndex, animationName, loop, delay);
    }

    /** Set animation mix duration */
    public setMix(
        spine: Spine,
        fromAnimation: string,
        toAnimation: string,
        duration: number
    ): void {
        spine.stateData.setMix(fromAnimation, toAnimation, duration);
    }

    /** Get available animation names */
    public getAnimations(spine: Spine): string[] {
        return spine.skeleton.data.animations.map((a) => a.name);
    }

    /** Get available skin names */
    public getSkins(spine: Spine): string[] {
        return spine.skeleton.data.skins.map((s) => s.name);
    }

    /** Set skin by name */
    public setSkin(spine: Spine, skinName: string): void {
        spine.skeleton.setSkinByName(skinName);
        spine.skeleton.setSlotsToSetupPose();
    }

    /** Pause spine animation */
    public pause(spine: Spine): void {
        spine.state.timeScale = 0;
    }

    /** Resume spine animation */
    public resume(spine: Spine): void {
        spine.state.timeScale = 1;
    }

    /** Set animation speed */
    public setSpeed(spine: Spine, speed: number): void {
        spine.state.timeScale = speed;
    }

    /** Clear tracks, remove listeners, and destroy the spine instance. */
    public destroy(spine: Spine): void {
        spine.state.clearTracks();
        spine.state.clearListeners();
        spine.destroy({ children: true });
    }
}
