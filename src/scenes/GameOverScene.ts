// src/scenes/GameOverScene.ts
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

  preload() {
    // Здесь можно загрузить фоны, музыку, кнопки
  }

  create() {
    const { width } = this.scale;

    this.add.text(width / 2, 100, 'ИГРА ОКОНЧЕНА', {
      fontSize: '48px',
      color: '#ff5555',
    }).setOrigin(0.5);

    this.add.text(width / 2, 180, `Игрок: ${this.playerName}`, {
      fontSize: '24px',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.add.text(width / 2, 220, `Очки: ${this.finalScore}`, {
      fontSize: '24px',
      color: '#ffffff',
    }).setOrigin(0.5);

  

    // Отправка результата в базу
    this.saveScore(this.playerName, this.finalScore);
  }

  private async saveScore(name: string, score: number) {
    try {
      await fetch('http://localhost:3000/api/scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, score }),
      });
    } catch (err) {
      console.error('Ошибка при сохранении результата:', err);
    }
  }
}