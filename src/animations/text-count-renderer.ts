/**
 * Text Count Renderer
 *
 * ICountRenderer implementation for PIXI.Text objects.
 */
import type * as PIXI from 'pixi.js';
import type { ICountRenderer } from './count-renderer';

/**
 * Renders count animation values to a PIXI.Text object
 */
export class TextCountRenderer implements ICountRenderer {
	private text: PIXI.Text;

	constructor(text: PIXI.Text) {
		this.text = text;
	}

	/**
	 * Update the displayed text value
	 */
	public setValue(value: string): void {
		this.text.text = value;
	}

	/**
	 * Get the PIXI.Text container for positioning
	 */
	public getDisplayObject(): PIXI.Container {
		return this.text;
	}

	/**
	 * Set text fill color
	 */
	public setColor(color: number): void {
		this.text.style.fill = color;
	}

	/**
	 * Set scale
	 */
	public setScale(scaleX: number, scaleY?: number): void {
		this.text.scale.set(scaleX, scaleY ?? scaleX);
	}

	/**
	 * Get the underlying PIXI.Text
	 */
	public getText(): PIXI.Text {
		return this.text;
	}
}
