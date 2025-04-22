import Phaser from 'phaser';

export default class MainScene extends Phaser.Scene {
  // Объявление переменных для фоновых слоёв, игрока и управления
  private backgroundFar!: Phaser.GameObjects.TileSprite; // Дальний фон
  private backgroundNear!: Phaser.GameObjects.TileSprite; // Ближний фон
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody; // Игрок
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys; // Клавиши управления

  // Скорости вертикального движения фонов
  private backgroundFarSpeedY = 0.1; // Скорость для дальнего слоя
  private backgroundNearSpeedY = 0.5; // Скорость для ближнего слоя

  constructor() {
    super('MainScene'); // Название сцены
  }

  preload() {
    // Предзагрузка ресурсов: фоны и спрайт игрока
    this.load.image('backgroundFar', '/assets/backgroundFar.png'); // Дальний фон
    this.load.image('backgroundNear', '/assets/backgroundNear.png'); // Ближний фон с прозрачностью
    this.load.image('player', '/assets/player.png'); // Игрок
  }

  create() {
    const { width, height } = this.scale; // Получаем размеры экрана

    // Создаём дальний фон, растягиваем на весь экран, задаём цветовой оттенок (фиолетовый)
    this.backgroundFar = this.add
      .tileSprite(0, 0, width, height, 'backgroundFar')
      .setOrigin(0, 0)
      .setTint(0x800080); // Фиолетовый оттенок

    // Создаём ближний фон поверх дальнего с полупрозрачностью
    this.backgroundNear = this.add
      .tileSprite(0, 0, width, height, 'backgroundNear')
      .setOrigin(0, 0)
      .setAlpha(0.4); // Прозрачность слоя

    // Добавляем игрока в центр по ширине и ближе к нижней части экрана
    this.player = this.physics.add.sprite(width / 2, height - 100, 'player');
    this.player.setCollideWorldBounds(true); // Не позволяет выходить за пределы экрана

    // Устанавливаем управление с клавиатуры
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update() {
    const playerSpeedX = this.player.body.velocity.x;
    const playerSpeedY = this.player.body.velocity.y;

    // Параллакс-движение фонов
    this.backgroundFar.tilePositionX += playerSpeedX * 0.001;
    this.backgroundNear.tilePositionX += playerSpeedX * 0.002;

    this.backgroundFar.tilePositionY -= this.backgroundFarSpeedY;
    this.backgroundNear.tilePositionY -= this.backgroundNearSpeedY;

    // Горизонтальное движение
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-300);
      this.player.setAngle(-10); // наклон влево
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(300);
      this.player.setAngle(10); // наклон вправо
    } else {
      this.player.setVelocityX(0);
    }

    // Вертикальное движение
    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-250);
      this.player.setScale(1, 1.02); // Увеличиваем нос корабля (при движении вверх)
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(250);
      this.player.setScale(1, 0.98); // Увеличиваем зад корабля (при движении вниз)
    } else {
      this.player.setVelocityY(0);
      this.player.setScale(1, 1); // Возвращаем нормальный масштаб
    }

    // Возврат к нормальной ориентации при отсутствии движения
    if (
      !this.cursors.left.isDown &&
      !this.cursors.right.isDown &&
      !this.cursors.up.isDown &&
      !this.cursors.down.isDown
    ) {
      this.player.setAngle(0);
    }
  }
}
