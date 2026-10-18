/** Central tuning values. Keep gameplay numbers here so balancing doesn't require hunting through classes. */

export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;
export const TILE = 16;
export const WORLD_ZOOM = 2;

export const PLAYER = {
  speed: 90,
  maxHp: 5,
  attackDamage: 1,
  attackCooldownMs: 350,
  attackReach: 10,
  attackSize: 24,
  invulnerableMs: 1300,
  knockback: 180,
};

export const SLIME = {
  maxHp: 4,
  wanderSpeed: 30,
  chaseSpeed: 52,
  contactDamage: 1,
  aggroRange: 110,
  leashRange: 190,
  knockback: 220,
  hurtMs: 220,
};

export const INTERACT_RANGE = 26;

/** Tile indices in the generated `tiles` tileset texture (BootScene). */
export const Tiles = {
  GRASS: 0,
  FLOWERS: 1,
  PATH: 2,
  WATER: 3,
  TREE: 4,
  ROCK: 5,
} as const;

export const SOLID_TILES = [Tiles.WATER, Tiles.TREE, Tiles.ROCK];

/** Keys used in the game registry; the HUD renders whatever is stored here. */
export const HudKey = {
  HP: 'hp',
  MAX_HP: 'maxHp',
  OBJECTIVE: 'objective',
  PROMPT: 'prompt',
  DIALOGUE: 'dialogue',
  GAME_OVER: 'gameOver',
} as const;

export interface DialogueView {
  speaker: string;
  text: string;
}
