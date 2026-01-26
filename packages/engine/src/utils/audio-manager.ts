import Phaser from 'phaser';

/**
 * Configuration for playing audio.
 */
export interface AudioConfig {
  volume?: number;
  loop?: boolean;
  delay?: number;
}

/**
 * Manages music and sound effects with separate volume controls.
 *
 * @example
 * const audio = new AudioManager(scene);
 * audio.playMusic('bgm', { volume: 0.5, loop: true });
 * audio.playSfx('explosion');
 * audio.setMusicVolume(0.3);
 */
export class AudioManager {
  private scene: Phaser.Scene;
  private currentMusic: Phaser.Sound.BaseSound | null = null;
  private musicKey: string | null = null;

  private _musicVolume = 1;
  private _sfxVolume = 1;
  private _muted = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    scene.events.once('shutdown', this.destroy, this);
  }

  /**
   * Play background music.
   * Stops any currently playing music.
   */
  playMusic(key: string, config?: AudioConfig): Phaser.Sound.BaseSound | null {
    // Don't restart if same music is playing
    if (this.musicKey === key && this.currentMusic?.isPlaying) {
      return this.currentMusic;
    }

    this.stopMusic();

    const volume = (config?.volume ?? 1) * this._musicVolume;
    const loop = config?.loop ?? true;

    this.currentMusic = this.scene.sound.add(key, {
      volume: this._muted ? 0 : volume,
      loop,
      delay: config?.delay,
    });

    this.musicKey = key;
    this.currentMusic.play();

    return this.currentMusic;
  }

  /**
   * Stop current music with optional fade.
   */
  stopMusic(fadeMs = 0): void {
    if (!this.currentMusic) return;

    if (fadeMs > 0 && 'setVolume' in this.currentMusic) {
      // Fade out then stop
      this.scene.tweens.add({
        targets: this.currentMusic,
        volume: 0,
        duration: fadeMs,
        onComplete: () => {
          this.currentMusic?.stop();
          this.currentMusic = null;
          this.musicKey = null;
        },
      });
    } else {
      this.currentMusic.stop();
      this.currentMusic = null;
      this.musicKey = null;
    }
  }

  /**
   * Pause current music.
   */
  pauseMusic(): void {
    this.currentMusic?.pause();
  }

  /**
   * Resume paused music.
   */
  resumeMusic(): void {
    this.currentMusic?.resume();
  }

  /**
   * Play sound effect (fire and forget).
   */
  playSfx(key: string, config?: AudioConfig): Phaser.Sound.BaseSound {
    const volume = (config?.volume ?? 1) * this._sfxVolume;

    const sfx = this.scene.sound.add(key, {
      volume: this._muted ? 0 : volume,
      loop: config?.loop ?? false,
      delay: config?.delay,
    });

    sfx.play();

    // Auto cleanup when complete
    sfx.once('complete', () => {
      sfx.destroy();
    });

    return sfx;
  }

  /**
   * Set music volume (0-1).
   */
  setMusicVolume(volume: number): void {
    this._musicVolume = Phaser.Math.Clamp(volume, 0, 1);

    if (this.currentMusic && 'setVolume' in this.currentMusic && !this._muted) {
      (this.currentMusic as Phaser.Sound.WebAudioSound).setVolume(this._musicVolume);
    }
  }

  /**
   * Set SFX volume (0-1).
   */
  setSfxVolume(volume: number): void {
    this._sfxVolume = Phaser.Math.Clamp(volume, 0, 1);
  }

  /**
   * Get current music volume.
   */
  get musicVolume(): number {
    return this._musicVolume;
  }

  /**
   * Get current SFX volume.
   */
  get sfxVolume(): number {
    return this._sfxVolume;
  }

  /**
   * Mute all audio.
   */
  mute(): void {
    this._muted = true;
    this.scene.sound.mute = true;
  }

  /**
   * Unmute all audio.
   */
  unmute(): void {
    this._muted = false;
    this.scene.sound.mute = false;
  }

  /**
   * Toggle mute state.
   */
  toggleMute(): boolean {
    if (this._muted) {
      this.unmute();
    } else {
      this.mute();
    }
    return this._muted;
  }

  /**
   * Check if audio is muted.
   */
  get isMuted(): boolean {
    return this._muted;
  }

  /**
   * Check if music is currently playing.
   */
  get isMusicPlaying(): boolean {
    return this.currentMusic?.isPlaying ?? false;
  }

  /**
   * Get current music key.
   */
  get currentMusicKey(): string | null {
    return this.musicKey;
  }

  private destroy(): void {
    this.stopMusic();
  }
}
