import Phaser from 'phaser';

/** A stationary, solid character the player can talk to. */
export class Npc extends Phaser.Physics.Arcade.Sprite {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    readonly displayName: string,
  ) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this, true);
    const body = this.body as Phaser.Physics.Arcade.StaticBody;
    body.setSize(12, 7).setOffset(2, 9);

    // Idle breathing.
    scene.tweens.add({ targets: this, scaleY: 1.04, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }
}
