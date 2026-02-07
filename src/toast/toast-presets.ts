import type { ToastColorSet, ToastTheme, ToastThemePreset } from './toast-theme';
import { createTheme } from './toast-theme';
import type { ToastType } from './toast-manager';

/**
 * Default theme - Generic casino style
 * Info: Cyan, Success: Gold, Warning: Orange, Error: Red
 */
const defaultTheme: ToastTheme = createTheme('default', {
    info: {
        bg: 0x0a1628,
        bgGradient: 0x102040,
        glow: 0x00d4ff,
        glowOuter: 0x0088aa,
        border: 0x00d4ff,
        borderHighlight: 0x80efff,
        text: 0xffffff,
        stroke: 0x001020,
        iconBg: 0x00b8e6,
    },
    success: {
        bg: 0x1a1a08,
        bgGradient: 0x2a2a10,
        glow: 0xffd700,
        glowOuter: 0xb8860b,
        border: 0xffd700,
        borderHighlight: 0xffec80,
        text: 0xffffff,
        stroke: 0x1a1000,
        iconBg: 0xe6c200,
    },
    warning: {
        bg: 0x1a1008,
        bgGradient: 0x2a1810,
        glow: 0xff8c00,
        glowOuter: 0xcc6600,
        border: 0xff8c00,
        borderHighlight: 0xffb366,
        text: 0xffffff,
        stroke: 0x1a0800,
        iconBg: 0xe67a00,
    },
    error: {
        bg: 0x1a0808,
        bgGradient: 0x2a1010,
        glow: 0xff3333,
        glowOuter: 0xaa2222,
        border: 0xff3333,
        borderHighlight: 0xff8080,
        text: 0xffffff,
        stroke: 0x100000,
        iconBg: 0xe62e2e,
    },
});

/**
 * Asian theme - Lucky/Chinese New Year style
 * Info: Red, Success: Gold, Warning: Orange, Error: Deep Red
 */
const asianTheme: ToastTheme = createTheme('asian', {
    info: {
        bg: 0x1a0808,
        bgGradient: 0x2a1010,
        glow: 0xff2222,
        glowOuter: 0xaa1111,
        border: 0xff2222,
        borderHighlight: 0xff6666,
        text: 0xffffff,
        stroke: 0x100000,
        iconBg: 0xcc1a1a,
    },
    success: {
        bg: 0x1a1a08,
        bgGradient: 0x2a2a10,
        glow: 0xffd700,
        glowOuter: 0xb8860b,
        border: 0xffd700,
        borderHighlight: 0xffec80,
        text: 0xffffff,
        stroke: 0x1a1000,
        iconBg: 0xe6c200,
    },
    warning: {
        bg: 0x1a1208,
        bgGradient: 0x2a1c10,
        glow: 0xffa500,
        glowOuter: 0xcc8400,
        border: 0xffa500,
        borderHighlight: 0xffc966,
        text: 0xffffff,
        stroke: 0x1a0c00,
        iconBg: 0xe69500,
    },
    error: {
        bg: 0x200808,
        bgGradient: 0x301010,
        glow: 0x8b0000,
        glowOuter: 0x5c0000,
        border: 0x8b0000,
        borderHighlight: 0xb33333,
        text: 0xffffff,
        stroke: 0x0a0000,
        iconBg: 0x7a0000,
    },
});

/**
 * Egyptian theme - Ancient/Pharaoh style
 * Info: Turquoise, Success: Gold, Warning: Amber, Error: Scarlet
 */
const egyptianTheme: ToastTheme = createTheme('egyptian', {
    info: {
        bg: 0x081a1a,
        bgGradient: 0x102a2a,
        glow: 0x40e0d0,
        glowOuter: 0x30a8a0,
        border: 0x40e0d0,
        borderHighlight: 0x80f0e8,
        text: 0xffffff,
        stroke: 0x001010,
        iconBg: 0x38c8c0,
    },
    success: {
        bg: 0x1a1808,
        bgGradient: 0x2a2410,
        glow: 0xffd700,
        glowOuter: 0xdaa520,
        border: 0xffd700,
        borderHighlight: 0xffe44d,
        text: 0xffffff,
        stroke: 0x1a1400,
        iconBg: 0xe6c200,
    },
    warning: {
        bg: 0x1a1408,
        bgGradient: 0x2a2010,
        glow: 0xffbf00,
        glowOuter: 0xcc9900,
        border: 0xffbf00,
        borderHighlight: 0xffd94d,
        text: 0xffffff,
        stroke: 0x1a1000,
        iconBg: 0xe6ac00,
    },
    error: {
        bg: 0x1a0a08,
        bgGradient: 0x2a1210,
        glow: 0xff2400,
        glowOuter: 0xcc1c00,
        border: 0xff2400,
        borderHighlight: 0xff6b4d,
        text: 0xffffff,
        stroke: 0x100400,
        iconBg: 0xe62000,
    },
});

/**
 * Underwater theme - Ocean/Aquatic style
 * Info: Cyan, Success: Sea Green, Warning: Yellow, Error: Coral
 */
const underwaterTheme: ToastTheme = createTheme('underwater', {
    info: {
        bg: 0x081828,
        bgGradient: 0x102438,
        glow: 0x00ced1,
        glowOuter: 0x008b8b,
        border: 0x00ced1,
        borderHighlight: 0x66e8ea,
        text: 0xffffff,
        stroke: 0x001018,
        iconBg: 0x00b8bb,
    },
    success: {
        bg: 0x081a10,
        bgGradient: 0x102a18,
        glow: 0x20b2aa,
        glowOuter: 0x178a84,
        border: 0x20b2aa,
        borderHighlight: 0x66d4ce,
        text: 0xffffff,
        stroke: 0x001008,
        iconBg: 0x1c9e97,
    },
    warning: {
        bg: 0x1a1a08,
        bgGradient: 0x2a2a10,
        glow: 0xf0e68c,
        glowOuter: 0xc0b870,
        border: 0xf0e68c,
        borderHighlight: 0xf8f0b8,
        text: 0x1a1a08,
        stroke: 0x808060,
        iconBg: 0xd8cf7e,
    },
    error: {
        bg: 0x1a1010,
        bgGradient: 0x2a1818,
        glow: 0xff7f50,
        glowOuter: 0xcc6640,
        border: 0xff7f50,
        borderHighlight: 0xffb299,
        text: 0xffffff,
        stroke: 0x100808,
        iconBg: 0xe67248,
    },
});

/**
 * Neon theme - Cyberpunk/Modern style
 * Info: Pink, Success: Lime, Warning: Yellow, Error: Magenta
 */
const neonTheme: ToastTheme = createTheme('neon', {
    info: {
        bg: 0x180820,
        bgGradient: 0x241030,
        glow: 0xff1493,
        glowOuter: 0xcc1077,
        border: 0xff1493,
        borderHighlight: 0xff66b8,
        text: 0xffffff,
        stroke: 0x100018,
        iconBg: 0xe61284,
    },
    success: {
        bg: 0x081a08,
        bgGradient: 0x102a10,
        glow: 0x32cd32,
        glowOuter: 0x28a428,
        border: 0x32cd32,
        borderHighlight: 0x7de87d,
        text: 0xffffff,
        stroke: 0x001000,
        iconBg: 0x2db82d,
    },
    warning: {
        bg: 0x1a1a08,
        bgGradient: 0x2a2a10,
        glow: 0xffff00,
        glowOuter: 0xcccc00,
        border: 0xffff00,
        borderHighlight: 0xffff66,
        text: 0x1a1a08,
        stroke: 0x808000,
        iconBg: 0xe6e600,
    },
    error: {
        bg: 0x200820,
        bgGradient: 0x301030,
        glow: 0xff00ff,
        glowOuter: 0xcc00cc,
        border: 0xff00ff,
        borderHighlight: 0xff66ff,
        text: 0xffffff,
        stroke: 0x100010,
        iconBg: 0xe600e6,
    },
});

/**
 * Luxury theme - VIP/High-roller style
 * Info: Silver, Success: Gold, Warning: Bronze, Error: Ruby
 */
const luxuryTheme: ToastTheme = createTheme('luxury', {
    info: {
        bg: 0x101418,
        bgGradient: 0x181c22,
        glow: 0xc0c0c0,
        glowOuter: 0x909090,
        border: 0xc0c0c0,
        borderHighlight: 0xe0e0e0,
        text: 0xffffff,
        stroke: 0x080a0c,
        iconBg: 0xaaaaaa,
    },
    success: {
        bg: 0x1a1808,
        bgGradient: 0x2a2410,
        glow: 0xffd700,
        glowOuter: 0xdaa520,
        border: 0xffd700,
        borderHighlight: 0xffe44d,
        text: 0xffffff,
        stroke: 0x1a1400,
        iconBg: 0xe6c200,
    },
    warning: {
        bg: 0x181208,
        bgGradient: 0x241c10,
        glow: 0xcd7f32,
        glowOuter: 0xa46628,
        border: 0xcd7f32,
        borderHighlight: 0xe0a866,
        text: 0xffffff,
        stroke: 0x100c04,
        iconBg: 0xb8722d,
    },
    error: {
        bg: 0x1a0810,
        bgGradient: 0x2a1018,
        glow: 0xe0115f,
        glowOuter: 0xb30d4c,
        border: 0xe0115f,
        borderHighlight: 0xec5a8f,
        text: 0xffffff,
        stroke: 0x100008,
        iconBg: 0xc90f55,
    },
});

/**
 * Map of all built-in theme presets
 */
export const TOAST_PRESETS: Record<ToastThemePreset, ToastTheme> = {
    default: defaultTheme,
    asian: asianTheme,
    egyptian: egyptianTheme,
    underwater: underwaterTheme,
    neon: neonTheme,
    luxury: luxuryTheme,
};

/**
 * Get a preset theme by name
 * @param name - Preset name
 * @returns The theme object
 */
export function getPreset(name: ToastThemePreset): ToastTheme {
    return TOAST_PRESETS[name];
}

/**
 * Get the default theme colors for backwards compatibility
 * @returns Colors record for all toast types
 */
export function getDefaultColors(): Record<ToastType, ToastColorSet> {
    return defaultTheme.colors;
}
