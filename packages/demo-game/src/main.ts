import Phaser from 'phaser';
import { gameConfig } from './game-config';

console.log('PGE Demo Game');
const game = new Phaser.Game(gameConfig);

// Expose for debugging
(window as unknown as { __PHASER_GAME__: Phaser.Game }).__PHASER_GAME__ = game;
