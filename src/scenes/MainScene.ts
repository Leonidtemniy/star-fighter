import Phaser from 'phaser';

/**
 * Главная игровая сцена
 * @class MainScene
 * @extends Phaser.Scene
 */
export default class MainScene extends Phaser.Scene {
  // Фоновые изображения с параллакс-эффектом
  private backgroundFar!: Phaser.GameObjects.TileSprite;
  private backgroundNear!: Phaser.GameObjects.TileSprite;

  // Игрок
  private player!: Phaser.Physics.Arcade.Sprite;

  // Управление
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private spaceKey!: Phaser.Input.Keyboard.Key;

  // Группы объектов
  private bullets!: Phaser.Physics.Arcade.Group; // Группа пуль
  private enemies!: Phaser.Physics.Arcade.Group; // Группа врагов

  // Скорости движения фона
  private backgroundFarSpeedY = 0.1;
  private backgroundNearSpeedY = 0.5;

  // Игровая статистика
  private playerName: string;
  private score: number;
  private bestScore: number;
  private timeElapsed: number;

  // Текстовые элементы UI
  private playerNameText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private bestScoreText!: Phaser.GameObjects.Text;
  private timeText!: Phaser.GameObjects.Text;

  // Таймер стрельбы
  private lastFired = 0;

  constructor() {
    super('MainScene');
    // Инициализация игровых переменных
    this.playerName = '';
    this.score = 0;
    this.bestScore = 0;
    this.timeElapsed = 0;
  }

  /**
   * Инициализация сцены
   * @param data - Объект с данными для инициализации
   */
  init(data: { playerName: string }) {
    this.playerName = data.playerName || 'Игрок';
    this.bestScore = parseInt(localStorage.getItem('bestScore') || '0', 10);
  }

  /**
   * Загрузка ресурсов
   */
  preload() {
    // Загрузка изображений
    this.load.image('backgroundFar', '/assets/backgroundFar.png');
    this.load.image('backgroundNear', '/assets/backgroundNear.png');
    this.load.image('player', '/assets/player.png');
    this.load.image('bullet', '/assets/bullet.png');
    this.load.image('enemy', '/assets/enemy.png');
  }

  /**
   * Создание игровых объектов
   */
  create() {
    const { width, height } = this.scale;

    // ===== СОЗДАНИЕ ФОНА =====
    this.backgroundFar = this.add
      .tileSprite(0, 0, width, height, 'backgroundFar')
      .setOrigin(0, 0)
      .setTint(0x800080); // Фиолетовый оттенок

    this.backgroundNear = this.add
      .tileSprite(0, 0, width, height, 'backgroundNear')
      .setOrigin(0, 0)
      .setAlpha(0.4); // Полупрозрачный

    // ===== СОЗДАНИЕ ИГРОКА =====
    this.player = this.physics.add.sprite(width / 2, height - 100, 'player');
    this.player.setCollideWorldBounds(true); // Не выходит за границы экрана

    // ===== НАСТРОЙКА УПРАВЛЕНИЯ =====
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // ===== СОЗДАНИЕ ГРУПП ОБЪЕКТОВ =====
    this.bullets = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
      runChildUpdate: true // Автоматическое обновление детей
    });

    this.enemies = this.physics.add.group();

    // ===== ТАЙМЕР ПОЯВЛЕНИЯ ВРАГОВ =====
    this.time.addEvent({
      delay: 1000, // Каждую секунду
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });

    // ===== ОБРАБОТКА СТОЛКНОВЕНИЙ =====
    this.physics.add.overlap(
      this.bullets,
      this.enemies,
      (
        bullet: Phaser.GameObjects.GameObject | Phaser.Types.Physics.Arcade.GameObjectWithBody,
        enemy: Phaser.GameObjects.GameObject | Phaser.Types.Physics.Arcade.GameObjectWithBody
      ): ThisParameterType => {
        const bulletSprite = bullet as Phaser.Physics.Arcade.Image;
        const enemySprite = enemy as Phaser.Physics.Arcade.Sprite;

        if (bulletSprite.active && enemySprite.active) {
          // Деактивируем объекты при столкновении
          bulletSprite.disableBody(true, true);
          enemySprite.disableBody(true, true);
          this.updateScore(); // Увеличиваем счет
        }
      },
      undefined,
      this
    );

    // ===== СОЗДАНИЕ ИНТЕРФЕЙСА =====
    this.playerNameText = this.add.text(width - 200, 10, `Игрок: ${this.playerName}`, {
      fontSize: '18px',
      color: '#ffffff'
    });

    this.scoreText = this.add.text(width - 200, 40, `Результат: ${this.score}`, {
      fontSize: '18px',
      color: '#ffffff'
    });

    this.bestScoreText = this.add.text(width - 200, 70, `Лучший результат: ${this.bestScore}`, {
      fontSize: '18px',
      color: '#ffffff'
    });

    this.timeText = this.add.text(width - 200, 100, `Время: 0:00`, {
      fontSize: '18px',
      color: '#ffffff'
    });

    // ===== ТАЙМЕР ИГРОВОГО ВРЕМЕНИ =====
    this.timeElapsed = 0;
    this.time.addEvent({
      delay: 1000, // Каждую секунду
      callback: this.updateTime,
      callbackScope: this,
      loop: true
    });
  }

  /**
   * Основной игровой цикл
   * @param time - Текущее игровое время
   */
  update(time: number) {
    // ===== ДВИЖЕНИЕ ФОНА (ПАРАЛЛАКС) =====
    const playerSpeedX = this.player.body?.velocity.x || 0;
    this.backgroundFar.tilePositionX += playerSpeedX * 0.001;
    this.backgroundNear.tilePositionX += playerSpeedX * 0.002;
    this.backgroundFar.tilePositionY -= this.backgroundFarSpeedY;
    this.backgroundNear.tilePositionY -= this.backgroundNearSpeedY;

    // ===== УПРАВЛЕНИЕ ИГРОКОМ =====
    // Горизонтальное движение
    if (this.cursors.left?.isDown) {
      this.player.setVelocityX(-300);
      this.player.setAngle(-10); // Наклон влево
    } else if (this.cursors.right?.isDown) {
      this.player.setVelocityX(300);
      this.player.setAngle(10); // Наклон вправо
    } else {
      this.player.setVelocityX(0);
    }

    // Вертикальное движение
    if (this.cursors.up?.isDown) {
      this.player.setVelocityY(-250);
      this.player.setScale(1, 1.02); // Растягиваем при движении вверх
    } else if (this.cursors.down?.isDown) {
      this.player.setVelocityY(250);
      this.player.setScale(1, 0.98); // Сжимаем при движении вниз
    } else {
      this.player.setVelocityY(0);
      this.player.setScale(1, 1); // Возвращаем нормальный размер
    }

    // Возврат угла при остановке
    if (
      !this.cursors.left?.isDown &&
      !this.cursors.right?.isDown &&
      !this.cursors.up?.isDown &&
      !this.cursors.down?.isDown
    ) {
      this.player.setAngle(0);
    }

    // ===== СТРЕЛЬБА =====
    if (this.spaceKey?.isDown && time > this.lastFired) {
      this.fireBullet();
      this.lastFired = time + 250; // Задержка между выстрелами 250 мс
    }
  }

  /**
   * Создание и выстрел пули
   */
  private fireBullet() {
    const bullet = this.bullets.get(
      this.player.x,
      this.player.y - 20, // Чуть выше игрока
      'bullet'
    ) as Phaser.Physics.Arcade.Image;

    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-400); // Движение вверх
      bullet.setScale(0.5); // Уменьшенный размер
    }
  }

  /**
   * Создание нового врага
   */
  private spawnEnemy() {
    const x = Phaser.Math.Between(50, this.scale.width - 50); // Случайная позиция по X
    const enemy = this.enemies.create(x, -50, 'enemy') as Phaser.Physics.Arcade.Sprite;
    enemy.setVelocityY(100); // Движение вниз
    enemy.setScale(0.8); // Уменьшенный размер
  }

  /**
   * Обновление игрового времени
   */
  private updateTime() {
    this.timeElapsed++;
    const minutes = Math.floor(this.timeElapsed / 60);
    const seconds = this.timeElapsed % 60;
    this.timeText.setText(
      `Время: ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    );
  }

  /**
   * Обновление счета игрока
   */
  private updateScore() {
    this.score++;
    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      this.bestScoreText.setText(`Лучший результат: ${this.bestScore}`);
      localStorage.setItem('bestScore', this.bestScore.toString()); // Сохраняем в localStorage
    }
    this.scoreText.setText(`Результат: ${this.score}`);
  }

  /**
   * Очистка при завершении сцены
   */
  shutdown() {
    // Удаляем текстовые элементы
    this.playerNameText.destroy();
    this.scoreText.destroy();
    this.bestScoreText.destroy();
    this.timeText.destroy();
  }
}
