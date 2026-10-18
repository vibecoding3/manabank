import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super('Title');
  }

  create(): void {
    this.starting = false;
    const cx = GAME_WIDTH / 2;

    this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'tiles', 0).setOrigin(0).setTileScale(3);
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x0d0b14, 0.72).setOrigin(0);

    this.add
      .text(cx, 130, 'MANABANK', { fontFamily: 'Georgia, serif', fontSize: '72px', color: '#f4e3b5' })
      .setOrigin(0.5)
      .setStroke('#2a1d3a', 8)
      .setShadow(0, 4, '#000000', 6, true, true);
    this.add
      .text(cx, 190, 'Every spell is borrowed.', {
        fontFamily: 'Georgia, serif',
        fontSize: '22px',
        color: '#b9a6dc',
        fontStyle: 'italic',
      })
      .setOrigin(0.5);

    const knight = this.add.image(cx - 50, 270, 'player').setScale(4);
    const slime = this.add.image(cx + 50, 276, 'slime').setScale(4).setFlipX(true);
    this.tweens.add({ targets: knight, y: 264, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.tweens.add({ targets: slime, scaleY: 3.4, scaleX: 4.5, duration: 350, yoyo: true, repeat: -1 });

    const button = this.add
      .rectangle(cx, 370, 220, 56, 0x5a3f8c)
      .setStrokeStyle(3, 0xf4e3b5)
      .setInteractive({ useHandCursor: true });
    this.add
      .text(cx, 370, 'Start', { fontFamily: 'Georgia, serif', fontSize: '28px', color: '#f4e3b5' })
      .setOrigin(0.5);
    button.on('pointerover', () => button.setFillStyle(0x7556b0));
    button.on('pointerout', () => button.setFillStyle(0x5a3f8c));
    button.on('pointerdown', () => this.startGame());

    this.add
      .text(cx, 470, 'Move: WASD / Arrows    Attack: Space / J    Talk: E / Enter\nPress Enter to begin', {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#c8c2d8',
        align: 'center',
        lineSpacing: 8,
      })
      .setOrigin(0.5);

    this.input.keyboard!.once('keydown-ENTER', () => this.startGame());
    this.input.keyboard!.once('keydown-SPACE', () => this.startGame());
  }

  private starting = false;

  private startGame(): void {
    if (this.starting) return;
    this.starting = true;
    this.cameras.main.fadeOut(250, 13, 11, 20);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => this.scene.start('Game'));
  }
}
