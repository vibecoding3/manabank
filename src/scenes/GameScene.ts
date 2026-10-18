import Phaser from 'phaser';
import { HudKey, INTERACT_RANGE, PLAYER, SOLID_TILES, TILE, WORLD_ZOOM, type DialogueView } from '../config';
import { Npc } from '../entities/Npc';
import { Player } from '../entities/Player';
import { Slime } from '../entities/Slime';
import { Controls } from '../systems/Controls';
import { ELDER } from '../world/dialogue';
import { buildLevel } from '../world/level';

interface ActiveDialogue {
  speaker: string;
  lines: string[];
  index: number;
  onClose?: () => void;
}

/**
 * The playable world. Owns entities, collisions, combat resolution and dialogue flow.
 * Publishes HUD state through the game registry (see HudKey); UIScene renders it.
 */
export class GameScene extends Phaser.Scene {
  private controls!: Controls;
  private player!: Player;
  private enemies!: Phaser.GameObjects.Group;
  private elder!: Npc;
  private dialogue: ActiveDialogue | null = null;
  private story = { metElder: false, slimeDefeated: false, rewarded: false };

  constructor() {
    super('Game');
  }

  create(): void {
    this.dialogue = null;
    this.story = { metElder: false, slimeDefeated: false, rewarded: false };
    this.controls = new Controls(this);

    // World
    const level = buildLevel();
    const map = this.make.tilemap({ data: level.tiles, tileWidth: TILE, tileHeight: TILE });
    const tileset = map.addTilesetImage('tiles', 'tiles', TILE, TILE, 0, 0)!;
    const ground = map.createLayer(0, tileset, 0, 0)!;
    ground.setCollision(SOLID_TILES);
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // Entities
    this.player = new Player(this, level.playerSpawn.x, level.playerSpawn.y);
    this.elder = new Npc(this, level.npcSpawn.x, level.npcSpawn.y, 'elder', ELDER.name);
    this.enemies = this.add.group();
    for (const spawn of level.enemySpawns) {
      const slime = new Slime(this, spawn.x, spawn.y);
      slime.once('defeated', () => this.onEnemyDefeated());
      this.enemies.add(slime);
    }

    // Collisions
    this.physics.add.collider(this.player, ground);
    this.physics.add.collider(this.player, this.elder);
    this.physics.add.collider(this.enemies, ground);
    this.physics.add.collider(this.enemies, this.elder);
    this.physics.add.collider(this.player, this.enemies, (_p, e) => {
      const enemy = e as Slime;
      if (this.player.takeHit(enemy.contactDamage, enemy.x, enemy.y, this.time.now)) {
        enemy.bounceOff(this.player.x, this.player.y, this.time.now);
        this.onPlayerHurt();
      }
    });

    // Camera
    const cam = this.cameras.main;
    cam.setZoom(WORLD_ZOOM).setBounds(0, 0, map.widthInPixels, map.heightInPixels).setRoundPixels(true);
    cam.startFollow(this.player, true, 0.12, 0.12);
    cam.fadeIn(300, 13, 11, 20);

    // HUD state
    this.setHud(HudKey.MAX_HP, PLAYER.maxHp);
    this.setHud(HudKey.HP, this.player.health.current);
    this.setHud(HudKey.OBJECTIVE, 'Speak with Elder Moss');
    this.setHud(HudKey.PROMPT, '');
    this.setHud(HudKey.DIALOGUE, null);
    this.setHud(HudKey.GAME_OVER, false);
    if (!this.scene.isActive('UI')) this.scene.launch('UI');
  }

  update(time: number): void {
    // Read each "just pressed" input exactly once per frame.
    const attack = this.controls.attackPressed();
    const interact = this.controls.interactPressed();
    const restart = this.controls.restartPressed();

    if (this.player.health.dead) {
      if (restart) this.scene.restart();
      return;
    }

    if (this.dialogue) {
      this.player.frozen = true;
      if (interact || attack) this.advanceDialogue();
    } else {
      this.player.frozen = false;
      if (attack) {
        const hitbox = this.player.tryAttack(time);
        if (hitbox) this.resolveAttack(hitbox, time);
      }
      const nearElder =
        Phaser.Math.Distance.Between(this.player.x, this.player.y, this.elder.x, this.elder.y) < INTERACT_RANGE;
      this.setHud(HudKey.PROMPT, nearElder ? `[E] Talk to ${this.elder.displayName}` : '');
      if (nearElder && interact) this.talkToElder();
    }

    this.player.update(this.controls, time);
    for (const enemy of this.enemies.getChildren() as Slime[]) enemy.updateAI(this.player, time);

    // Y-sort so characters overlap correctly.
    this.player.setDepth(this.player.y);
    this.elder.setDepth(this.elder.y);
    for (const enemy of this.enemies.getChildren() as Slime[]) enemy.setDepth(enemy.y);
  }

  private resolveAttack(hitbox: Phaser.Geom.Rectangle, time: number): void {
    for (const enemy of this.enemies.getChildren() as Slime[]) {
      if (enemy.isDead) continue;
      if (Phaser.Geom.Intersects.RectangleToRectangle(hitbox, enemy.getBounds())) {
        enemy.takeHit(PLAYER.attackDamage, this.player.x, this.player.y, time);
        this.cameras.main.shake(70, 0.004);
      }
    }
  }

  private onPlayerHurt(): void {
    this.setHud(HudKey.HP, this.player.health.current);
    this.cameras.main.shake(120, 0.008);
    if (this.player.health.dead) {
      this.setHud(HudKey.PROMPT, '');
      this.setHud(HudKey.GAME_OVER, true);
    }
  }

  private onEnemyDefeated(): void {
    if (this.enemies.countActive() > 1) return; // the dying enemy is still in the group this frame
    this.story.slimeDefeated = true;
    this.setHud(HudKey.OBJECTIVE, 'Return to Elder Moss');
  }

  private talkToElder(): void {
    const s = this.story;
    if (s.slimeDefeated && !s.rewarded) {
      this.openDialogue(ELDER.name, ELDER.victory, () => {
        s.rewarded = true;
        this.player.health.heal(this.player.health.max);
        this.setHud(HudKey.HP, this.player.health.current);
        this.setHud(HudKey.OBJECTIVE, 'Fernvale is safe (prototype complete)');
      });
    } else if (s.rewarded) {
      this.openDialogue(ELDER.name, ELDER.after);
    } else if (s.metElder) {
      this.openDialogue(ELDER.name, ELDER.reminder);
    } else {
      this.openDialogue(ELDER.name, ELDER.intro, () => {
        s.metElder = true;
        if (!s.slimeDefeated) this.setHud(HudKey.OBJECTIVE, 'Defeat the slime in the eastern meadow');
      });
    }
  }

  private openDialogue(speaker: string, lines: string[], onClose?: () => void): void {
    this.dialogue = { speaker, lines, index: 0, onClose };
    this.player.body.setVelocity(0, 0);
    this.setHud(HudKey.PROMPT, '');
    this.showDialogueLine();
  }

  private advanceDialogue(): void {
    const d = this.dialogue!;
    d.index++;
    if (d.index < d.lines.length) {
      this.showDialogueLine();
      return;
    }
    this.dialogue = null;
    this.setHud(HudKey.DIALOGUE, null);
    d.onClose?.();
  }

  private showDialogueLine(): void {
    const d = this.dialogue!;
    const view: DialogueView = { speaker: d.speaker, text: d.lines[d.index] };
    this.setHud(HudKey.DIALOGUE, view);
  }

  /** Writes to the registry only on change so the HUD isn't redrawn every frame. */
  private setHud(key: string, value: unknown): void {
    if (this.registry.get(key) !== value || !this.registry.has(key)) this.registry.set(key, value);
  }
}
