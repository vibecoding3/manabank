import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, HudKey, type DialogueView } from '../config';

const FONT = 'monospace';

/** Screen-space HUD drawn above GameScene. Purely a view over registry values written by GameScene. */
export class UIScene extends Phaser.Scene {
  private hearts: Phaser.GameObjects.Image[] = [];
  private objective!: Phaser.GameObjects.Text;
  private prompt!: Phaser.GameObjects.Text;
  private dialogueBox!: Phaser.GameObjects.Container;
  private dialogueSpeaker!: Phaser.GameObjects.Text;
  private dialogueText!: Phaser.GameObjects.Text;
  private gameOver!: Phaser.GameObjects.Container;

  constructor() {
    super('UI');
  }

  create(): void {
    this.hearts = [];

    this.add.rectangle(GAME_WIDTH - 16, 16, 380, 40, 0x0d0b14, 0.6).setOrigin(1, 0).setStrokeStyle(1, 0x5a3f8c);
    this.add.text(GAME_WIDTH - 380, 20, 'OBJECTIVE', { fontFamily: FONT, fontSize: '11px', color: '#b9a6dc' });
    this.objective = this.add.text(GAME_WIDTH - 380, 34, '', { fontFamily: FONT, fontSize: '15px', color: '#f4e3b5' });

    this.prompt = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 150, '', {
        fontFamily: FONT,
        fontSize: '16px',
        color: '#ffffff',
        backgroundColor: '#0d0b14cc',
        padding: { x: 10, y: 6 },
      })
      .setOrigin(0.5);

    const boxW = GAME_WIDTH - 120;
    const box = this.add.rectangle(0, 0, boxW, 110, 0x15111f, 0.92).setOrigin(0).setStrokeStyle(2, 0xf4e3b5);
    this.dialogueSpeaker = this.add.text(18, 12, '', { fontFamily: 'Georgia, serif', fontSize: '18px', color: '#b9a6dc' });
    this.dialogueText = this.add.text(18, 40, '', {
      fontFamily: FONT,
      fontSize: '16px',
      color: '#f0ece4',
      wordWrap: { width: boxW - 36 },
      lineSpacing: 4,
    });
    const hint = this.add
      .text(boxW - 14, 96, '[E] continue', { fontFamily: FONT, fontSize: '12px', color: '#8f86a3' })
      .setOrigin(1, 1);
    this.dialogueBox = this.add.container(60, GAME_HEIGHT - 130, [box, this.dialogueSpeaker, this.dialogueText, hint]);

    const dim = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.6).setOrigin(0);
    const title = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20, 'You have fallen', {
        fontFamily: 'Georgia, serif',
        fontSize: '48px',
        color: '#e04a5f',
      })
      .setOrigin(0.5);
    const sub = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 36, 'Press R to try again', { fontFamily: FONT, fontSize: '18px', color: '#f0ece4' })
      .setOrigin(0.5);
    this.gameOver = this.add.container(0, 0, [dim, title, sub]);

    this.registry.events.on('setdata', this.render, this);
    this.registry.events.on('changedata', this.render, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.registry.events.off('setdata', this.render, this);
      this.registry.events.off('changedata', this.render, this);
    });
    this.render();
  }

  private render(): void {
    const r = this.registry;
    const maxHp = (r.get(HudKey.MAX_HP) as number) ?? 0;
    const hp = (r.get(HudKey.HP) as number) ?? 0;

    if (this.hearts.length !== maxHp) {
      this.hearts.forEach((h) => h.destroy());
      this.hearts = Array.from({ length: maxHp }, (_, i) => this.add.image(20 + i * 30, 22, 'heart').setOrigin(0).setScale(3));
    }
    this.hearts.forEach((h, i) => h.setTexture(i < hp ? 'heart' : 'heart-empty'));

    this.objective.setText((r.get(HudKey.OBJECTIVE) as string) ?? '');

    const promptText = (r.get(HudKey.PROMPT) as string) ?? '';
    this.prompt.setText(promptText).setVisible(promptText !== '');

    const dialogue = r.get(HudKey.DIALOGUE) as DialogueView | null;
    this.dialogueBox.setVisible(!!dialogue);
    if (dialogue) {
      this.dialogueSpeaker.setText(dialogue.speaker);
      this.dialogueText.setText(dialogue.text);
    }

    this.gameOver.setVisible(!!r.get(HudKey.GAME_OVER));
  }
}
