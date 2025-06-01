// src/entities/BlackHoleSprite.ts
import Phaser from 'phaser';

/**
 * Класс чёрной дыры — визуальный и гравитационный объект,
 * притягивающий другие объекты и уничтожающий их при приближении.
 */
export class BlackHoleSprite extends Phaser.GameObjects.Sprite {
  private rotationSpeed = 0.005; // скорость вращения
  private gravityForce = 450; // сила притяжения (увеличенная)
  private destroyRadius = 20; // радиус уничтожения объектов
  private movementTween: Phaser.Tweens.Tween | null = null; // tween для движения
  private movementBounds: Phaser.Geom.Rectangle; // ограничение области движения

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'blackhole'); // создаем спрайт чёрной дыры
    this.setOrigin(0.5); // центр якоря
    this.setScale(0.5); // уменьшенный размер

    scene.add.existing(this); // добавляем спрайт в сцену

    // Устанавливаем границы движения чёрной дыры
    this.movementBounds = new Phaser.Geom.Rectangle(
      100,
      100,
      scene.scale.width - 200,
      scene.scale.height - 200
    );

    this.startMovement(); // запускаем анимацию движения
  }

  /**
   * Метод для начала анимации перемещения чёрной дыры по сцене.
   */
  private startMovement(): void {
    // Выбираем случайную позицию в пределах границ
    const newX = Phaser.Math.Between(this.movementBounds.left, this.movementBounds.right);
    const newY = Phaser.Math.Between(this.movementBounds.top, this.movementBounds.bottom);

    // Настраиваем tween для плавного перемещения
    this.movementTween = this.scene.tweens.add({
      targets: this,
      x: newX,
      y: newY,
      duration: Phaser.Math.Between(7000, 15000), // продолжительность от 7 до 15 секунд
      ease: 'Sine.easeInOut', // плавное движение
      onComplete: () => this.startMovement() // запускаем следующий tween по завершении
    });
  }

  /**
   * Притягивает переданные объекты к чёрной дыре.
   * Уничтожает объекты, если они находятся слишком близко.
   * @param objects массив спрайтов с физикой
   */
  public attract(objects: Phaser.Physics.Arcade.Sprite[]): void {
    objects.forEach(obj => {
      if (!obj.active || !obj.body) return; // пропускаем неактивные объекты

      // Вычисляем угол и расстояние до объекта
      const angle = Phaser.Math.Angle.Between(obj.x, obj.y, this.x, this.y);
      const distance = Phaser.Math.Distance.Between(obj.x, obj.y, this.x, this.y);

      // Если объект слишком близко — уничтожаем
      if (distance < this.destroyRadius) {
        obj.destroy();
        return;
      }

      // Вычисляем силу притяжения (чем ближе — тем сильнее)
      const force = this.gravityForce / Math.max(distance * 0.5, 10);

      // Применяем силу к текущей скорости объекта
      obj.setVelocity(
        obj.body.velocity.x + Math.cos(angle) * force,
        obj.body.velocity.y + Math.sin(angle) * force
      );
    });
  }

  /**
   * Метод, вызываемый каждый кадр. Отвечает за вращение чёрной дыры.
   */
  preUpdate(): void {
    this.rotation += this.rotationSpeed; // вращаем дыра
  }

  /**
   * Уничтожение объекта. Прерывает движение и удаляет tween.
   * @param fromScene флаг, указывающий, вызвано ли уничтожение сценой
   */
  destroy(fromScene?: boolean): void {
    if (this.movementTween) {
      this.movementTween.stop(); // останавливаем tween
      this.movementTween.remove(); // удаляем его
    }
    super.destroy(fromScene); // вызываем базовый destroy
  }
}
