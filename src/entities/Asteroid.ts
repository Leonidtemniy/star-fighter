// src/entities/Asteroid.ts
import Phaser from 'phaser';

export function spawnAsteroid(scene: Phaser.Scene, group: Phaser.Physics.Arcade.Group) {
  // 1. Рандомное место появления (сверху, слева или справа)
  const spawnSide = Phaser.Math.Between(0, 2); // 0 = верх, 1 = лево, 2 = право
  let x: number, y: number;

  switch (spawnSide) {
    case 0: // Сверху
      x = Phaser.Math.Between(50, scene.scale.width - 50);
      y = -50;
      break;
    case 1: // Слева
      x = -50;
      y = Phaser.Math.Between(50, scene.scale.height - 50);
      break;
    case 2: // Справа
      x = scene.scale.width + 50;
      y = Phaser.Math.Between(50, scene.scale.height - 50);
      break;
    default:
      x = Phaser.Math.Between(50, scene.scale.width - 50);
      y = -50;
  }

  // 2. Создаём астероид
  const asteroid = group.create(x, y, 'asteroid') as Phaser.Physics.Arcade.Sprite;

  // 3. Рандомный размер (от 0.5 до 1.2)
  const scale = Phaser.Math.FloatBetween(0.2, 0.7);
  asteroid.setScale(scale);

  // 4. Рандомная скорость и направление (летит к центру экрана)
  const targetX = scene.scale.width / 2;
  const targetY = scene.scale.height / 2;
  const speed = Phaser.Math.Between(250, 550);

  // Угол между астероидом и центром экрана
  const angle = Phaser.Math.Angle.Between(x, y, targetX, targetY);

  // Устанавливаем скорость по направлению к центру
  asteroid.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);

  // 5. Рандомное вращение
  asteroid.setAngularVelocity(Phaser.Math.Between(-200, 200));

  // 6. Физика (круглый хитбокс)
  const bodyRadius = asteroid.width * 0.5 * 0.6; // 60% от половины ширины
  asteroid.setCircle(
    bodyRadius,
    asteroid.displayWidth / 2 - bodyRadius,
    asteroid.displayHeight / 2 - bodyRadius
  );

  // 7. Дополнительно: лёгкое искривление траектории
  asteroid.setAcceleration(Phaser.Math.Between(-30, 30), Phaser.Math.Between(-30, 30));
}
