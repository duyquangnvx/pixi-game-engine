import Phaser from 'phaser';
import type { TransitionConfig, TransitionType } from '../types/scene.types';

/**
 * Default transition configurations.
 */
export const DEFAULT_TRANSITIONS: Record<TransitionType, TransitionConfig> = {
  none: { type: 'none', duration: 0 },
  fade: { type: 'fade', duration: 500, color: 0x000000 },
  'slide-left': { type: 'slide-left', duration: 400, ease: 'Power2' },
  'slide-right': { type: 'slide-right', duration: 400, ease: 'Power2' },
  'slide-up': { type: 'slide-up', duration: 400, ease: 'Power2' },
  'slide-down': { type: 'slide-down', duration: 400, ease: 'Power2' },
};

/**
 * Execute scene transition effect.
 * Returns promise that resolves when transition completes.
 */
export function executeTransition(
  scene: Phaser.Scene,
  config: TransitionConfig,
  direction: 'in' | 'out'
): Promise<void> {
  const { type, duration = 500, ease = 'Power2', color = 0x000000 } = config;

  if (type === 'none' || duration === 0) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const { width, height } = scene.cameras.main;

    switch (type) {
      case 'fade':
        executeFade(scene, duration, color, direction, resolve);
        break;

      case 'slide-left':
        executeSlide(scene, duration, ease, direction, width, 0, resolve);
        break;

      case 'slide-right':
        executeSlide(scene, duration, ease, direction, -width, 0, resolve);
        break;

      case 'slide-up':
        executeSlide(scene, duration, ease, direction, 0, height, resolve);
        break;

      case 'slide-down':
        executeSlide(scene, duration, ease, direction, 0, -height, resolve);
        break;

      default:
        resolve();
    }
  });
}

function executeFade(
  scene: Phaser.Scene,
  duration: number,
  color: number,
  direction: 'in' | 'out',
  onComplete: () => void
): void {
  const camera = scene.cameras.main;

  if (direction === 'out') {
    camera.fadeOut(duration, (color >> 16) & 0xff, (color >> 8) & 0xff, color & 0xff);
  } else {
    camera.fadeIn(duration, (color >> 16) & 0xff, (color >> 8) & 0xff, color & 0xff);
  }

  camera.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, onComplete);
  camera.once(Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE, onComplete);
}

function executeSlide(
  scene: Phaser.Scene,
  duration: number,
  ease: string,
  direction: 'in' | 'out',
  targetX: number,
  targetY: number,
  onComplete: () => void
): void {
  const camera = scene.cameras.main;

  if (direction === 'out') {
    // Slide out: move camera scroll to push scene off
    scene.tweens.add({
      targets: camera,
      scrollX: camera.scrollX - targetX,
      scrollY: camera.scrollY - targetY,
      duration,
      ease,
      onComplete,
    });
  } else {
    // Slide in: start off-screen and slide to center
    camera.scrollX -= targetX;
    camera.scrollY -= targetY;

    scene.tweens.add({
      targets: camera,
      scrollX: 0,
      scrollY: 0,
      duration,
      ease,
      onComplete,
    });
  }
}

/**
 * Create custom transition config.
 */
export function createTransition(type: TransitionType, overrides?: Partial<TransitionConfig>): TransitionConfig {
  return { ...DEFAULT_TRANSITIONS[type], ...overrides };
}
