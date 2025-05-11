import Phaser from 'phaser';
import MainScene from './scenes/MainScene';
import MainMenuScene from './scenes/MainMenuScene';
import GameOverScene from './scenes/GameOverScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  backgroundColor: '#000000',
  parent: 'game-container',
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [MainMenuScene, MainScene, GameOverScene] // порядок важен
};

new Phaser.Game(config);
