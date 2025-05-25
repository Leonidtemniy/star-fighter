import Phaser from 'phaser';
import globals from '../globals';

interface StarGraphic extends Phaser.GameObjects.Graphics {
  speed: number;
}

export default class MainMenuScene extends Phaser.Scene {
  private playerNameInput!: HTMLInputElement;
  private startButton!: Phaser.GameObjects.Text;
  private stars: StarGraphic[] = [];
  private maxStars = 100;
  private leaderboardText!: Phaser.GameObjects.Text;
  private leaderboardData: Array<{ name: string; score: number }> = [];

  constructor() {
    super('MainMenuScene');
  }

  preload() {
    this.load.audio('backgroundMusic', 'assets/audio/music.mp3');
    this.input.once('pointerdown', this.initAudioContext, this);
  }

  create() {
    const { width, height } = this.scale;

    // --- ЗВЁЗДЫ ---
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

    // --- МУЗЫКА ---
    if (!globals.backgroundMusic) {
      globals.backgroundMusic = this.sound.add('backgroundMusic', {
        loop: true,
        volume: 0.5
      });
      globals.backgroundMusic.play();
    }
    this.sound.pauseOnBlur = false;

    // --- ЗАГОЛОВОК ---
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

    // --- HTML input ---
    this.playerNameInput = document.createElement('input');
    this.playerNameInput.type = 'text';
    this.playerNameInput.placeholder = 'Ваше имя';
    this.playerNameInput.className = 'player-name-input';
    document.body.appendChild(this.playerNameInput);

    // --- КНОПКА СТАРТА ---
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

        document.body.removeChild(this.playerNameInput);
        this.scene.start('MainScene', { playerName });
      });

    // --- ТАБЛИЦА ЛИДЕРОВ ---
    this.createLeaderboard();
    this.loadLeaderboard();
  }

  private createLeaderboard() {
    const { width } = this.scale;

    // Фон для рейтинга
    this.add.rectangle(width - 200, 160, 220, 160, 0x000000, 0.6).setOrigin(0.5, 0);

    // Заголовок
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

    // Поле для вывода рейтинга
    this.leaderboardText = this.add
      .text(width - 200, 160, 'Загрузка...', {
        fontSize: '18px',
        color: '#ffffff',
        wordWrap: { width: 180 },
        lineSpacing: 10
      })
      .setOrigin(0.5, 0);
  }

  async loadLeaderboard() {
    try {
      const response = await fetch('http://localhost:3001/leaderboard');
      if (!response.ok) throw new Error('Ошибка сервера');

      const data = await response.json();
      console.log('Получен рейтинг:', data);

      // здесь можешь вывести данные на экран
    } catch (error) {
      console.error('Ошибка загрузки рейтинга:', error);
    }
  }

  private updateLeaderboard() {
    if (this.leaderboardData.length === 0) {
      this.leaderboardText.setText('Нет данных\nо рейтинге');
      return;
    }

    let leaderboardString = '';
    const sorted = [...this.leaderboardData].sort((a, b) => b.score - a.score);

    sorted.slice(0, 5).forEach((player, index) => {
      const medal = ['🥇', '🥈', '🥉'][index] || '▫️';
      leaderboardString += `${medal} ${player.name}: [color=#00ff00]${player.score}[/color]\n`;
    });

    this.leaderboardText.setText(leaderboardString);
  }

  update() {
    for (const star of this.stars) {
      star.y += star.speed;
      if (star.y > this.scale.height) {
        star.y = 0;
        star.x = Phaser.Math.Between(0, this.scale.width);
      }
    }
  }

  initAudioContext() {
    if (this.sound instanceof Phaser.Sound.WebAudioSoundManager) {
      if (this.sound.context.state === 'suspended') {
        this.sound.context.resume().then(() => {
          console.log('Audio context resumed');
        });
      }
    }
  }

  shutdown() {
    if (this.playerNameInput && this.playerNameInput.parentNode) {
      this.playerNameInput.parentNode.removeChild(this.playerNameInput);
    }
  }

  destroy() {
    this.shutdown();
  }
}
