import Phaser from 'phaser';
import { TILE, Tiles } from '../config';

export interface Point {
  x: number;
  y: number;
}

export interface Level {
  tiles: number[][];
  playerSpawn: Point;
  npcSpawn: Point;
  enemySpawns: Point[];
}

const WIDTH = 48;
const HEIGHT = 34;

const toWorld = (tx: number, ty: number): Point => ({ x: tx * TILE + TILE / 2, y: ty * TILE + TILE / 2 });

/**
 * Builds the starting meadow: a village clearing in the west, a path east to the slime's meadow,
 * a pond to the north. Seeded RNG keeps the layout identical every run.
 */
export function buildLevel(): Level {
  const rng = new Phaser.Math.RandomDataGenerator(['manabank-meadow']);
  const tiles: number[][] = [];
  for (let y = 0; y < HEIGHT; y++) {
    tiles.push(Array.from({ length: WIDTH }, () => (rng.frac() < 0.07 ? Tiles.FLOWERS : Tiles.GRASS)));
  }

  const inBounds = (x: number, y: number) => x >= 0 && y >= 0 && x < WIDTH && y < HEIGHT;
  const set = (x: number, y: number, v: number) => {
    if (inBounds(x, y)) tiles[y][x] = v;
  };
  const ellipse = (cx: number, cy: number, rx: number, ry: number, v: number) => {
    for (let y = cy - ry; y <= cy + ry; y++) {
      for (let x = cx - rx; x <= cx + rx; x++) {
        if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1) set(x, y, v);
      }
    }
  };

  // Main east-west road and a branch north to the pond.
  for (let x = 3; x <= 41; x++) {
    set(x, 17, Tiles.PATH);
    set(x, 18, Tiles.PATH);
  }
  for (let y = 10; y <= 16; y++) {
    set(20, y, Tiles.PATH);
    set(21, y, Tiles.PATH);
  }

  ellipse(20, 6, 6, 3, Tiles.WATER);
  ellipse(9, 27, 3, 2, Tiles.WATER);
  ellipse(40, 28, 2, 2, Tiles.WATER);

  // Scatter trees and rocks, keeping the road, its shoulders, and key clearings open.
  const clearings = [
    { x: 7, y: 17, r: 5 }, // village / spawn
    { x: 35, y: 16, r: 7 }, // slime meadow
  ];
  const isPath = (x: number, y: number) => inBounds(x, y) && tiles[y][x] === Tiles.PATH;
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const t = tiles[y][x];
      if (t !== Tiles.GRASS && t !== Tiles.FLOWERS) continue;
      if (clearings.some((c) => Math.hypot(x - c.x, y - c.y) < c.r)) continue;
      if (isPath(x, y - 1) || isPath(x, y + 1) || isPath(x - 1, y) || isPath(x + 1, y)) continue;
      const roll = rng.frac();
      if (roll < 0.09) tiles[y][x] = Tiles.TREE;
      else if (roll < 0.11) tiles[y][x] = Tiles.ROCK;
    }
  }

  // Forest border, two tiles thick.
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      if (x < 2 || y < 2 || x >= WIDTH - 2 || y >= HEIGHT - 2) tiles[y][x] = Tiles.TREE;
    }
  }

  return {
    tiles,
    playerSpawn: toWorld(6, 18),
    npcSpawn: toWorld(9, 15),
    enemySpawns: [toWorld(35, 15)],
  };
}
