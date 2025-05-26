import Phaser from 'phaser';

// Сцена окончания игры
export default class GameOverScene extends Phaser.Scene {
  // Переменные для хранения финального счета и имени игрока
  private finalScore!: number;
  private playerName!: string;

  // Название сцены
  constructor() {
    super('GameOverScene');
  }

  // Инициализация сцены с данными из предыдущей (MainScene)
  init(data: { score: number; playerName: string }) {
    this.finalScore = data.score; // сохраняем итоговый счет
    this.playerName = data.playerName; // сохраняем имя игрока
  }

  // Метод создания элементов сцены
  create() {
    const { width, height } = this.scale;

    // --- ЗАДНИЙ ФОН ---
    // Полупрозрачный черный фон на весь экран
    this.add.rectangle(0, 0, width, height, 0x000000, 0.7).setOrigin(0);

    // --- ТЕКСТ "ИГРА ОКОНЧЕНА" ---
    this.add
      .text(width / 2, height / 3, 'ИГРА ОКОНЧЕНА', {
        fontSize: '64px',
        color: '#ff5555',
        fontStyle: 'bold'
      })
      .setOrigin(0.5);

    // --- ИМЯ ИГРОКА ---
    this.add
      .text(width / 2, height / 2 - 50, `Игрок: ${this.playerName}`, {
        fontSize: '32px',
        color: '#ffffff'
      })
      .setOrigin(0.5);

    // --- РЕЗУЛЬТАТ ИГРЫ ---
    this.add
      .text(width / 2, height / 2, `Результат: ${this.finalScore}`, {
        fontSize: '32px',
        color: '#ffffff'
      })
      .setOrigin(0.5);

    // --- КНОПКА ВОЗВРАТА В МЕНЮ ---
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

    // --- НАВЕДЕНИЕ НА КНОПКУ ---
    menuButton.on('pointerover', () => {
      menuButton.setBackgroundColor('#00cc77'); // изменить цвет при наведении
    });

    // --- УБРАТЬ НАВЕДЕНИЕ ---
    menuButton.on('pointerout', () => {
      menuButton.setBackgroundColor('#00ff99'); // вернуть исходный цвет
    });

    // --- НАЖАТИЕ НА КНОПКУ ---
    menuButton.on('pointerdown', () => {
      this.scene.start('MainMenuScene'); // переход в главное меню
    });

    // --- СОХРАНЕНИЕ РЕЗУЛЬТАТА ---
    this.saveScore(); // вызов метода отправки результата на сервер
  }

  // --- МЕТОД СОХРАНЕНИЯ РЕЗУЛЬТАТА ---
  private async saveScore() {
    try {
      await fetch('http://localhost:3001/save-score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: this.playerName, // имя игрока
          score: this.finalScore // финальный счет
        })
      });
    } catch (err) {
      console.error('Ошибка сохранения:', err); // обработка ошибок
    }
  }
}
