import { type Sound, sound } from '@pixi/sound';
import { Logger } from '../utils/logger';

export interface SoundOptions {
    volume?: number;
    loop?: boolean;
    speed?: number;
}

export class SoundManager {
    private volumes = {
        master: 1,
        music: 1,
        sfx: 1,
    };

    private currentMusic: Sound | null = null;
    private currentMusicAlias: string | null = null;

    public playSfx(alias: string, options: SoundOptions = {}): void {
        this.play(alias, options);
    }

    /** Play a sound effect */
    public play(alias: string, options: SoundOptions = {}): void {
        const snd = sound.find(alias);
        if (!snd) {
            Logger.warn('SoundManager', `Sound "${alias}" not found`);
            return;
        }

        snd.play({
            volume: (options.volume ?? 1) * this.volumes.master * this.volumes.sfx,
            loop: options.loop ?? false,
            speed: options.speed ?? 1,
        });
    }

    /** Play background music (only one at a time) */
    public playMusic(alias: string, options: SoundOptions = {}): void {
        // Stop current music if different
        if (this.currentMusicAlias !== alias) {
            this.stopMusic();
        }

        const snd = sound.find(alias);
        if (!snd) {
            Logger.warn('SoundManager', `Music "${alias}" not found`);
            return;
        }

        this.currentMusic = snd;
        this.currentMusicAlias = alias;

        snd.play({
            volume: (options.volume ?? 1) * this.volumes.master * this.volumes.music,
            loop: options.loop ?? true,
            speed: options.speed ?? 1,
        });
    }

    /** Stop the current music */
    public stopMusic(): void {
        if (this.currentMusic) {
            this.currentMusic.stop();
            this.currentMusic = null;
            this.currentMusicAlias = null;
        }
    }

    /** Stop a specific sound */
    public stop(alias: string): void {
        const snd = sound.find(alias);
        if (snd) {
            snd.stop();
        }
    }

    /** Stop all sounds */
    public stopAll(): void {
        sound.stopAll();
        this.currentMusic = null;
        this.currentMusicAlias = null;
    }

    /** Pause all sounds */
    public pauseAll(): void {
        sound.pauseAll();
    }

    /** Resume all sounds */
    public resumeAll(): void {
        sound.resumeAll();
    }

    /** Set volume for a channel */
    public setVolume(channel: 'master' | 'music' | 'sfx', value: number): void {
        this.volumes[channel] = Math.max(0, Math.min(1, value));
        this.updateMusicVolume();
    }

    /** Get volume for a channel */
    public getVolume(channel: 'master' | 'music' | 'sfx'): number {
        return this.volumes[channel];
    }

    private updateMusicVolume(): void {
        if (this.currentMusic) {
            this.currentMusic.volume = this.volumes.master * this.volumes.music;
        }
    }

    /** Mute all sounds */
    public mute(): void {
        sound.muteAll();
    }

    /** Unmute all sounds */
    public unmute(): void {
        sound.unmuteAll();
    }

    /** Toggle mute */
    public toggleMute(): boolean {
        sound.toggleMuteAll();
        return sound.context.muted;
    }

    /** Check if muted */
    public get isMuted(): boolean {
        return sound.context.muted;
    }

    /** Clean up */
    public destroy(): void {
        this.stopAll();
    }
}
