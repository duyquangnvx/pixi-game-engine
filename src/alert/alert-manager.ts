import * as PIXI from 'pixi.js';
import gsap from 'gsap';
import { BaseModal, type BaseModalConfig } from '../modal/base-modal';

export type AlertType = 'info' | 'success' | 'warning' | 'error' | 'confirm';

export interface AlertButton {
    text: string;
    value: unknown;
    primary?: boolean;
}

export interface AlertConfig {
    title?: string;
    message: string;
    type?: AlertType;
    buttons?: AlertButton[];
}

const ALERT_COLORS: Record<AlertType, { accent: number; icon: string }> = {
    info: { accent: 0x3b82f6, icon: 'ℹ' },
    success: { accent: 0x22c55e, icon: '✓' },
    warning: { accent: 0xf59e0b, icon: '⚠' },
    error: { accent: 0xef4444, icon: '✕' },
    confirm: { accent: 0x8b5cf6, icon: '?' },
};

const MODAL_BG = 0x1a1a2e;
const TEXT_COLOR = 0xffffff;
const TEXT_SECONDARY = 0xaaaaaa;
const BUTTON_DEFAULT = 0x444466;
const BUTTON_HOVER = 0x555577;

interface AlertData {
    config: AlertConfig;
    resolve: (value: unknown) => void;
}

/** Alert modal that builds content in onShow */
class AlertModal extends BaseModal<AlertData> {
    constructor() {
        const modalConfig: BaseModalConfig = {
            width: 360,
            height: 200,
            backdrop: true,
            backdropAlpha: 0.6,
            closeOnBackdrop: false,
            closeButton: false,
            centered: true,
            animation: 'scale',
            animationDuration: 0.3,
            backgroundColor: MODAL_BG,
            borderColor: 0x333355,
            borderWidth: 2,
            borderRadius: 12,
        };
        super(modalConfig);
    }

    protected override onShow(data: AlertData): void {
        const { config } = data;
        const type = config.type ?? 'info';
        const colors = ALERT_COLORS[type];
        const buttons = config.buttons ?? [{ text: 'OK', value: undefined, primary: true }];
        const modalWidth = this.config.width;

        // Clear previous content
        this.contentContainer.removeChildren();

        let yPos = 24;

        // Icon
        const icon = new PIXI.Text(colors.icon, {
            fontFamily: 'Arial',
            fontSize: 32,
            fill: colors.accent,
        });
        icon.anchor.set(0.5);
        icon.x = modalWidth / 2;
        icon.y = yPos + 20;
        this.contentContainer.addChild(icon);
        yPos += 50;

        // Title
        if (config.title) {
            const title = new PIXI.Text(config.title, {
                fontFamily: 'Arial',
                fontSize: 20,
                fontWeight: 'bold',
                fill: TEXT_COLOR,
            });
            title.anchor.set(0.5, 0);
            title.x = modalWidth / 2;
            title.y = yPos;
            this.contentContainer.addChild(title);
            yPos += title.height + 12;
        }

        // Message
        const message = new PIXI.Text(config.message, {
            fontFamily: 'Arial',
            fontSize: 16,
            fill: TEXT_SECONDARY,
            wordWrap: true,
            wordWrapWidth: modalWidth - 48,
            align: 'center',
        });
        message.anchor.set(0.5, 0);
        message.x = modalWidth / 2;
        message.y = yPos;
        this.contentContainer.addChild(message);
        yPos += message.height + 24;

        // Buttons
        const buttonHeight = 40;
        const buttonSpacing = 12;
        const buttonAreaWidth = modalWidth - 48;
        const buttonWidth =
            buttons.length > 1
                ? (buttonAreaWidth - buttonSpacing * (buttons.length - 1)) / buttons.length
                : buttonAreaWidth;

        let buttonX = 24;
        for (const btn of buttons) {
            const buttonContainer = this.createAlertButton(
                btn.text,
                buttonWidth,
                buttonHeight,
                btn.primary ? colors.accent : BUTTON_DEFAULT,
                () => this.closeWithValue(btn.value)
            );
            buttonContainer.x = buttonX;
            buttonContainer.y = yPos;
            this.contentContainer.addChild(buttonContainer);
            buttonX += buttonWidth + buttonSpacing;
        }
        yPos += buttonHeight + 24;

        // Redraw background with accent and new height
        this.redrawBackgroundWithAccent(yPos, colors.accent);
    }

    private redrawBackgroundWithAccent(height: number, accentColor: number): void {
        const { width, backgroundColor, borderColor, borderWidth, borderRadius } = this.config;
        this.config.height = height;

        this.background.clear();
        if (borderWidth > 0) {
            this.background.lineStyle(borderWidth, borderColor);
        }
        this.background.beginFill(backgroundColor);
        this.background.drawRoundedRect(0, 0, width, height, borderRadius);
        this.background.endFill();

        // Accent bar at top
        this.background.beginFill(accentColor);
        this.background.drawRoundedRect(0, 0, width, 16, borderRadius);
        this.background.endFill();
        this.background.beginFill(backgroundColor);
        this.background.drawRect(0, 4, width, 12);
        this.background.endFill();

        // Re-center
        this.modalContainer.x = (this.screenWidth - width) / 2;
        this.modalContainer.y = (this.screenHeight - height) / 2;
    }

    private createAlertButton(
        text: string,
        width: number,
        height: number,
        color: number,
        onClick: () => void
    ): PIXI.Container {
        const container = new PIXI.Container();
        const bg = new PIXI.Graphics();
        bg.beginFill(color);
        bg.drawRoundedRect(0, 0, width, height, 6);
        bg.endFill();

        const label = new PIXI.Text(text, {
            fontFamily: 'Arial',
            fontSize: 14,
            fontWeight: 'bold',
            fill: TEXT_COLOR,
        });
        label.anchor.set(0.5);
        label.x = width / 2;
        label.y = height / 2;

        container.addChild(bg, label);
        container.eventMode = 'static';
        container.cursor = 'pointer';

        container.on('pointerover', () => {
            gsap.to(bg, { pixi: { tint: BUTTON_HOVER }, duration: 0.15 });
        });
        container.on('pointerout', () => {
            gsap.to(bg, { pixi: { tint: 0xffffff }, duration: 0.15 });
        });
        container.on('pointerdown', onClick);

        return container;
    }

    private closeWithValue(value: unknown): void {
        const resolve = this.data?.resolve;
        this.hide().then(() => resolve?.(value));
    }

    public forceResolve(value: unknown): void {
        this.data?.resolve?.(value);
    }
}

export class AlertManager {
    private layer: PIXI.Container;
    private modal: AlertModal;
    private queue: Array<{ config: AlertConfig; resolve: (value: unknown) => void }> = [];
    private isShowing = false;

    constructor(stage: PIXI.Container) {
        this.layer = new PIXI.Container();
        this.layer.sortableChildren = true;
        this.layer.zIndex = 10000;
        stage.addChild(this.layer);

        // Single reusable modal instance
        this.modal = new AlertModal();
        this.layer.addChild(this.modal);
    }

    public info(message: string, title?: string): Promise<void> {
        return this.showAlert({ message, title, type: 'info' }) as Promise<void>;
    }

    public success(message: string, title?: string): Promise<void> {
        return this.showAlert({ message, title, type: 'success' }) as Promise<void>;
    }

    public warning(message: string, title?: string): Promise<void> {
        return this.showAlert({ message, title, type: 'warning' }) as Promise<void>;
    }

    public error(message: string, title?: string): Promise<void> {
        return this.showAlert({ message, title, type: 'error' }) as Promise<void>;
    }

    public confirm(message: string, title?: string): Promise<boolean> {
        return this.showAlert({
            message,
            title: title ?? 'Confirm',
            type: 'confirm',
            buttons: [
                { text: 'Cancel', value: false },
                { text: 'OK', value: true, primary: true },
            ],
        }) as Promise<boolean>;
    }

    public custom<T>(config: AlertConfig): Promise<T> {
        return this.showAlert(config) as Promise<T>;
    }

    private showAlert(config: AlertConfig): Promise<unknown> {
        return new Promise((resolve) => {
            if (this.isShowing) {
                this.queue.push({ config, resolve });
                return;
            }
            this.displayAlert(config, resolve);
        });
    }

    private displayAlert(config: AlertConfig, resolve: (value: unknown) => void): void {
        this.isShowing = true;

        const wrappedResolve = (value: unknown) => {
            this.isShowing = false;
            resolve(value);

            // Process queue
            if (this.queue.length > 0) {
                const next = this.queue.shift()!;
                this.displayAlert(next.config, next.resolve);
            }
        };

        this.modal.show({ config, resolve: wrappedResolve });
    }

    public destroy(): void {
        if (this.isShowing) {
            this.modal.forceResolve(undefined);
        }
        this.queue = [];
        this.layer.destroy();
    }
}
