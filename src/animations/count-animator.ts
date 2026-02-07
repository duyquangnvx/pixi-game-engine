/**
 * Count Animator
 *
 * Core animation controller for count up/down animations.
 * Uses GSAP for consistent timing and easing across the game.
 */
import type { TweenManager } from '../tween/tween-manager';
import type { CountAnimatorConfig, ICountRenderer } from './count-renderer';
import { getCountPreset } from './presets';

/**
 * Unified count animation controller
 *
 * @example
 * ```typescript
 * const renderer = new TextCountRenderer(text);
 * const animator = new CountAnimator(renderer, tweenManager);
 *
 * // Animate to value
 * await animator.animateTo(1000, { preset: 'win' });
 *
 * // Animate from/to
 * await animator.animateFromTo(0, 500, { duration: 1000 });
 *
 * // Instant set
 * animator.setValue(100);
 * ```
 */
export class CountAnimator {
	private renderer: ICountRenderer;
	private tween: TweenManager;
	private currentValue = 0;
	private targetValue = 0;
	private activeTween: gsap.core.Tween | null = null;
	private defaultFormatter: (value: number) => string;

	constructor(
		renderer: ICountRenderer,
		tweenManager: TweenManager,
		defaultFormatter: (value: number) => string = (v) => Math.floor(v).toString()
	) {
		this.renderer = renderer;
		this.tween = tweenManager;
		this.defaultFormatter = defaultFormatter;
		this.renderer.setValue(this.defaultFormatter(0));
	}

	/**
	 * Animate from current value to target
	 */
	public animateTo(target: number, config?: CountAnimatorConfig): Promise<void> {
		return this.animateFromTo(this.currentValue, target, config);
	}

	/**
	 * Animate from one value to another
	 */
	public animateFromTo(from: number, to: number, config?: CountAnimatorConfig): Promise<void> {
		this.stop();

		const preset = getCountPreset(config?.preset ?? 'normal');
		const duration = config?.duration ?? preset.duration;
		const easing = config?.easing ?? preset.easing;
		const formatter = config?.formatter ?? this.defaultFormatter;

		// Instant update if duration is 0
		if (duration === 0) {
			this.currentValue = to;
			this.targetValue = to;
			this.renderer.setValue(formatter(to));
			config?.onComplete?.();
			return Promise.resolve();
		}

		this.currentValue = from;
		this.targetValue = to;
		const range = to - from;

		return new Promise<void>((resolve) => {
			const animTarget = { value: from };

			this.activeTween = this.tween.to(animTarget, {
				value: to,
				duration: duration / 1000,
				ease: easing,
				onUpdate: () => {
					this.currentValue = animTarget.value;
					this.renderer.setValue(formatter(this.currentValue));

					// Calculate progress and fire callback
					if (config?.onProgress && range !== 0) {
						const progress = (this.currentValue - from) / range;
						config.onProgress(progress, this.currentValue);
					}
				},
				onComplete: () => {
					this.activeTween = null;
					this.currentValue = to;
					this.renderer.setValue(formatter(to));
					config?.onComplete?.();
					resolve();
				},
			});
		});
	}

	/**
	 * Set value instantly (no animation)
	 */
	public setValue(value: number, formatter?: (value: number) => string): void {
		this.stop();
		this.currentValue = value;
		this.targetValue = value;
		this.renderer.setValue((formatter ?? this.defaultFormatter)(value));
	}

	/**
	 * Skip animation and show target value immediately
	 */
	public skip(): void {
		if (this.activeTween) {
			const target = this.targetValue;
			this.stop();
			this.currentValue = target;
			this.renderer.setValue(this.defaultFormatter(target));
		}
	}

	/**
	 * Stop animation at current value
	 */
	public stop(): void {
		if (this.activeTween) {
			this.tween.kill(this.activeTween);
			this.activeTween = null;
		}
	}

	/**
	 * Reset to zero
	 */
	public reset(): void {
		this.stop();
		this.currentValue = 0;
		this.targetValue = 0;
		this.renderer.setValue(this.defaultFormatter(0));
	}

	/**
	 * Get current displayed value
	 */
	public get value(): number {
		return this.currentValue;
	}

	/**
	 * Get the target value (may differ during animation)
	 */
	public get target(): number {
		return this.targetValue;
	}

	/**
	 * Check if animation is running
	 */
	public get isAnimating(): boolean {
		return this.activeTween !== null;
	}

	/**
	 * Update the default formatter
	 */
	public setFormatter(formatter: (value: number) => string): void {
		this.defaultFormatter = formatter;
	}

	/**
	 * Get the underlying renderer
	 */
	public getRenderer(): ICountRenderer {
		return this.renderer;
	}
}
