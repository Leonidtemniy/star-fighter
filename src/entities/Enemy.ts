// Импорт основной библиотеки Phaser
import Phaser from 'phaser';

/**
 * Функция создания врага на сцене.
 * @param scene - текущая игровая сцена.
 * @param group - группа, в которую добавляется враг (Physics Group).
 */
export function spawnEnemy(scene: Phaser.Scene, group: Phaser.Physics.Arcade.Group) {
  // Случайная координата X в пределах экрана (с отступами по 50px от краев)
  const x = Phaser.Math.Between(50, scene.scale.width - 50);

  // Создание врага в группе: позиция (x, -50), текстура 'enemy'
  const enemy = group.create(x, -50, 'enemy') as Phaser.Physics.Arcade.Sprite;

  // Установка вертикальной скорости врага (движение вниз)
  enemy.setVelocityY(100);

  // Масштабирование спрайта врага до 80% от оригинального размера
  enemy.setScale(0.8);
}
