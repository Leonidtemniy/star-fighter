import Phaser from 'phaser';

export function fireBullet(
  scene: Phaser.Scene, // Заменили p0: this на scene: Phaser.Scene
  bullets: Phaser.Physics.Arcade.Group,
  player: Phaser.Physics.Arcade.Sprite
) {
  const bullet = bullets.get(player.x, player.y - 20, 'bullet') as Phaser.Physics.Arcade.Image;

  if (bullet) {
    bullet.setActive(true);
    bullet.setVisible(true);
    bullet.enableBody(true, player.x, player.y - 20, true, true);
    bullet.setVelocityY(-400);
    bullet.setScale(0.5);
    bullet.setCollideWorldBounds(false);
    bullet.setGravityY(0);

    // Автоматическое удаление пули через 2 секунды, если она не попала в цель
    scene.time.delayedCall(2000, () => {
      if (bullet.active) {
        bullet.destroy();
      }
    });
  }
}
