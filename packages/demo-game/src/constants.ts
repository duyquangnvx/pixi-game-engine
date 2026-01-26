/**
 * Shared constants for demo-game
 */

export const COLORS = {
  bg: 0x1a1a2e,
  primary: 0x16213e,
  accent: 0xe94560,
  text: 0xffffff,
  muted: 0x666666,
};

export const SCENES = {
  LOADING: 'LoadingScene',
  MENU: 'MenuScene',
  PIXEL_ART: 'PixelArtScene',
  PLAYGROUND: 'PlaygroundScene',
} as const;

export type SceneKey = (typeof SCENES)[keyof typeof SCENES];
