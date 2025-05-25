import Phaser from 'phaser';

export class BlackHole extends Phaser.GameObjects.Graphics {
  private radius: number;
  private rotationSpeed: number;
  private gravityForce: number = 300;
  private movementSpeed: number = 0.5; // Скорость движения
  private movementBounds: Phaser.Geom.Rectangle; // Границы движения
  private targetPosition: Phaser.Math.Vector2; // Целевая позиция
  private movementTween: Phaser.Tweens.Tween | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number, radius: number = 50) {
    super(scene, { x, y });
    this.radius = radius;
    this.rotationSpeed = 0.03;

    // Устанавливаем границы движения (можно настроить под свой экран)
    this.movementBounds = new Phaser.Geom.Rectangle(
      radius,
      radius,
      scene.scale.width - radius * 2,
      scene.scale.height - radius * 2
    );

    // Начальная целевая позиция
    this.targetPosition = new Phaser.Math.Vector2(x, y);

    scene.add.existing(this);
    this.createHoleEffect();
    this.startMovement();
  }
  private createHoleEffect(): void {
    // 1. Центральная черная область (сингулярность)
    this.fillStyle(0x111122, 1);
    this.fillCircle(0, 0, this.radius * 0.8);

    // 2. Горизонт событий (тёмная граница)
    this.fillStyle(0x111122, 0.9);
    this.fillCircle(0, 0, this.radius * 0.95);

    // 3. Аккреционный диск (имитация градиента через несколько колец)
    const colors = [
      { color: 0x0066ff, alpha: 0.8, radius: 0.9 }, // Голубой внутренний
      { color: 0x0099ff, alpha: 0.7, radius: 1.0 },
      { color: 0xff3300, alpha: 0.6, radius: 1.2 }, // Оранжевый
      { color: 0xffcc00, alpha: 0.5, radius: 1.5 } // Желтый внешний
    ];

    colors.forEach(c => {
      this.fillStyle(c.color, c.alpha);
      this.fillCircle(0, 0, this.radius * c.radius);
    });

    // 4. Точечные блики
    this.fillStyle(0xffffff, 0.7);
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const dist = this.radius * 1.3;
      this.fillCircle(Math.cos(angle) * dist, Math.sin(angle) * dist, 2 + Math.random() * 3);
    }
  }

  private startMovement(): void {
    // Выбираем новую случайную позицию в пределах границ
    const newX = Phaser.Math.Between(this.movementBounds.left, this.movementBounds.right);
    const newY = Phaser.Math.Between(this.movementBounds.top, this.movementBounds.bottom);

    this.targetPosition.set(newX, newY);

    // Создаем плавное движение к новой позиции
    this.movementTween = this.scene.tweens.add({
      targets: this,
      x: newX,
      y: newY,
      duration: Phaser.Math.Between(5000, 30000), // Длительность 5-10 секунд
      ease: 'Sine.easeInOut',
      onComplete: () => {
        // Когда достигли цели - выбираем новую точку
        this.startMovement();
      }
    });
  }

  public attract(objects: Phaser.Physics.Arcade.Sprite[]): void {
    objects.forEach(obj => {
      if (!obj.active || !obj.body) return;

      const angle = Phaser.Math.Angle.Between(obj.x, obj.y, this.x, this.y);
      const distance = Phaser.Math.Distance.Between(obj.x, obj.y, this.x, this.y);
      const force = this.gravityForce / Math.max(distance * 0.5, 10);

      obj.setVelocity(
        obj.body.velocity.x + Math.cos(angle) * force,
        obj.body.velocity.y + Math.sin(angle) * force
      );
    });
  }

  preUpdate(): void {
    this.rotation += this.rotationSpeed;
    this.clear();
    this.createHoleEffect();

    this.lineStyle(2, 0xffffff, 0.3);
    for (let i = 0; i < 5; i++) {
      const a = this.rotation + i * Math.PI * 0.4;
      this.beginPath();
      this.arc(0, 0, this.radius * 1.3, a, a + Math.PI * 0.3);
      this.strokePath();
    }
  }

  destroy(fromScene?: boolean): void {
    if (this.movementTween) {
      this.movementTween.stop();
      this.movementTween.remove();
    }
    super.destroy(fromScene);
  }
}
