/**
 * Configuration for a single animation.
 */
export interface AnimationConfig {
  /** Unique animation key */
  key: string;
  /** Texture key in Phaser cache */
  textureKey: string;
  /** Frame names or indices */
  frames: (string | number)[];
  /** Frames per second */
  frameRate?: number;
  /** Loop count (-1 = infinite) */
  repeat?: number;
  /** Delay between frame in ms (alternative to frameRate) */
  delay?: number;
}

/**
 * Animation state machine transition config.
 */
export interface AnimationTransition {
  /** Source state (or '*' for any) */
  from: string | '*';
  /** Target state */
  to: string;
  /** Condition function */
  condition?: () => boolean;
}

/**
 * Events emitted by Animator.
 */
export interface AnimatorEvents {
  /** Fired when animation starts */
  animationStart: (key: string) => void;
  /** Fired when animation completes (non-looping) */
  animationComplete: (key: string) => void;
  /** Fired when specific frame is reached */
  animationFrame: (key: string, frame: number) => void;
}
