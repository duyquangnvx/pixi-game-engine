import * as PIXI from 'pixi.js';
import gsap from 'gsap';
import { Game } from '../core/game';
import type { ToastColorSet, ToastTheme, ToastThemePreset } from './toast-theme';
import { TOAST_PRESETS, getDefaultColors } from './toast-presets';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface ToastConfig {
    /** Toast message */
    message: string;
    /** Toast type for styling */
    type?: ToastType;
    /** Duration in ms before auto-dismiss (0 = no auto-dismiss) */
    duration?: number;
    /** Position on screen */
    position?: 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export interface ToastManagerConfig {
    /** Theme preset name or custom theme object */
    theme?: ToastThemePreset | ToastTheme;
}

interface ToastItem {
    container: PIXI.Container;
    config: Required<ToastConfig>;
    timer?: ReturnType<typeof setTimeout>;
    /** Stored dimensions for repositioning */
    width: number;
    height: number;
    /** Glow graphics for pulse animation */
    glowGraphics?: PIXI.Graphics;
}


/** SVG-style icon paths for each toast type (drawn with PIXI.Graphics) */
const TOAST_ICONS: Record<ToastType, (g: PIXI.Graphics, size: number, color: number) => void> = {
    info: (g, size, color) => {
        const cx = size / 2;
        const cy = size / 2;
        const r = size * 0.4;
        // Circle
        g.lineStyle(2, color, 1);
        g.drawCircle(cx, cy, r);
        // Dot
        g.beginFill(color);
        g.drawCircle(cx, cy - r * 0.35, 2);
        g.endFill();
        // Line
        g.lineStyle(2.5, color, 1);
        g.moveTo(cx, cy - r * 0.05);
        g.lineTo(cx, cy + r * 0.5);
    },
    success: (g, size, color) => {
        const cx = size / 2;
        const cy = size / 2;
        // Checkmark
        g.lineStyle(3, color, 1);
        g.moveTo(cx - size * 0.25, cy);
        g.lineTo(cx - size * 0.05, cy + size * 0.2);
        g.lineTo(cx + size * 0.3, cy - size * 0.2);
    },
    warning: (g, size, color) => {
        const cx = size / 2;
        const cy = size / 2;
        const h = size * 0.75;
        const w = size * 0.8;
        // Triangle
        g.lineStyle(2, color, 1);
        g.moveTo(cx, cy - h * 0.45);
        g.lineTo(cx + w / 2, cy + h * 0.35);
        g.lineTo(cx - w / 2, cy + h * 0.35);
        g.closePath();
        // Exclamation mark
        g.lineStyle(2.5, color, 1);
        g.moveTo(cx, cy - h * 0.15);
        g.lineTo(cx, cy + h * 0.1);
        g.beginFill(color);
        g.drawCircle(cx, cy + h * 0.22, 2);
        g.endFill();
    },
    error: (g, size, color) => {
        const cx = size / 2;
        const cy = size / 2;
        const r = size * 0.3;
        // X mark
        g.lineStyle(3, color, 1);
        g.moveTo(cx - r, cy - r);
        g.lineTo(cx + r, cy + r);
        g.moveTo(cx + r, cy - r);
        g.lineTo(cx - r, cy + r);
    },
};

const DEFAULT_DURATION = 3000;
const TOAST_PADDING_X = 16;
const TOAST_PADDING_Y = 12;
const TOAST_MARGIN = 16;
const TOAST_MIN_HEIGHT = 52;
const MAX_WIDTH = 420;
const ICON_SIZE = 28;
const ICON_MARGIN = 12;

export class ToastManager {
    private layer: PIXI.Container;
    private toasts: ToastItem[] = [];
    private currentColors: Record<ToastType, ToastColorSet>;
    private currentThemeName: string;
    private resizeBinding: { detach: () => void } | null = null;

    /** Get screen width from Game singleton */
    private get screenWidth(): number {
        return Game.instance.screen.width;
    }

    /** Get screen height from Game singleton */
    private get screenHeight(): number {
        return Game.instance.screen.height;
    }

    constructor(stage: PIXI.Container, config?: ToastManagerConfig) {
        // Initialize theme
        if (config?.theme) {
            if (typeof config.theme === 'string') {
                const preset = TOAST_PRESETS[config.theme];
                this.currentColors = preset.colors;
                this.currentThemeName = preset.name;
            } else {
                this.currentColors = config.theme.colors;
                this.currentThemeName = config.theme.name;
            }
        } else {
            this.currentColors = getDefaultColors();
            this.currentThemeName = 'default';
        }

        // Create toast layer on top of everything
        this.layer = new PIXI.Container();
        this.layer.sortableChildren = true;
        this.layer.zIndex = 9999;
        stage.addChild(this.layer);

        // Auto-resize when game resizes
        this.resizeBinding = Game.instance.onResize.add(() => {
            this.repositionToasts();
        });
    }

    /**
     * Set the toast theme
     * @param theme - Theme preset name or custom theme object
     */
    public setTheme(theme: ToastThemePreset | ToastTheme): void {
        if (typeof theme === 'string') {
            const preset = TOAST_PRESETS[theme];
            this.currentColors = preset.colors;
            this.currentThemeName = preset.name;
        } else {
            this.currentColors = theme.colors;
            this.currentThemeName = theme.name;
        }
    }

    /**
     * Get the current theme name
     */
    public getThemeName(): string {
        return this.currentThemeName;
    }

    /** Show a toast notification */
    public show(message: string, options?: Partial<Omit<ToastConfig, 'message'>>): void {
        const config: Required<ToastConfig> = {
            message,
            type: options?.type ?? 'info',
            duration: options?.duration ?? DEFAULT_DURATION,
            position: options?.position ?? 'top',
        };

        const toast = this.createToast(config);
        this.toasts.push(toast);
        this.layer.addChild(toast.container);

        // Position first (sets target position), then animate
        this.repositionToasts();
        this.animateIn(toast);

        // Auto-dismiss
        if (config.duration > 0) {
            toast.timer = setTimeout(() => this.dismiss(toast), config.duration);
        }
    }

    /** Show info toast */
    public info(message: string, duration?: number): void {
        this.show(message, { type: 'info', duration });
    }

    /** Show success toast */
    public success(message: string, duration?: number): void {
        this.show(message, { type: 'success', duration });
    }

    /** Show warning toast */
    public warning(message: string, duration?: number): void {
        this.show(message, { type: 'warning', duration });
    }

    /** Show error toast */
    public error(message: string, duration?: number): void {
        this.show(message, { type: 'error', duration });
    }

    /** Dismiss all toasts */
    public dismissAll(): void {
        for (const toast of [...this.toasts]) {
            this.dismiss(toast);
        }
    }

    private createToast(config: Required<ToastConfig>): ToastItem {
        const container = new PIXI.Container();
        const colors = this.currentColors[config.type];
        const borderRadius = 8;

        // Calculate text area width (accounting for icon)
        const textAreaWidth = MAX_WIDTH - TOAST_PADDING_X * 2 - ICON_SIZE - ICON_MARGIN;

        // Create text with gaming typography
        const text = new PIXI.Text(config.message, {
            fontFamily: 'Trebuchet MS, Arial Black, sans-serif',
            fontSize: 18,
            fontWeight: '700',
            fill: colors.text,
            stroke: colors.stroke,
            strokeThickness: 2,
            dropShadow: true,
            dropShadowColor: 0x000000,
            dropShadowBlur: 3,
            dropShadowDistance: 1,
            dropShadowAngle: Math.PI / 3,
            wordWrap: true,
            wordWrapWidth: textAreaWidth,
            letterSpacing: 0.5,
        });

        // Calculate dimensions
        const contentWidth = ICON_SIZE + ICON_MARGIN + text.width;
        const width = Math.min(contentWidth + TOAST_PADDING_X * 2, MAX_WIDTH);
        const height = Math.max(text.height + TOAST_PADDING_Y * 2, TOAST_MIN_HEIGHT);

        // Create outer glow layer (pulsing effect)
        const glowGraphics = new PIXI.Graphics();
        this.drawOuterGlow(glowGraphics, width, height, borderRadius, colors);
        glowGraphics.alpha = 0.6;

        // Create main background
        const bg = new PIXI.Graphics();
        this.drawToastBackground(bg, width, height, borderRadius, colors);

        // Create icon container with background
        const iconContainer = new PIXI.Container();
        const iconBg = new PIXI.Graphics();
        iconBg.beginFill(colors.iconBg, 0.3);
        iconBg.drawRoundedRect(0, 0, ICON_SIZE, ICON_SIZE, 6);
        iconBg.endFill();

        const icon = new PIXI.Graphics();
        TOAST_ICONS[config.type](icon, ICON_SIZE, colors.borderHighlight);

        iconContainer.addChild(iconBg, icon);
        iconContainer.x = TOAST_PADDING_X;
        iconContainer.y = (height - ICON_SIZE) / 2;

        // Position text after icon
        text.x = TOAST_PADDING_X + ICON_SIZE + ICON_MARGIN;
        text.y = (height - text.height) / 2;

        // Add shine/highlight effect overlay
        const shine = new PIXI.Graphics();
        shine.beginFill(0xffffff, 0.08);
        shine.drawRoundedRect(2, 2, width - 4, height * 0.45, borderRadius - 1);
        shine.endFill();

        container.addChild(glowGraphics, bg, shine, iconContainer, text);

        // Set pivot for scale animation from center
        container.pivot.set(width / 2, height / 2);

        // Make interactive for dismiss on click
        container.eventMode = 'static';
        container.cursor = 'pointer';

        return { container, config, width, height, glowGraphics };
    }

    /** Draw outer neon glow effect */
    private drawOuterGlow(
        g: PIXI.Graphics,
        width: number,
        height: number,
        borderRadius: number,
        colors: ToastColorSet
    ): void {
        // Multiple glow layers for depth
        const glowLayers = [
            { offset: 6, alpha: 0.15, color: colors.glowOuter },
            { offset: 4, alpha: 0.25, color: colors.glow },
            { offset: 2, alpha: 0.35, color: colors.glow },
        ];

        for (const layer of glowLayers) {
            g.beginFill(layer.color, layer.alpha);
            g.drawRoundedRect(
                -layer.offset,
                -layer.offset,
                width + layer.offset * 2,
                height + layer.offset * 2,
                borderRadius + layer.offset
            );
            g.endFill();
        }
    }

    /** Draw toast background with gradient effect and border */
    private drawToastBackground(
        g: PIXI.Graphics,
        width: number,
        height: number,
        borderRadius: number,
        colors: ToastColorSet
    ): void {
        // Drop shadow
        g.beginFill(0x000000, 0.4);
        g.drawRoundedRect(2, 3, width, height, borderRadius);
        g.endFill();

        // Main background (dark)
        g.beginFill(colors.bg, 0.95);
        g.drawRoundedRect(0, 0, width, height, borderRadius);
        g.endFill();

        // Gradient overlay (lighter at top)
        g.beginFill(colors.bgGradient, 0.5);
        g.drawRoundedRect(0, 0, width, height * 0.5, borderRadius);
        g.endFill();

        // Inner border highlight (top edge glow)
        g.lineStyle(1, colors.borderHighlight, 0.4);
        g.drawRoundedRect(1, 1, width - 2, height - 2, borderRadius - 1);

        // Main border with glow color
        g.lineStyle(2, colors.border, 0.8);
        g.drawRoundedRect(0, 0, width, height, borderRadius);
        g.lineStyle(0);

        // Corner accents (gaming style)
        const cornerSize = 8;
        const cornerOffset = 4;
        g.lineStyle(2, colors.borderHighlight, 0.6);

        // Top-left corner
        g.moveTo(cornerOffset, cornerOffset + cornerSize);
        g.lineTo(cornerOffset, cornerOffset);
        g.lineTo(cornerOffset + cornerSize, cornerOffset);

        // Top-right corner
        g.moveTo(width - cornerOffset - cornerSize, cornerOffset);
        g.lineTo(width - cornerOffset, cornerOffset);
        g.lineTo(width - cornerOffset, cornerOffset + cornerSize);

        // Bottom-left corner
        g.moveTo(cornerOffset, height - cornerOffset - cornerSize);
        g.lineTo(cornerOffset, height - cornerOffset);
        g.lineTo(cornerOffset + cornerSize, height - cornerOffset);

        // Bottom-right corner
        g.moveTo(width - cornerOffset - cornerSize, height - cornerOffset);
        g.lineTo(width - cornerOffset, height - cornerOffset);
        g.lineTo(width - cornerOffset, height - cornerOffset - cornerSize);

        g.lineStyle(0);
    }

    private animateIn(toast: ToastItem): void {
        const { container, config, glowGraphics } = toast;

        // Start with scale and alpha at 0 for animation
        const isTop = config.position.includes('top');
        container.alpha = 0;
        container.scale.set(0.85);

        // Store target Y (set by repositionToasts) and offset for animation
        const targetY = container.y;
        container.y = targetY + (isTop ? -50 : 50);

        // Animate in with gaming-style entrance (200-300ms per UX guidelines)
        gsap.to(container, {
            alpha: 1,
            y: targetY,
            duration: 0.28,
            ease: 'back.out(1.4)',
        });

        gsap.to(container.scale, {
            x: 1,
            y: 1,
            duration: 0.22,
            ease: 'back.out(1.8)',
        });

        // Subtle glow pulse animation for attention
        if (glowGraphics) {
            gsap.to(glowGraphics, {
                alpha: 0.9,
                duration: 0.6,
                ease: 'power1.inOut',
                yoyo: true,
                repeat: 2,
                onComplete: () => {
                    // Settle to subtle pulse
                    gsap.to(glowGraphics, {
                        alpha: 0.5,
                        duration: 1.2,
                        ease: 'sine.inOut',
                        yoyo: true,
                        repeat: -1,
                    });
                },
            });
        }

        // Click to dismiss
        container.on('pointerdown', () => this.dismiss(toast));
    }

    private dismiss(toast: ToastItem): void {
        const index = this.toasts.indexOf(toast);
        if (index === -1) return;

        // Clear timer
        if (toast.timer) {
            clearTimeout(toast.timer);
        }

        // Kill any ongoing glow animations
        if (toast.glowGraphics) {
            gsap.killTweensOf(toast.glowGraphics);
        }

        // Remove from array
        this.toasts.splice(index, 1);

        // Quick flash before dismiss (gaming feedback)
        if (toast.glowGraphics) {
            gsap.to(toast.glowGraphics, {
                alpha: 1,
                duration: 0.08,
                ease: 'power2.out',
            });
        }

        // Animate out with scale and slide (150-200ms per UX guidelines)
        gsap.to(toast.container, {
            alpha: 0,
            y: toast.container.y - 25,
            duration: 0.18,
            ease: 'power2.in',
        });

        gsap.to(toast.container.scale, {
            x: 0.92,
            y: 0.92,
            duration: 0.18,
            ease: 'power2.in',
            onComplete: () => {
                toast.container.destroy();
                this.repositionToasts();
            },
        });
    }

    private repositionToasts(): void {
        // Group by position
        const groups = new Map<string, ToastItem[]>();

        for (const toast of this.toasts) {
            const pos = toast.config.position;
            if (!groups.has(pos)) groups.set(pos, []);
            groups.get(pos)!.push(toast);
        }

        // Position each group
        for (const [position, items] of groups) {
            let offsetY = TOAST_MARGIN;

            for (const toast of items) {
                const { container, width, height } = toast;
                // Pivot is at center, so position is at center point
                const halfW = width / 2;
                const halfH = height / 2;

                // X position (center-based due to pivot)
                if (position.includes('left')) {
                    container.x = TOAST_MARGIN + halfW;
                } else if (position.includes('right')) {
                    container.x = this.screenWidth - halfW - TOAST_MARGIN;
                } else {
                    container.x = this.screenWidth / 2;
                }

                // Y position (center-based due to pivot)
                if (position.includes('bottom')) {
                    container.y = this.screenHeight - halfH - offsetY;
                } else {
                    container.y = offsetY + halfH;
                }

                offsetY += height + TOAST_MARGIN;
            }
        }
    }

    public destroy(): void {
        this.resizeBinding?.detach();
        this.resizeBinding = null;
        this.dismissAll();
        this.layer.destroy();
    }
}
