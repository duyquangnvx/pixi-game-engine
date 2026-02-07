/**
 * Count Animation Presets
 *
 * Standardized animation timings for consistent feel across the game.
 */
import type { CountPreset } from './count-renderer';

/**
 * Standard animation presets for count animations
 */
export const COUNT_PRESETS: Record<string, CountPreset> = {
	/** Quick updates (300ms) - UI feedback, small changes */
	fast: {
		duration: 300,
		easing: 'power2.out',
	},

	/** Normal updates (500ms) - Balance changes, bet adjustments */
	normal: {
		duration: 500,
		easing: 'power2.out',
	},

	/** Win displays (1000ms) - Standard win count-up */
	win: {
		duration: 1000,
		easing: 'slow(0.5, 0.8, false)',
	},

	/** Big win celebrations (2000ms) - Dramatic count-up */
	bigWin: {
		duration: 2000,
		easing: 'slow(0.3, 0.9, false)',
	},

	/** Epic win presentations (4000ms) - Maximum drama */
	epicWin: {
		duration: 4000,
		easing: 'slow(0.2, 0.95, false)',
	},

	/** Instant - No animation, immediate update */
	instant: {
		duration: 0,
		easing: 'none',
	},
};

/**
 * Get a preset by name, with fallback to 'normal'
 */
export function getCountPreset(name: string): CountPreset {
	return COUNT_PRESETS[name] ?? COUNT_PRESETS.normal;
}
