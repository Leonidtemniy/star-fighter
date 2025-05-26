// Импорт модулей Phaser и пользовательских сущностей
import Phaser from 'phaser';
import { fireBullet } from '../entities/Bullet';
import { spawnEnemy } from '../entities/Enemy';
import { spawnAsteroid } from '../entities/Asteroid';
import { BlackHoleSprite } from '../entities/BlackHole';

export default class MainScene extends Phaser.Scene {
  // Объекты фона
  private backgroundFar!: Phaser.GameObjects.TileSprite;
  private backgroundNear!: Phaser.GameObjects.TileSprite;

  // Игрок
  private player!: Phaser.Physics.Arcade.Sprite;

  // Черная дыра
  private blackHole!: BlackHoleSprite;

  // Управление
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private spaceKey!: Phaser.Input.Keyboard.Key;

  // Группы игровых объектов
  private bullets!: Phaser.Physics.Arcade.Group;
  private enemies!: Phaser.Physics.Arcade.Group;
  private asteroids!: Phaser.Physics.Arcade.Group;

  // Скорости движения фона (эффект параллакса)
  private backgroundFarSpeedY = 0.1;
  private backgroundNearSpeedY = 0.5;

  // Игровые данные
  private playerName: string;
  private score: number;
  private bestScore: number;
  private timeElapsed: number;

  // Элементы пользовательского интерфейса
  private playerNameText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private bestScoreText!: Phaser.GameObjects.Text;
  private timeText!: Phaser.GameObjects.Text;

  // Таймер стрельбы
  private lastFired = 0;

  constructor() {
    super('MainScene');
    this.playerName = '';
    this.score = 0;
    this.bestScore = 0;
    this.timeElapsed = 0;
  }

  // Получение имени игрока из предыдущей сцены
  init(data: { playerName: string }) {
    this.playerName = data.playerName || 'Игрок';
  }

  // Загрузка ассетов
  preload() {
    this.load.image('backgroundFar', 'assets/backgroundFar.png');
    this.load.image('backgroundNear', 'assets/backgroundNear.png');
    this.load.image('player', 'assets/player.png');
    this.load.image('bullet', 'assets/bullet.png');
    this.load.image('enemy', 'assets/enemy.png');
    this.load.image('asteroid', 'assets/asteroid.png');
    this.load.image('blackhole', 'assets/blackhole.png');

    // Используем одиночное изображение, поэтому спрайт-лист закомментирован
    // this.load.spritesheet('blackhole', 'assets/blackhole.png', {
    //   frameWidth: 10,
    //   frameHeight: 10
    // });
  }

  // Создание игровой сцены
  create() {
    const { width, height } = this.scale;

    // Фоновое изображение (дальний и ближний фон)
    this.backgroundFar = this.add
      .tileSprite(0, 0, width, height, 'backgroundFar')
      .setOrigin(0, 0)
      .setTint(0x800080); // Добавлен оттенок

    this.backgroundNear = this.add
      .tileSprite(0, 0, width, height, 'backgroundNear')
      .setOrigin(0, 0)
      .setAlpha(0.4); // Прозрачность ближнего слоя

    // Игрок
    this.player = this.physics.add.sprite(width / 2, height - 100, 'player');
    this.player.setCollideWorldBounds(true);

    // Клавиши управления
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Группы объектов
    this.bullets = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
      runChildUpdate: true
    });
    this.enemies = this.physics.add.group();
    this.asteroids = this.physics.add.group();

    // Создание черной дыры
    this.blackHole = new BlackHoleSprite(this, width / 2, height / 2);

    // Периодический спавн врагов
    this.time.addEvent({
      delay: 1000,
      callback: () => spawnEnemy(this, this.enemies),
      callbackScope: this,
      loop: true
    });

    // Периодический спавн астероидов
    this.time.addEvent({
      delay: 2000,
      callback: () => spawnAsteroid(this, this.asteroids),
      loop: true
    });

    // Обработка столкновений
    this.physics.add.overlap(this.bullets, this.enemies, (bullet, enemy) => {
      bullet.destroy();
      enemy.destroy();
      this.updateScore();
    });

    this.physics.add.overlap(this.player, this.asteroids, () => {
      this.gameOver();
    });

    this.physics.add.overlap(this.blackHole, this.enemies, (_, enemy) => {
      enemy.destroy();
    });

    this.physics.add.overlap(this.blackHole, this.asteroids, (_, asteroid) => {
      asteroid.destroy();
    });

    this.physics.add.overlap(this.player, this.blackHole, () => {
      this.gameOver();
    });

    // Отображение интерфейса
    this.createUI();
  }

  // Отрисовка элементов UI
  private createUI() {
    const { width } = this.scale;

    this.playerNameText = this.add.text(width - 200, 10, `Игрок: ${this.playerName}`, {
      fontSize: '18px',
      color: '#ffffff'
    });

    this.scoreText = this.add.text(width - 200, 40, `Результат: ${this.score}`, {
      fontSize: '18px',
      color: '#ffffff'
    });

    this.bestScoreText = this.add.text(width - 200, 70, `Лучший сегодня: ${this.bestScore}`, {
      fontSize: '18px',
      color: '#ffffff'
    });

    this.timeText = this.add.text(width - 200, 100, `Время: 00:00`, {
      fontSize: '18px',
      color: '#ffffff'
    });

    // Таймер обновления времени
    this.time.addEvent({
      delay: 1000,
      callback: this.updateTime,
      callbackScope: this,
      loop: true
    });
  }

  // Основной игровой цикл
  update(time: number) {
    // Эффект параллакса при движении игрока
    const playerSpeedX = this.player.body?.velocity.x || 0;
    this.backgroundFar.tilePositionX += playerSpeedX * 0.001;
    this.backgroundNear.tilePositionX += playerSpeedX * 0.002;
    this.backgroundFar.tilePositionY -= this.backgroundFarSpeedY;
    this.backgroundNear.tilePositionY -= this.backgroundNearSpeedY;

    // Обработка ввода
    this.handlePlayerMovement();

    // Обработка стрельбы
    if (this.spaceKey.isDown && time > this.lastFired) {
      fireBullet(this, this.bullets, this.player);
      this.lastFired = time + 250;
    }

    // Притяжение объектов к черной дыре
    this.blackHole.attract([
      ...(this.enemies.getChildren() as Phaser.Physics.Arcade.Sprite[]),
      ...(this.asteroids.getChildren() as Phaser.Physics.Arcade.Sprite[])
    ]);
  }

  // Движение игрока
  private handlePlayerMovement() {
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-300).setAngle(-10);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(300).setAngle(10);
    } else {
      this.player.setVelocityX(0).setAngle(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-250).setScale(1, 1.02);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(250).setScale(1, 0.98);
    } else {
      this.player.setVelocityY(0).setScale(1, 1);
    }
  }

  // Обновление таймера
  private updateTime() {
    this.timeElapsed++;
    const minutes = Math.floor(this.timeElapsed / 60);
    const seconds = this.timeElapsed % 60;
    this.timeText.setText(
      `Время: ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    );
  }

  // Обновление счёта
  private updateScore() {
    this.score++;
    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      this.bestScoreText.setText(`Лучший сегодня: ${this.bestScore}`);
    }
    this.scoreText.setText(`Результат: ${this.score}`);
  }

  // Завершение игры
  private gameOver() {
    localStorage.setItem('bestScore', this.bestScore.toString());

    //this.sound.stopAll(); // Остановка всех звуков
    this.anims.destroy(); // Удаление всех анимаций

    this.scene.start('GameOverScene', {
      score: this.score,
      playerName: this.playerName,
      bestScore: this.bestScore
    });
  }

  // Очистка ресурсов при выходе
  shutdown() {
    [this.playerNameText, this.scoreText, this.bestScoreText, this.timeText].forEach(text =>
      text.destroy()
    );
    this.blackHole.destroy();
  }
}
