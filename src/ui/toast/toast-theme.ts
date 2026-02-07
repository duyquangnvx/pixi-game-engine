import type { ToastType } from './toast-manager';

/**
 * Color set for a single toast type
 * Used to define the visual appearance of info/success/warning/error toasts
 */
export interface ToastColorSet {
    /** Main background color (dark) */
    bg: number;
    /** Gradient overlay color (lighter, for top half) */
    bgGradient: number;
    /** Primary glow color */
    glow: number;
    /** Outer glow color (darker) */
    glowOuter: number;
    /** Border color */
    border: number;
    /** Border highlight color (brighter) */
    borderHighlight: number;
    /** Text color */
    text: number;
    /** Text stroke color */
    stroke: number;
    /** Icon background color */
    iconBg: number;
}

/**
 * Complete toast theme with colors for all toast types
 */
export interface ToastTheme {
    /** Theme name for identification */
    name: string;
    /** Color sets for each toast type */
    colors: Record<ToastType, ToastColorSet>;
}

/**
 * Built-in theme preset names
 */
export type ToastThemePreset = 'default' | 'asian' | 'egyptian' | 'underwater' | 'neon' | 'luxury';

/**
 * Helper function to create a complete theme with type safety
 * @param name - Theme name
 * @param colors - Color sets for each toast type
 * @returns Complete ToastTheme object
 */
export function createTheme(name: string, colors: Record<ToastType, ToastColorSet>): ToastTheme {
    return { name, colors };
}
