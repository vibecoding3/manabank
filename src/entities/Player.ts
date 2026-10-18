import Phaser from 'phaser';
import { PLAYER } from '../config';
import { Health } from '../systems/Health';
import type { Controls } from '../systems/Controls';

export class Player extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;

  readonly health = new Health(PLAYER.maxHp);
  /** Last non-zero movement direction; attacks go this way. */
  readonly facing = new Phaser.Math.Vector2(1, 0);
  /** Set by the scene while dialogue or other UI owns input. */
  frozen = false;

  private nextAttackAt = 0;
  private invulnerableUntil = 0;
  private stunnedUntil = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setSize(10, 7).setOffset(3, 9);
    this.setCollideWorldBounds(true);
  }

  update(controls: Controls, time: number): void {
    this.setAlpha(time < this.invulnerableUntil && Math.floor(time / 80) % 2 === 0 ? 0.35 : 1);
    if (this.health.dead || time < this.stunnedUntil) return;

    const dir = this.frozen ? Phaser.Math.Vector2.ZERO : controls.direction();
    this.body.setVelocity(dir.x * PLAYER.speed, dir.y * PLAYER.speed);
    if (dir.lengthSq() > 0) {
      this.facing.copy(dir);
      if (dir.x !== 0) this.setFlipX(dir.x < 0);
      // Cheap walk bob until real animation frames exist.
      this.setOrigin(0.5, 0.5 + (Math.floor(time / 120) % 2) * 0.06);
    } else {
      this.setOrigin(0.5, 0.5);
    }
  }

  /** Starts a sword swing if off cooldown and returns the world-space hitbox, or null. */
  tryAttack(time: number): Phaser.Geom.Rectangle | null {
    if (this.frozen || this.health.dead || time < this.nextAttackAt) return null;
    this.nextAttackAt = time + PLAYER.attackCooldownMs;

    const cx = this.x + this.facing.x * PLAYER.attackReach;
    const cy = this.y + 2 + this.facing.y * PLAYER.attackReach;
    const slash = this.scene.add
      .image(cx, cy, 'slash')
      .setRotation(this.facing.angle())
      .setDepth(this.depth + 1);
    this.scene.tweens.add({
      targets: slash,
      alpha: 0,
      scale: 1.35,
      duration: 160,
      onComplete: () => slash.destroy(),
    });

    const s = PLAYER.attackSize;
    return new Phaser.Geom.Rectangle(cx - s / 2, cy - s / 2, s, s);
  }

  /** Applies damage with knockback. Returns false if ignored (invulnerable or already dead). */
  takeHit(amount: number, fromX: number, fromY: number, time: number): boolean {
    if (this.health.dead || time < this.invulnerableUntil) return false;
    this.health.damage(amount);
    this.invulnerableUntil = time + PLAYER.invulnerableMs;
    this.stunnedUntil = time + 160;

    const away = new Phaser.Math.Vector2(this.x - fromX, this.y - fromY).normalize().scale(PLAYER.knockback);
    this.body.setVelocity(away.x, away.y);
    this.setTintFill(0xffffff);
    this.scene.time.delayedCall(90, () => this.clearTint());

    if (this.health.dead) {
      this.body.setVelocity(0, 0);
      this.scene.time.delayedCall(100, () => this.setTint(0x666677).setAngle(90));
    }
    return true;
  }
}
