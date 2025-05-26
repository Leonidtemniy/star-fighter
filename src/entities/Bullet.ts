// Импортируем библиотеку Phaser
import Phaser from 'phaser';

/**
 * Функция выстрела пулей из позиции игрока.
 * @param scene - текущая игровая сцена.
 * @param bullets - группа пуль (Physics Group).
 * @param player - спрайт игрока, из которого происходит выстрел.
 */
export function fireBullet(
  scene: Phaser.Scene,
  bullets: Phaser.Physics.Arcade.Group,
  player: Phaser.Physics.Arcade.Sprite
) {
  // Получаем пулю из группы, размещаем её над игроком (y - 20)
  const bullet = bullets.get(player.x, player.y - 20, 'bullet') as Phaser.Physics.Arcade.Image;

  // Проверяем, удалось ли получить пулю
  if (bullet) {
    // Активируем пулю и делаем её видимой
    bullet.setActive(true);
    bullet.setVisible(true);

    // Включаем физику для пули и задаем начальные координаты
    bullet.enableBody(true, player.x, player.y - 20, true, true);

    // Устанавливаем вертикальную скорость вверх
    bullet.setVelocityY(-400);

    // Масштабируем пулю до 50% размера
    bullet.setScale(0.5);

    // Запрещаем столкновение с границами мира
    bullet.setCollideWorldBounds(false);

    // Отключаем гравитацию
    bullet.setGravityY(0);

    // Через 2 секунды удаляем пулю, если она всё ещё активна (не попала ни во что)
    scene.time.delayedCall(2000, () => {
      if (bullet.active) {
        bullet.destroy();
      }
    });
  }
}
