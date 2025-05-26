// src/entities/BlackHoleSprite.ts
import Phaser from 'phaser';

export class BlackHoleSprite extends Phaser.GameObjects.Sprite {
  private rotationSpeed = 0.005;
  private gravityForce = 450; // увеличено для сильного притяжения
  private destroyRadius = 20; // радиус, в котором объекты исчезают
  private movementTween: Phaser.Tweens.Tween | null = null;
  private movementBounds: Phaser.Geom.Rectangle;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'blackhole');
    this.setOrigin(0.5);
    this.setScale(0.5);

    scene.add.existing(this);

    this.movementBounds = new Phaser.Geom.Rectangle(
      100,
      100,
      scene.scale.width - 200,
      scene.scale.height - 200
    );

    this.startMovement();
  }

  private startMovement(): void {
    const newX = Phaser.Math.Between(this.movementBounds.left, this.movementBounds.right);
    const newY = Phaser.Math.Between(this.movementBounds.top, this.movementBounds.bottom);

    this.movementTween = this.scene.tweens.add({
      targets: this,
      x: newX,
      y: newY,
      duration: Phaser.Math.Between(7000, 15000),
      ease: 'Sine.easeInOut',
      onComplete: () => this.startMovement()
    });
  }

  public attract(objects: Phaser.Physics.Arcade.Sprite[]): void {
    objects.forEach(obj => {
      if (!obj.active || !obj.body) return;

      const angle = Phaser.Math.Angle.Between(obj.x, obj.y, this.x, this.y);
      const distance = Phaser.Math.Distance.Between(obj.x, obj.y, this.x, this.y);

      if (distance < this.destroyRadius) {
        obj.destroy(); // уничтожаем до пересечения центра
        return;
      }

      const force = this.gravityForce / Math.max(distance * 0.5, 10);

      obj.setVelocity(
        obj.body.velocity.x + Math.cos(angle) * force,
        obj.body.velocity.y + Math.sin(angle) * force
      );
    });
  }

  preUpdate(): void {
    this.rotation += this.rotationSpeed;
  }

  destroy(fromScene?: boolean): void {
    if (this.movementTween) {
      this.movementTween.stop();
      this.movementTween.remove();
    }
    super.destroy(fromScene);
  }
}
