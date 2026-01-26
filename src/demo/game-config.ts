import Phaser from 'phaser';
import { DemoScene } from './scenes/demo-scene';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2c3e50',
  scene: [DemoScene],
};
