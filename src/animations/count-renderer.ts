/**
 * Count Renderer Interface
 *
 * Strategy pattern for rendering animated count values.
 * Implementations can render to PIXI.Text, Spine, Sprites, etc.
 */
import type * as PIXI from 'pixi.js';

/**
 * Interface for rendering count animation values
 */
export interface ICountRenderer {
	/** Update the displayed value */
	setValue(value: string): void;

	/** Get the display object for positioning */
	getDisplayObject(): PIXI.Container;

	/** Optional: Set text/fill color */
	setColor?(color: number): void;

	/** Optional: Set scale */
	setScale?(scaleX: number, scaleY?: number): void;
}

/**
 * Animation preset configuration
 */
export interface CountPreset {
	/** Animation duration in milliseconds */
	duration: number;
	/** GSAP easing string */
	easing: string;
}

/**
 * Configuration for CountAnimator
 */
export interface CountAnimatorConfig {
	/** Value formatter (e.g., currency formatting) */
	formatter?: (value: number) => string;
	/** Animation duration in milliseconds (overrides preset) */
	duration?: number;
	/** GSAP easing string (overrides preset) */
	easing?: string;
	/** Preset name to use */
	preset?: string;
	/** Progress callback (progress: 0-1, value: current interpolated value) */
	onProgress?: (progress: number, value: number) => void;
	/** Completion callback */
	onComplete?: () => void;
}
