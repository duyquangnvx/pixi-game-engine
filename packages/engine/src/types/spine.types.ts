/**
 * Spine animation events.
 */
export interface SpineEvents {
  /** Animation started */
  start: (trackIndex: number, animation: string) => void;
  /** Animation completed */
  complete: (trackIndex: number, animation: string) => void;
  /** Custom event from Spine */
  event: (trackIndex: number, event: SpineEvent) => void;
  /** Animation interrupted */
  interrupt: (trackIndex: number) => void;
}

/**
 * Custom event from Spine animation.
 */
export interface SpineEvent {
  name: string;
  intValue: number;
  floatValue: number;
  stringValue: string;
}

/**
 * Configuration for SpineRenderer.
 */
export interface SpineConfig {
  /** Spine skeleton key (registered in Phaser) */
  skeletonKey: string;
  /** Atlas key */
  atlasKey: string;
  /** Initial animation to play */
  initialAnimation?: string;
  /** Loop initial animation */
  loop?: boolean;
  /** Initial skin name */
  skin?: string;
  /** Scale multiplier */
  scale?: number;
}

/**
 * Animation mix configuration.
 */
export interface AnimationMix {
  from: string;
  to: string;
  duration: number;
}
