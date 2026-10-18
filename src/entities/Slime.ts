import Phaser from 'phaser';
import { SLIME } from '../config';
import { Health } from '../systems/Health';
import type { Player } from './Player';

type AiState = 'wander' | 'chase' | 'return' | 'dead';

/**
 * Simple melee enemy. AI: wander near home, chase the player inside aggro range,
 * give up and walk home when dragged beyond the leash. Contact damage is applied by the scene.
 * Emits 'defeated' when killed.
 */
export class Slime extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;

  readonly health = new Health(SLIME.maxHp);
  readonly contactDamage = SLIME.contactDamage;

  private aiState: AiState = 'wander';
  private readonly home: Phaser.Math.Vector2;
  private nextDecisionAt = 0;
  private hurtUntil = 0;
  private hop: Phaser.Tweens.Tween;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'slime');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setSize(12, 8).setOffset(2, 7);
    this.setCollideWorldBounds(true);
    this.home = new Phaser.Math.Vector2(x, y);

    this.hop = scene.tweens.add({
      targets: this,
      scaleX: 1.12,
      scaleY: 0.86,
      duration: 260,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  get isDead(): boolean {
    return this.aiState === 'dead';
  }

  updateAI(player: Player, time: number): void {
    if (this.isDead || time < this.hurtUntil) return;

    const toPlayer = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
    const toHome = Phaser.Math.Distance.Between(this.x, this.y, this.home.x, this.home.y);
    const playerVisible = !player.health.dead && toPlayer < SLIME.aggroRange;

    if (this.aiState === 'chase' && (!playerVisible || toHome > SLIME.leashRange)) {
      this.aiState = 'return';
    } else if (this.aiState === 'wander' && playerVisible) {
      this.aiState = 'chase';
    } else if (this.aiState === 'return' && toHome < 12) {
      this.aiState = 'wander';
    }

    switch (this.aiState) {
      case 'chase':
        this.scene.physics.moveToObject(this, player, SLIME.chaseSpeed);
        break;
      case 'return':
        this.scene.physics.moveTo(this, this.home.x, this.home.y, SLIME.wanderSpeed * 1.5);
        break;
      case 'wander':
        if (time >= this.nextDecisionAt) {
          this.nextDecisionAt = time + Phaser.Math.Between(700, 1800);
          if (Math.random() < 0.4) {
            this.body.setVelocity(0, 0);
          } else {
            const angle = Math.random() * Math.PI * 2;
            this.body.setVelocity(Math.cos(angle) * SLIME.wanderSpeed, Math.sin(angle) * SLIME.wanderSpeed);
          }
        }
        // Drift back toward home if wandering strays too far.
        if (toHome > 60) this.scene.physics.moveTo(this, this.home.x, this.home.y, SLIME.wanderSpeed);
        break;
    }
    if (this.body.velocity.x !== 0) this.setFlipX(this.body.velocity.x < 0);
  }

  takeHit(amount: number, fromX: number, fromY: number, time: number): void {
    if (this.isDead) return;
    this.health.damage(amount);
    this.aiState = 'chase'; // getting hit always aggroes
    this.knockAway(fromX, fromY, SLIME.knockback, time + SLIME.hurtMs);
    this.setTintFill(0xffffff);
    this.scene.time.delayedCall(80, () => this.active && this.clearTint());

    if (this.health.dead) this.die();
  }

  /** Recoil after landing a bite, so it doesn't sit on top of the player. */
  bounceOff(fromX: number, fromY: number, time: number): void {
    if (!this.isDead) this.knockAway(fromX, fromY, SLIME.knockback * 0.6, time + 450);
  }

  private knockAway(fromX: number, fromY: number, speed: number, until: number): void {
    this.hurtUntil = until;
    const away = new Phaser.Math.Vector2(this.x - fromX, this.y - fromY).normalize().scale(speed);
    this.body.setVelocity(away.x, away.y);
  }

  private die(): void {
    this.aiState = 'dead';
    this.body.enable = false;
    this.hop.stop();

    const burst = this.scene.add.particles(this.x, this.y, 'spark', {
      speed: { min: 30, max: 110 },
      lifespan: 450,
      scale: { start: 1.2, end: 0 },
      tint: [0x4fd1b5, 0x9ff5e4, 0xb48cff],
      emitting: false,
    });
    burst.setDepth(this.depth + 1);
    burst.explode(18);
    this.scene.time.delayedCall(600, () => burst.destroy());

    this.scene.tweens.add({
      targets: this,
      scaleX: 1.6,
      scaleY: 0.2,
      alpha: 0,
      duration: 260,
      onComplete: () => {
        this.emit('defeated', this);
        this.destroy();
      },
    });
  }
}
