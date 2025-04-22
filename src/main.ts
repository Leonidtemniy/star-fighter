import Phaser from 'phaser';
import MainScene from './scenes/MainScene';

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
    mode: Phaser.Scale.FIT, // Подгоняет игру под размер экрана
    autoCenter: Phaser.Scale.CENTER_BOTH // Центрирует по горизонтали и вертикали
  },
  scene: [MainScene]
};

new Phaser.Game(config);
