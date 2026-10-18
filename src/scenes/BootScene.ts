import Phaser from 'phaser';
import { TILE } from '../config';

type Ctx = CanvasRenderingContext2D;

/**
 * Generates all placeholder art at runtime so the prototype ships with zero asset files.
 * To swap in real art later, load images/spritesheets here under the same texture keys.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create(): void {
    this.makeTileset();
    this.canvasTexture('player', 16, 16, drawPlayer);
    this.canvasTexture('slime', 16, 16, drawSlime);
    this.canvasTexture('elder', 16, 16, drawElder);
    this.canvasTexture('slash', 16, 16, drawSlash);
    this.canvasTexture('spark', 3, 3, (c) => rect(c, '#ffffff', 0, 0, 3, 3));
    this.canvasTexture('heart', 9, 8, (c) => drawHeart(c, '#e04a5f', '#ff9aa8'));
    this.canvasTexture('heart-empty', 9, 8, (c) => drawHeart(c, '#3b2b3d', '#4d3a50'));
    this.scene.start('Title');
  }

  private canvasTexture(key: string, w: number, h: number, draw: (ctx: Ctx) => void): Phaser.Textures.CanvasTexture {
    const tex = this.textures.createCanvas(key, w, h)!;
    draw(tex.context);
    tex.refresh();
    return tex;
  }

  /** One row of 16x16 tiles, ordered to match `Tiles` in config.ts. */
  private makeTileset(): void {
    const rnd = new Phaser.Math.RandomDataGenerator(['tiles']);
    const speckle = (c: Ctx, ox: number, color: string, n: number) => {
      for (let i = 0; i < n; i++) rect(c, color, ox + rnd.between(0, TILE - 1), rnd.between(0, TILE - 1));
    };
    const grass = (c: Ctx, ox: number) => {
      rect(c, '#4f9a40', ox, 0, TILE, TILE);
      speckle(c, ox, '#3f8234', 14);
      speckle(c, ox, '#67b552', 8);
    };

    const tex = this.canvasTexture('tiles', TILE * 6, TILE, (c) => {
      // 0 grass
      grass(c, 0);
      // 1 flowers
      grass(c, 16);
      for (const [x, y, col] of [
        [3, 4, '#f4d35e'],
        [11, 9, '#f28bb5'],
        [6, 12, '#ffffff'],
      ] as const) {
        rect(c, col, 16 + x - 1, y, 3, 1);
        rect(c, col, 16 + x, y - 1, 1, 3);
        rect(c, '#c98a2e', 16 + x, y, 1, 1);
      }
      // 2 path
      rect(c, '#c9a46a', 32, 0, TILE, TILE);
      speckle(c, 32, '#a8864f', 14);
      speckle(c, 32, '#dcc08a', 6);
      // 3 water
      rect(c, '#3b6fb6', 48, 0, TILE, TILE);
      rect(c, '#6c9be0', 48 + 2, 4, 5, 1);
      rect(c, '#6c9be0', 48 + 9, 9, 5, 1);
      rect(c, '#6c9be0', 48 + 4, 13, 4, 1);
      // 4 tree
      grass(c, 64);
      rect(c, '#6b4426', 64 + 7, 11, 2, 4);
      circle(c, '#2b5f27', 64 + 8, 7, 6.5);
      circle(c, '#3f8a37', 64 + 6.5, 5.5, 3);
      // 5 rock
      grass(c, 80);
      ellipse(c, '#5f636b', 80 + 8, 11, 6.5, 4);
      ellipse(c, '#8a8f98', 80 + 8, 10, 6, 4);
      ellipse(c, '#b3b8c0', 80 + 6, 8.5, 2.5, 1.5);
    });
    // Per-tile frames so individual tiles can be used as images (e.g. title backdrop).
    for (let i = 0; i < 6; i++) tex.add(i, 0, i * TILE, 0, TILE, TILE);
  }
}

function rect(c: Ctx, color: string, x: number, y: number, w = 1, h = 1): void {
  c.fillStyle = color;
  c.fillRect(x, y, w, h);
}

function circle(c: Ctx, color: string, x: number, y: number, r: number): void {
  ellipse(c, color, x, y, r, r);
}

function ellipse(c: Ctx, color: string, x: number, y: number, rx: number, ry: number): void {
  c.fillStyle = color;
  c.beginPath();
  c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  c.fill();
}

/** Knight facing right. */
function drawPlayer(c: Ctx): void {
  rect(c, '#9c2f3a', 3, 8, 2, 6); // cape
  rect(c, '#c7ccd6', 5, 1, 6, 4); // helmet
  rect(c, '#e6e9ef', 6, 1, 3, 1);
  rect(c, '#f1c27d', 6, 5, 5, 3); // face
  rect(c, '#222222', 9, 6, 1, 1); // eye
  rect(c, '#3d6fd1', 4, 8, 8, 5); // tunic
  rect(c, '#2c56a8', 4, 12, 8, 1);
  rect(c, '#6b4426', 4, 11, 8, 1); // belt
  rect(c, '#f1c27d', 12, 9, 1, 2); // hand
  rect(c, '#4a3424', 5, 13, 2, 3); // legs
  rect(c, '#4a3424', 9, 13, 2, 3);
}

function drawSlime(c: Ctx): void {
  ellipse(c, '#2e9c86', 8, 11, 7, 5);
  ellipse(c, '#4fd1b5', 8, 10, 6.5, 4.5);
  ellipse(c, '#b48cff', 8, 11, 2, 1.5); // swallowed mana core
  rect(c, '#e8fff9', 4, 7, 2, 2); // shine
  rect(c, '#13302a', 6, 9, 1, 2); // eyes
  rect(c, '#13302a', 10, 9, 1, 2);
}

function drawElder(c: Ctx): void {
  rect(c, '#8b5a2b', 13, 2, 1, 14); // staff
  circle(c, '#8fe3ff', 13.5, 2, 2); // orb
  rect(c, '#4f3778', 5, 1, 6, 5); // hood
  rect(c, '#f1c27d', 6, 4, 4, 2); // face
  rect(c, '#6a4c9c', 4, 7, 8, 7); // robe
  rect(c, '#6a4c9c', 3, 12, 10, 3);
  rect(c, '#e8e8e8', 6, 6, 4, 4); // beard
  rect(c, '#222222', 7, 4, 1, 1);
  rect(c, '#222222', 9, 4, 1, 1);
}

/** Crescent pointing right (angle 0); rotated to the attack direction. */
function drawSlash(c: Ctx): void {
  c.strokeStyle = 'rgba(255,255,255,0.95)';
  c.lineWidth = 3;
  c.beginPath();
  c.arc(2, 8, 10, -1.1, 1.1);
  c.stroke();
  c.strokeStyle = 'rgba(180,220,255,0.8)';
  c.lineWidth = 1;
  c.beginPath();
  c.arc(1, 8, 12, -0.9, 0.9);
  c.stroke();
}

const HEART = ['.XX...XX.', 'XXXX.XXXX', 'XXXXXXXXX', 'XXXXXXXXX', '.XXXXXXX.', '..XXXXX..', '...XXX...', '....X....'];

function drawHeart(c: Ctx, fill: string, shine: string): void {
  HEART.forEach((row, y) => [...row].forEach((ch, x) => ch === 'X' && rect(c, fill, x, y)));
  rect(c, shine, 1, 1, 2, 1);
}
