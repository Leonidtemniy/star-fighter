import Phaser from 'phaser';
import globals from '../globals';

export default class MainMenuScene extends Phaser.Scene {
  private playerNameInput!: HTMLInputElement;
  private startButton!: Phaser.GameObjects.Text;

  constructor() {
    super('MainMenuScene');
  }

  preload() {
    // Загружаем музыку
    this.load.audio('backgroundMusic', 'assets/audio/music.mp3');

    //  Обеспечиваем корректный запуск звука по пользовательскому взаимодействию
    this.input.once('pointerdown', this.initAudioContext, this);
  }

  create() {
    const { width, height } = this.scale;

    //  Запускаем фоновую музыку
    if (!globals.backgroundMusic) {
      globals.backgroundMusic = this.sound.add('backgroundMusic', {
        loop: true,
        volume: 0.5
      });
      globals.backgroundMusic.play();
    }

    this.sound.pauseOnBlur = false;

    this.add
      .text(width / 2, 100, 'STAR FIGHTER', {
        fontSize: '48px',
        color: '#ffffff'
      })
      .setOrigin(0.5);

    this.playerNameInput = document.createElement('input');
    this.playerNameInput.type = 'text';
    this.playerNameInput.placeholder = 'Ваше имя';
    this.playerNameInput.style.position = 'absolute';
    this.playerNameInput.style.top = `${height / 2 - 20}px`;
    this.playerNameInput.style.left = `${width / 2 - 100}px`;
    this.playerNameInput.style.width = '200px';
    this.playerNameInput.style.fontSize = '18px';
    this.playerNameInput.style.padding = '8px';
    this.playerNameInput.maxLength = 20;
    document.body.appendChild(this.playerNameInput);

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
  }

  initAudioContext() {
    // 💡 Проверяем, действительно ли sound — это WebAudioSoundManager
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
