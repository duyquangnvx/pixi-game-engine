import Phaser from 'phaser';
import { LoadingScene } from './scenes/loading-scene';
import { MenuScene } from './scenes/menu-scene';
import { PixelArtScene } from './scenes/pixel-art-scene';
import { PlaygroundScene } from './scenes/playground-scene';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  pixelArt: true,
  antialias: false,
  roundPixels: true,
  physics: {
    default: 'arcade',
    arcade: { gravity: { x: 0, y: 0 }, debug: false },
  },
  scene: [LoadingScene, MenuScene, PixelArtScene, PlaygroundScene],
};
