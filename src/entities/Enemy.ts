import Phaser from 'phaser';

export function spawnEnemy(scene: Phaser.Scene, group: Phaser.Physics.Arcade.Group) {
  const x = Phaser.Math.Between(50, scene.scale.width - 50);

  const enemy = group.create(x, -50, 'enemy') as Phaser.Physics.Arcade.Sprite;
  enemy.setVelocityY(100);
  enemy.setScale(0.8);
}
