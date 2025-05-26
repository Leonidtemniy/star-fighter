import Phaser from 'phaser';
import globals from '../globals';

// Интерфейс звезды с дополнительным полем скорости
interface StarGraphic extends Phaser.GameObjects.Graphics {
  speed: number;
}

// Главная сцена меню
export default class MainMenuScene extends Phaser.Scene {
  private playerNameInput!: HTMLInputElement; // HTML поле ввода имени
  private startButton!: Phaser.GameObjects.Text; // Кнопка "Старт"
  private stars: StarGraphic[] = []; // Массив звёзд
  private maxStars = 100; // Максимальное количество звёзд
  private leaderboardText!: Phaser.GameObjects.Text; // Текстовое поле для рейтинга
  private leaderboardData: Array<{ name: string; score: number }> = []; // Данные рейтинга

  constructor() {
    super('MainMenuScene'); // Название сцены
  }

  preload() {
    // Загрузка фоновой музыки
    this.load.audio('backgroundMusic', 'assets/audio/music.mp3');
    // Инициализация аудиоконтекста при первом клике
    this.input.once('pointerdown', this.initAudioContext, this);
  }

  create() {
    const { width, height } = this.scale;

    // --- СОЗДАНИЕ ЗВЁЗД НА ЗАДНЕМ ФОНЕ ---
    for (let i = 0; i < this.maxStars; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const star = this.add.graphics({ x, y }) as StarGraphic;

      const size = Phaser.Math.FloatBetween(1, 2);
      const alpha = Phaser.Math.FloatBetween(0.3, 1);

      star.fillStyle(0xffffff, alpha);
      star.fillCircle(0, 0, size);
      star.speed = Phaser.Math.FloatBetween(0.2, 1.2);

      this.stars.push(star);
    }

    // --- ВКЛЮЧАЕМ ФОНОВУЮ МУЗЫКУ ---
    if (!globals.backgroundMusic) {
      globals.backgroundMusic = this.sound.add('backgroundMusic', {
        loop: true,
        volume: 0.5
      });
      globals.backgroundMusic.play();
    }
    this.sound.pauseOnBlur = false; // Не останавливать музыку при потере фокуса окна

    // --- ТЕКСТ ЗАГОЛОВКА ИГРЫ ---
    this.add
      .text(width / 2, 100, 'STAR FIGHTER', {
        fontSize: '48px',
        fontFamily: 'Arial',
        color: '#ffffff',
        shadow: {
          offsetX: 2,
          offsetY: 2,
          color: 'green',
          blur: 6,
          fill: true
        }
      })
      .setOrigin(0.5);

    // --- HTML ПОЛЕ ВВОДА ИМЕНИ ИГРОКА ---
    this.playerNameInput = document.createElement('input');
    this.playerNameInput.type = 'text';
    this.playerNameInput.placeholder = 'Ваше имя';
    this.playerNameInput.className = 'player-name-input';
    document.body.appendChild(this.playerNameInput);

    // --- КНОПКА "СТАРТ" ДЛЯ НАЧАЛА ИГРЫ ---
    this.startButton = this.add
      .text(width / 2, height / 2 + 50, 'СТАРТ', {
        fontSize: '28px',
        backgroundColor: '#00ff99',
        padding: { x: 20, y: 10 },
        color: '#000'
      })
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerdown', () => {
        const playerName = this.playerNameInput.value.trim();
        if (playerName.length === 0) {
          alert('Пожалуйста, введите имя!');
          return;
        }

        // Удаляем поле ввода и запускаем основную сцену
        document.body.removeChild(this.playerNameInput);
        this.scene.start('MainScene', { playerName });
      });

    // --- СОЗДАНИЕ И ЗАГРУЗКА РЕЙТИНГА ИГРОКОВ ---
    this.createLeaderboard();
    this.loadLeaderboard();
  }

  // Метод для создания элементов рейтинга (заголовок, фон, текст)
  private createLeaderboard() {
    const { width } = this.scale;

    // Фоновый прямоугольник
    this.add.rectangle(width - 200, 160, 220, 160, 0x000000, 0.6).setOrigin(0.5, 0);

    // Заголовок таблицы лидеров
    this.add
      .text(width - 200, 130, 'ТОП ИГРОКОВ', {
        fontSize: '24px',
        color: 'white',
        fontStyle: 'bold',
        shadow: {
          offsetX: 2,
          offsetY: 2,
          color: 'green',
          blur: 6,
          fill: true
        }
      })
      .setOrigin(0.5);

    // Текст для отображения рейтинга
    this.leaderboardText = this.add
      .text(width - 200, 160, 'Загрузка...', {
        fontSize: '18px',
        color: '#ffffff',
        wordWrap: { width: 180 },
        lineSpacing: 10
      })
      .setOrigin(0.5, 0);
  }

  // Асинхронная загрузка данных рейтинга с сервера
  async loadLeaderboard() {
    try {
      const response = await fetch('http://localhost:3001/leaderboard');
      if (!response.ok) throw new Error('Ошибка сервера');

      const data = await response.json();
      console.log('Получен рейтинг:', data);

      this.leaderboardData = data; // Сохраняем данные
      this.updateLeaderboard(); // Отображаем
    } catch (error) {
      console.error('Ошибка загрузки рейтинга:', error);
      this.leaderboardText.setText('Ошибка загрузки\nрейтинга');
    }
  }

  // Обновление текстового отображения рейтинга
  private updateLeaderboard() {
    if (this.leaderboardData.length === 0) {
      this.leaderboardText.setText('Нет данных\nо рейтинге');
      return;
    }

    let leaderboardString = '';
    const sorted = [...this.leaderboardData].sort((a, b) => b.score - a.score);

    sorted.slice(0, 5).forEach((player, index) => {
      const namePadding = ' '.repeat(15 - player.name.length);
      const scorePadding = ' '.repeat(5 - player.score.toString().length);

      leaderboardString += `${index + 1}. ${player.name}${namePadding}: ${
        player.score
      }${scorePadding}\n`;
    });

    // Применяем стили и обновляем текст
    this.leaderboardText.setText(leaderboardString);
    this.leaderboardText.setStyle({
      wordWrap: { width: 280 },
      lineSpacing: 3,
      fontSize: '15px',
      color: '#ffffff',
      align: 'left'
    });
  }

  // Обновление позиции звёзд (анимация движения вниз)
  update() {
    for (const star of this.stars) {
      star.y += star.speed;
      if (star.y > this.scale.height) {
        star.y = 0;
        star.x = Phaser.Math.Between(0, this.scale.width);
      }
    }
  }

  // Инициализация WebAudio (требуется для некоторых браузеров)
  initAudioContext() {
    if (this.sound instanceof Phaser.Sound.WebAudioSoundManager) {
      if (this.sound.context.state === 'suspended') {
        this.sound.context.resume().then(() => {
          console.log('Audio context resumed');
        });
      }
    }
  }

  // Метод очистки HTML-элементов
  shutdown() {
    if (this.playerNameInput && this.playerNameInput.parentNode) {
      this.playerNameInput.parentNode.removeChild(this.playerNameInput);
    }
  }

  // Метод уничтожения сцены (с вызовом shutdown)
  destroy() {
    this.shutdown();
  }
}
