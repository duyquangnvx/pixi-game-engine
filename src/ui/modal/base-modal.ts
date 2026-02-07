import * as PIXI from 'pixi.js';
import gsap from 'gsap';
import { Game } from '../../core/game';
import { Signal } from '../../core/signal';

export type ModalAnimation = 'fade' | 'scale' | 'slide' | 'none';
export type CloseButtonPosition = 'top-right' | 'top-left';

export interface BaseModalConfig {
    /** Modal width in pixels */
    width?: number;
    /** Modal height in pixels */
    height?: number;
    /** Show backdrop behind modal */
    backdrop?: boolean;
    /** Backdrop opacity (0-1) */
    backdropAlpha?: number;
    /** Close modal when clicking backdrop */
    closeOnBackdrop?: boolean;
    /** Show close button */
    closeButton?: boolean;
    /** Close button position */
    closeButtonPosition?: CloseButtonPosition;
    /** Enable dragging the modal */
    draggable?: boolean;
    /** Center modal on screen */
    centered?: boolean;
    /** Animation type */
    animation?: ModalAnimation;
    /** Animation duration in seconds */
    animationDuration?: number;
    /** Background color */
    backgroundColor?: number;
    /** Border color */
    borderColor?: number;
    /** Border width */
    borderWidth?: number;
    /** Border radius */
    borderRadius?: number;
}

export interface ModalButtonConfig {
    text: string;
    width?: number;
    height?: number;
    backgroundColor?: number;
    hoverColor?: number;
    textColor?: number;
    fontSize?: number;
    borderRadius?: number;
    onClick?: () => void;
}

const DEFAULT_CONFIG: Required<BaseModalConfig> = {
    width: 400,
    height: 300,
    backdrop: true,
    backdropAlpha: 0.6,
    closeOnBackdrop: true,
    closeButton: true,
    closeButtonPosition: 'top-right',
    draggable: false,
    centered: true,
    animation: 'scale',
    animationDuration: 0.3,
    backgroundColor: 0x1a1a2e,
    borderColor: 0x333355,
    borderWidth: 2,
    borderRadius: 12,
};

const CLOSE_BTN_SIZE = 28;
const CLOSE_BTN_MARGIN = 8;
const TEXT_COLOR = 0xffffff;

/**
 * Base modal class providing backdrop, close button, animations, and dragging.
 * Extend this class and build your content in onShow or constructor.
 * Uses Game.instance singleton for screen dimensions - no need to pass them.
 */
export class BaseModal<TData = void> extends PIXI.Container {
    protected backdrop!: PIXI.Graphics;
    protected modalContainer!: PIXI.Container;
    protected background!: PIXI.Graphics;
    protected closeBtn: PIXI.Container | null = null;
    protected contentContainer!: PIXI.Container;
    protected config: Required<BaseModalConfig>;
    protected data!: TData;

    private isDragging = false;
    private dragOffset = { x: 0, y: 0 };
    private _isVisible = false;
    private resizeBinding: { detach: () => void } | null = null;

    /** Signal emitted when modal finishes hiding */
    public readonly didHide = new Signal<void>();
    /** Signal emitted when modal is shown (with data) */
    public readonly didShow = new Signal<TData>();

    /** Get screen width from Game singleton */
    protected get screenWidth(): number {
        return Game.instance.screen.width;
    }

    /** Get screen height from Game singleton */
    protected get screenHeight(): number {
        return Game.instance.screen.height;
    }

    constructor(config?: BaseModalConfig) {
        super();
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.setup();

        // Auto-resize when game resizes
        this.resizeBinding = Game.instance.onResize.add(() => {
            this.drawBackdrop();
            if (this.config.centered) {
                this.centerModal();
            }
        });
    }

    private setup(): void {
        // Create backdrop
        this.backdrop = new PIXI.Graphics();
        this.drawBackdrop();
        this.backdrop.eventMode = 'static';
        if (this.config.closeOnBackdrop) {
            this.backdrop.on('pointerdown', () => this.hide());
        }
        this.addChild(this.backdrop);

        // Create modal container (for dragging and positioning)
        this.modalContainer = new PIXI.Container();
        this.addChild(this.modalContainer);

        // Create background
        this.background = new PIXI.Graphics();
        this.drawBackground();
        this.background.eventMode = 'static'; // Block clicks through
        this.modalContainer.addChild(this.background);

        // Create content container for subclass to use
        this.contentContainer = new PIXI.Container();
        this.modalContainer.addChild(this.contentContainer);

        // Create close button
        if (this.config.closeButton) {
            this.createCloseButton();
        }

        // Setup draggable
        if (this.config.draggable) {
            this.setupDraggable();
        }

        // Center modal
        if (this.config.centered) {
            this.centerModal();
        }

        // Start hidden
        this.visible = false;
        this.alpha = 0;
    }

    /** Show the modal with animation */
    public async show(data?: TData): Promise<void> {
        if (this._isVisible) return;

        if (data !== undefined) {
            this.data = data;
        }

        this._isVisible = true;
        this.visible = true;
        this.onShow(this.data);
        await this.animateIn();
        this.didShow.emit(this.data);
    }

    /** Hide the modal with animation */
    public async hide(): Promise<void> {
        if (!this._isVisible) return;
        this._isVisible = false;
        await this.animateOut();
        this.visible = false;
        this.onHide();
        this.didHide.emit();
    }

    /** Called when modal is shown. Override to build content. */
    protected onShow(_data: TData): void {}

    /** Called when modal is hidden. Override to cleanup. */
    protected onHide(): void {}

    /** Check if modal is currently visible */
    public get isModalVisible(): boolean {
        return this._isVisible;
    }

    /** Redraw background with new dimensions */
    protected redrawBackground(width?: number, height?: number): void {
        if (width !== undefined) this.config.width = width;
        if (height !== undefined) this.config.height = height;
        this.drawBackground();
        if (this.config.centered) {
            this.centerModal();
        }
        // Reposition close button
        if (this.closeBtn) {
            if (this.config.closeButtonPosition === 'top-right') {
                this.closeBtn.x = this.config.width - CLOSE_BTN_SIZE - CLOSE_BTN_MARGIN;
            }
        }
    }

    /** Utility: Create a styled title text */
    protected createTitle(text: string, style?: Partial<PIXI.ITextStyle>): PIXI.Text {
        return new PIXI.Text(text, {
            fontFamily: 'Arial',
            fontSize: 24,
            fontWeight: 'bold',
            fill: TEXT_COLOR,
            ...style,
        });
    }

    /** Utility: Create a styled button */
    protected createButton(btnConfig: ModalButtonConfig): PIXI.Container {
        const {
            text,
            width = 120,
            height = 40,
            backgroundColor = 0x444466,
            hoverColor = 0x555577,
            textColor = TEXT_COLOR,
            fontSize = 14,
            borderRadius = 6,
            onClick,
        } = btnConfig;

        const container = new PIXI.Container();
        const bg = new PIXI.Graphics();
        bg.beginFill(backgroundColor);
        bg.drawRoundedRect(0, 0, width, height, borderRadius);
        bg.endFill();

        const label = new PIXI.Text(text, {
            fontFamily: 'Arial',
            fontSize,
            fontWeight: 'bold',
            fill: textColor,
        });
        label.anchor.set(0.5);
        label.x = width / 2;
        label.y = height / 2;

        container.addChild(bg, label);
        container.eventMode = 'static';
        container.cursor = 'pointer';

        container.on('pointerover', () => {
            gsap.to(bg, { pixi: { tint: hoverColor }, duration: 0.15 });
        });
        container.on('pointerout', () => {
            gsap.to(bg, { pixi: { tint: 0xffffff }, duration: 0.15 });
        });
        if (onClick) {
            container.on('pointerdown', onClick);
        }

        return container;
    }

    private drawBackdrop(): void {
        this.backdrop.clear();
        if (this.config.backdrop) {
            // Use fullscreen bounds to cover entire viewport including letterbox areas
            const bounds = Game.instance.getFullscreenBounds();
            this.backdrop.beginFill(0x000000, this.config.backdropAlpha);
            this.backdrop.drawRect(bounds.x, bounds.y, bounds.width, bounds.height);
            this.backdrop.endFill();
        }
    }

    private drawBackground(): void {
        const { width, height, backgroundColor, borderColor, borderWidth, borderRadius } =
            this.config;

        this.background.clear();
        if (borderWidth > 0) {
            this.background.lineStyle(borderWidth, borderColor);
        }
        this.background.beginFill(backgroundColor);
        this.background.drawRoundedRect(0, 0, width, height, borderRadius);
        this.background.endFill();
    }

    private createCloseButton(): void {
        this.closeBtn = new PIXI.Container();

        const bg = new PIXI.Graphics();
        bg.beginFill(0xef4444);
        bg.drawRoundedRect(0, 0, CLOSE_BTN_SIZE, CLOSE_BTN_SIZE, 6);
        bg.endFill();

        const xText = new PIXI.Text('✕', {
            fontFamily: 'Arial',
            fontSize: 16,
            fontWeight: 'bold',
            fill: TEXT_COLOR,
        });
        xText.anchor.set(0.5);
        xText.x = CLOSE_BTN_SIZE / 2;
        xText.y = CLOSE_BTN_SIZE / 2;

        this.closeBtn.addChild(bg, xText);

        if (this.config.closeButtonPosition === 'top-right') {
            this.closeBtn.x = this.config.width - CLOSE_BTN_SIZE - CLOSE_BTN_MARGIN;
            this.closeBtn.y = CLOSE_BTN_MARGIN;
        } else {
            this.closeBtn.x = CLOSE_BTN_MARGIN;
            this.closeBtn.y = CLOSE_BTN_MARGIN;
        }

        this.closeBtn.eventMode = 'static';
        this.closeBtn.cursor = 'pointer';

        this.closeBtn.on('pointerover', () => {
            gsap.to(bg, { pixi: { tint: 0xff6666 }, duration: 0.15 });
        });
        this.closeBtn.on('pointerout', () => {
            gsap.to(bg, { pixi: { tint: 0xffffff }, duration: 0.15 });
        });
        this.closeBtn.on('pointerdown', () => this.hide());

        this.modalContainer.addChild(this.closeBtn);
    }

    private setupDraggable(): void {
        this.background.cursor = 'move';

        this.background.on('pointerdown', (e: PIXI.FederatedPointerEvent) => {
            this.isDragging = true;
            this.dragOffset.x = e.global.x - this.modalContainer.x;
            this.dragOffset.y = e.global.y - this.modalContainer.y;
        });

        this.background.on('globalpointermove', (e: PIXI.FederatedPointerEvent) => {
            if (!this.isDragging) return;
            let newX = e.global.x - this.dragOffset.x;
            let newY = e.global.y - this.dragOffset.y;
            newX = Math.max(0, Math.min(newX, this.screenWidth - this.config.width));
            newY = Math.max(0, Math.min(newY, this.screenHeight - this.config.height));
            this.modalContainer.x = newX;
            this.modalContainer.y = newY;
        });

        this.background.on('pointerup', () => (this.isDragging = false));
        this.background.on('pointerupoutside', () => (this.isDragging = false));
    }

    private centerModal(): void {
        this.modalContainer.x = (this.screenWidth - this.config.width) / 2;
        this.modalContainer.y = (this.screenHeight - this.config.height) / 2;
    }

    private async animateIn(): Promise<void> {
        const { animation, animationDuration } = this.config;

        if (animation === 'none') {
            this.alpha = 1;
            this.modalContainer.scale.set(1);
            return;
        }

        this.backdrop.alpha = 0;
        gsap.to(this.backdrop, { alpha: 1, duration: animationDuration * 0.7 });

        return new Promise((resolve) => {
            if (animation === 'fade') {
                this.modalContainer.alpha = 0;
                this.modalContainer.scale.set(1);
                this.alpha = 1;
                gsap.to(this.modalContainer, {
                    alpha: 1,
                    duration: animationDuration,
                    ease: 'power2.out',
                    onComplete: resolve,
                });
            } else if (animation === 'scale') {
                this.modalContainer.alpha = 0;
                this.modalContainer.scale.set(0.9);
                this.alpha = 1;
                gsap.to(this.modalContainer, {
                    alpha: 1,
                    pixi: { scale: 1 },
                    duration: animationDuration,
                    ease: 'back.out(1.5)',
                    onComplete: resolve,
                });
            } else if (animation === 'slide') {
                const startY = this.modalContainer.y - 50;
                this.modalContainer.alpha = 0;
                this.modalContainer.y = startY;
                this.modalContainer.scale.set(1);
                this.alpha = 1;
                const targetY = (this.screenHeight - this.config.height) / 2;
                gsap.to(this.modalContainer, {
                    alpha: 1,
                    y: targetY,
                    duration: animationDuration,
                    ease: 'power2.out',
                    onComplete: resolve,
                });
            } else {
                this.alpha = 1;
                resolve();
            }
        });
    }

    private async animateOut(): Promise<void> {
        const { animation, animationDuration } = this.config;

        if (animation === 'none') {
            this.alpha = 0;
            return;
        }

        gsap.to(this.backdrop, { alpha: 0, duration: animationDuration * 0.7 });

        return new Promise((resolve) => {
            if (animation === 'fade') {
                gsap.to(this.modalContainer, {
                    alpha: 0,
                    duration: animationDuration * 0.7,
                    ease: 'power2.in',
                    onComplete: resolve,
                });
            } else if (animation === 'scale') {
                gsap.to(this.modalContainer, {
                    alpha: 0,
                    pixi: { scale: 0.9 },
                    duration: animationDuration * 0.7,
                    ease: 'power2.in',
                    onComplete: resolve,
                });
            } else if (animation === 'slide') {
                gsap.to(this.modalContainer, {
                    alpha: 0,
                    y: this.modalContainer.y - 50,
                    duration: animationDuration * 0.7,
                    ease: 'power2.in',
                    onComplete: resolve,
                });
            } else {
                this.alpha = 0;
                resolve();
            }
        });
    }

    public destroy(options?: PIXI.IDestroyOptions | boolean): void {
        this.resizeBinding?.detach();
        this.resizeBinding = null;
        gsap.killTweensOf(this.backdrop);
        gsap.killTweensOf(this.modalContainer);
        this.didHide.clear();
        this.didShow.clear();
        super.destroy(options);
    }
}
