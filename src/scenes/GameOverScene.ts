import Phaser from 'phaser';

export default class GameOverScene extends Phaser.Scene {
  private finalScore!: number;
  private playerName!: string;

  constructor() {
    super('GameOverScene');
  }

  init(data: { score: number; playerName: string }) {
    this.finalScore = data.score;
    this.playerName = data.playerName;
  }

  create() {
    const { width, height } = this.scale;

    // Темный фон
    this.add.rectangle(0, 0, width, height, 0x000000, 0.7).setOrigin(0);

    // Тексты
    this.add
      .text(width / 2, height / 3, 'ИГРА ОКОНЧЕНА', {
        fontSize: '64px',
        color: '#ff5555',
        fontStyle: 'bold'
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 - 50, `Игрок: ${this.playerName}`, {
        fontSize: '32px',
        color: '#ffffff'
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2, `Результат: ${this.finalScore}`, {
        fontSize: '32px',
        color: '#ffffff'
      })
      .setOrigin(0.5);

    // Кнопка возврата
    const menuButton = this.add
      .text(width / 2, (height * 2) / 3, 'ГЛАВНОЕ МЕНЮ', {
        fontSize: '32px',
        color: '#000000',
        backgroundColor: '#00ff99',
        padding: { x: 20, y: 10 },
        fontStyle: 'bold'
      })
      .setOrigin(0.5)
      .setInteractive();

    menuButton.on('pointerover', () => {
      menuButton.setBackgroundColor('#00cc77');
    });

    menuButton.on('pointerout', () => {
      menuButton.setBackgroundColor('#00ff99');
    });

    menuButton.on('pointerdown', () => {
      this.scene.start('MainMenuScene');
    });

    // Сохранение результата
    this.saveScore();
  }

  private async saveScore() {
    try {
      await fetch('http://localhost:3001/save-score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: this.playerName,
          score: this.finalScore
        })
      });
    } catch (err) {
      console.error('Ошибка сохранения:', err);
    }
  }
}
