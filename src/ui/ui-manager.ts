import { type ButtonOptions, FancyButton } from '@pixi/ui';
import * as PIXI from 'pixi.js';

export interface ButtonConfig {
    text?: string;
    textStyle?: Partial<PIXI.TextStyle>;
    defaultView?: PIXI.Container | string;
    hoverView?: PIXI.Container | string;
    pressedView?: PIXI.Container | string;
    disabledView?: PIXI.Container | string;
    padding?: number;
    scale?: number;
    anchor?: number;
    onClick?: () => void;
}

export interface TextConfig {
    text: string;
    style?: Partial<PIXI.TextStyle>;
    x?: number;
    y?: number;
    anchor?: number | { x: number; y: number };
}

export class UIManager {
    /** Create a fancy button */
    public button(config: ButtonConfig): FancyButton {
        const buttonOptions: ButtonOptions = {
            text: new PIXI.Text(config.text ?? '', {
                fontFamily: 'Arial',
                fontSize: 24,
                fill: 0xffffff,
                ...config.textStyle,
            }),
            padding: config.padding ?? 10,
            scale: config.scale ?? 1,
            anchor: config.anchor ?? 0.5,
        };

        // Add views if provided
        if (config.defaultView) {
            buttonOptions.defaultView = this.resolveView(config.defaultView);
        }
        if (config.hoverView) {
            buttonOptions.hoverView = this.resolveView(config.hoverView);
        }
        if (config.pressedView) {
            buttonOptions.pressedView = this.resolveView(config.pressedView);
        }
        if (config.disabledView) {
            buttonOptions.disabledView = this.resolveView(config.disabledView);
        }

        const button = new FancyButton(buttonOptions);

        if (config.onClick) {
            button.onPress.connect(config.onClick);
        }

        return button;
    }

    /** Create a text element */
    public text(config: TextConfig): PIXI.Text {
        const text = new PIXI.Text(config.text, {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0xffffff,
            ...config.style,
        });

        if (config.x !== undefined) text.x = config.x;
        if (config.y !== undefined) text.y = config.y;

        if (config.anchor !== undefined) {
            if (typeof config.anchor === 'number') {
                text.anchor.set(config.anchor);
            } else {
                text.anchor.set(config.anchor.x, config.anchor.y);
            }
        }

        return text;
    }

    /** Create a simple rectangle */
    public rect(
        width: number,
        height: number,
        color: number = 0xffffff,
        radius: number = 0
    ): PIXI.Graphics {
        const graphics = new PIXI.Graphics();
        graphics.beginFill(color);
        if (radius > 0) {
            graphics.drawRoundedRect(0, 0, width, height, radius);
        } else {
            graphics.drawRect(0, 0, width, height);
        }
        graphics.endFill();
        return graphics;
    }

    /** Create a progress bar */
    public progressBar(
        width: number,
        height: number,
        bgColor: number = 0x333333,
        fillColor: number = 0x00ff00
    ): { container: PIXI.Container; setProgress: (value: number) => void } {
        const container = new PIXI.Container();
        const bg = this.rect(width, height, bgColor, 4);
        const fill = this.rect(width - 4, height - 4, fillColor, 2);
        fill.x = 2;
        fill.y = 2;
        fill.scale.x = 0;

        container.addChild(bg, fill);

        return {
            container,
            setProgress: (value: number) => {
                fill.scale.x = Math.max(0, Math.min(1, value));
            },
        };
    }

    private resolveView(view: PIXI.Container | string): PIXI.Container {
        if (typeof view === 'string') {
            // Assume it's a texture alias
            const texture = PIXI.Assets.get<PIXI.Texture>(view);
            if (texture) {
                return new PIXI.Sprite(texture);
            }
            // Fallback to simple rectangle
            return this.rect(100, 40, 0x444444, 8);
        }
        return view;
    }
}
