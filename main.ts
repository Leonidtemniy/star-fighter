import Phaser from 'phaser';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1d1d1d',
  scene: {
    preload,
    create,
    update
  }
};

new Phaser.Game(config);

function preload(this: Phaser.Scene) {
  this.load.image('logo', 'https://labs.phaser.io/assets/sprites/phaser3-logo.png');
}

function create(this: Phaser.Scene) {
  const logo = this.add.image(400, 300, 'logo');
  this.tweens.add({
    targets: logo,
    y: 400,
    duration: 2000,
    ease: 'Power2',
    yoyo: true,
    loop: -1
  });
}

function update(this: Phaser.Scene) {
  // обновление логики игры
}
