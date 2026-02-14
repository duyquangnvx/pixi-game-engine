import { type Sound, sound, type IMediaInstance } from '@pixi/sound';
import { Logger } from '../utils/logger';

export interface SoundOptions {
    volume?: number;
    loop?: boolean;
    speed?: number;
    /** Fade in duration in seconds */
    fadeIn?: number;
}

export interface MusicOptions extends SoundOptions {
    /** Crossfade duration when switching tracks (seconds) */
    crossfadeDuration?: number;
}

type VolumeChannel = 'master' | 'music' | 'sfx';

const STORAGE_KEY = 'sound_settings';

export class SoundManager {
    private volumes: Record<VolumeChannel, number> = {
        master: 1,
        music: 1,
        sfx: 1,
    };

    private _muted = false;
    private currentMusic: Sound | null = null;
    private currentMusicAlias: string | null = null;
    private currentMusicInstance: IMediaInstance | null = null;

    /** Track active SFX instances for pause/resume/stop */
    private activeSfx = new Map<string, Set<IMediaInstance>>();

    /** Whether the AudioContext has been unlocked by user interaction */
    private _unlocked = false;

    constructor() {
        this.loadSettings();
        this.setupUnlockListener();
    }

    // ─── AudioContext unlock ──────────────────────────────

    /** 
     * Browsers block audio until first user interaction.
     * Call this early or let the auto-listener handle it. 
     */
    private setupUnlockListener(): void {
        const unlock = () => {
            if (this._unlocked) return;
            const ctx = sound.context;
            if (ctx.audioContext.state === 'suspended') {
                ctx.audioContext.resume().then(() => {
                    this._unlocked = true;
                    Logger.info('SoundManager', 'AudioContext unlocked');
                });
            } else {
                this._unlocked = true;
            }
            // Keep listeners until actually unlocked
            if (this._unlocked) {
                document.removeEventListener('pointerdown', unlock);
                document.removeEventListener('keydown', unlock);
            }
        };
        document.addEventListener('pointerdown', unlock, { once: false });
        document.addEventListener('keydown', unlock, { once: false });
    }

    public get isUnlocked(): boolean {
        return this._unlocked;
    }

    // ─── SFX ─────────────────────────────────────────────

    /** Play a sound effect. Returns instance for fine-grained control. */
    public playSfx(
        alias: string,
        options: SoundOptions = {}
    ): IMediaInstance | null {
        const snd = sound.find(alias);
        if (!snd) {
            Logger.warn('SoundManager', `Sound "${alias}" not found`);
            return null;
        }

        const effectiveVolume =
            (options.volume ?? 1) * this.volumes.master * this.volumes.sfx;

        const instance = snd.play({
            volume: options.fadeIn ? 0 : effectiveVolume,
            loop: options.loop ?? false,
            speed: options.speed ?? 1,
        }) as IMediaInstance;

        // Track instance
        if (!this.activeSfx.has(alias)) {
            this.activeSfx.set(alias, new Set());
        }
        this.activeSfx.get(alias)!.add(instance);

        instance.on('end', () => {
            this.activeSfx.get(alias)?.delete(instance);
        });

        // Fade in
        if (options.fadeIn && options.fadeIn > 0) {
            this.fadeInstance(instance, 0, effectiveVolume, options.fadeIn);
        }

        return instance;
    }

    /** Stop a specific SFX by alias (all instances) */
    public stopSfx(alias: string, fadeOut?: number): void {
        const instances = this.activeSfx.get(alias);
        if (!instances) return;

        for (const inst of instances) {
            if (fadeOut && fadeOut > 0) {
                this.fadeInstance(inst, inst.volume, 0, fadeOut, () => {
                    inst.stop();
                });
            } else {
                inst.stop();
            }
        }
        this.activeSfx.delete(alias);
    }

    // ─── Music ───────────────────────────────────────────

    /** Play background music with optional crossfade */
    public playMusic(alias: string, options: MusicOptions = {}): void {
        if (this.currentMusicAlias === alias) return;

        const snd = sound.find(alias);
        if (!snd) {
            Logger.warn('SoundManager', `Music "${alias}" not found`);
            return;
        }

        const crossfade = options.crossfadeDuration ?? 0;
        const targetVolume =
            (options.volume ?? 1) * this.volumes.master * this.volumes.music;

        // Fade out old music
        if (this.currentMusicInstance && crossfade > 0) {
            const oldInstance = this.currentMusicInstance;
            this.fadeInstance(oldInstance, oldInstance.volume, 0, crossfade, () => {
                oldInstance.stop();
            });
        } else {
            this.stopMusic();
        }

        // Play new music
        const instance = snd.play({
            volume: crossfade > 0 ? 0 : targetVolume,
            loop: options.loop ?? true,
            speed: options.speed ?? 1,
        }) as IMediaInstance;

        this.currentMusic = snd;
        this.currentMusicAlias = alias;
        this.currentMusicInstance = instance;

        // Fade in new music
        if (crossfade > 0) {
            this.fadeInstance(instance, 0, targetVolume, crossfade);
        }
    }

    public stopMusic(fadeOut?: number): void {
        if (!this.currentMusicInstance) return;

        if (fadeOut && fadeOut > 0) {
            const inst = this.currentMusicInstance;
            this.fadeInstance(inst, inst.volume, 0, fadeOut, () => {
                inst.stop();
            });
        } else {
            this.currentMusicInstance.stop();
        }

        this.currentMusic = null;
        this.currentMusicAlias = null;
        this.currentMusicInstance = null;
    }

    public get currentMusicName(): string | null {
        return this.currentMusicAlias;
    }

    /** Pause only music */
    public pauseMusic(): void {
        this.currentMusicInstance?.set('paused', true);
    }

    /** Resume only music */
    public resumeMusic(): void {
        this.currentMusicInstance?.set('paused', false);
    }

    // ─── Volume ──────────────────────────────────────────

    public setVolume(channel: VolumeChannel, value: number): void {
        this.volumes[channel] = Math.max(0, Math.min(1, value));
        this.applyVolumes();
        this.saveSettings();
    }

    public getVolume(channel: VolumeChannel): number {
        return this.volumes[channel];
    }

    /** Re-apply volume to all active sounds after a channel change */
    private applyVolumes(): void {
        // Music
        if (this.currentMusicInstance) {
            this.currentMusicInstance.volume =
                this.volumes.master * this.volumes.music;
        }
        // SFX — only affects looping sfx meaningfully,
        // one-shot sfx are too short to matter
        for (const instances of this.activeSfx.values()) {
            for (const inst of instances) {
                inst.volume = this.volumes.master * this.volumes.sfx;
            }
        }
    }

    // ─── Mute ────────────────────────────────────────────

    public mute(): void {
        this._muted = true;
        sound.muteAll();
        this.saveSettings();
    }

    public unmute(): void {
        this._muted = false;
        sound.unmuteAll();
        this.saveSettings();
    }

    public toggleMute(): boolean {
        if (this._muted) this.unmute();
        else this.mute();
        return this._muted;
    }

    public get isMuted(): boolean {
        return this._muted;
    }

    // ─── Global controls ─────────────────────────────────

    public stopAll(): void {
        sound.stopAll();
        this.currentMusic = null;
        this.currentMusicAlias = null;
        this.currentMusicInstance = null;
        this.activeSfx.clear();
    }

    public pauseAll(): void {
        sound.pauseAll();
    }

    public resumeAll(): void {
        sound.resumeAll();
    }

    // ─── Persistence ─────────────────────────────────────

    private saveSettings(): void {
        try {
            const data = {
                volumes: this.volumes,
                muted: this._muted,
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch {
            // localStorage may be unavailable
        }
    }

    private loadSettings(): void {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return;
            const data = JSON.parse(raw);
            if (data.volumes) {
                this.volumes.master = data.volumes.master ?? 1;
                this.volumes.music = data.volumes.music ?? 1;
                this.volumes.sfx = data.volumes.sfx ?? 1;
            }
            if (data.muted) {
                this._muted = true;
                sound.muteAll();
            }
        } catch {
            // ignore corrupt data
        }
    }

    // ─── Fade utility ────────────────────────────────────

    private fadeInstance(
        instance: IMediaInstance,
        from: number,
        to: number,
        duration: number,
        onComplete?: () => void
    ): void {
        const steps = 30; // ~30 updates over duration
        const interval = (duration * 1000) / steps;
        const delta = (to - from) / steps;
        let step = 0;

        const timer = setInterval(() => {
            step++;
            instance.volume = from + delta * step;
            if (step >= steps) {
                clearInterval(timer);
                instance.volume = to;
                onComplete?.();
            }
        }, interval);
    }

    // ─── Cleanup ─────────────────────────────────────────

    public destroy(): void {
        this.stopAll();
        document.removeEventListener('pointerdown', this.setupUnlockListener);
        document.removeEventListener('keydown', this.setupUnlockListener);
    }
}