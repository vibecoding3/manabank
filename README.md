# Manabank

A small single-player 2D fantasy RPG prototype built with Phaser 3, TypeScript and Vite. Client-side only.

## Run

```sh
npm install
npm run dev        # http://localhost:5173
npm run typecheck  # tsc --noEmit
npm run build      # type check + production build to dist/
npm run preview    # serve dist/
```

## Controls

| Action | Keys |
| --- | --- |
| Move | WASD / Arrow keys |
| Attack | Space / J |
| Talk / advance dialogue | E / Enter |
| Restart after death | R |

## Structure

```
src/
  main.ts            Phaser game config and scene list
  config.ts          Tuning constants, tile indices, HUD registry keys
  scenes/
    BootScene.ts     Generates all placeholder textures at runtime (no asset files)
    TitleScene.ts    Title screen and start button
    GameScene.ts     World, entities, collisions, combat, dialogue flow
    UIScene.ts       HUD overlay; renders values GameScene writes to the registry
  entities/          Player, Slime (enemy AI), Npc
  systems/           Controls (input bindings), Health
  world/             Seeded level layout, dialogue scripts
```

## Extension points

- **Art:** load real images in `BootScene` under the same texture keys (`player`, `slime`, `elder`, `tiles`, ...).
- **HUD:** add a `HudKey`, write it from `GameScene.setHud`, and render it in `UIScene.render`. Mana and magic-debt meters would go here.
- **Abilities:** `Player.tryAttack` returns a hitbox that `GameScene.resolveAttack` applies, and spells can follow the same pattern.
- **Enemies:** new types follow `Slime` (exposing `health`, `isDead`, `updateAI`, `takeHit`, and emitting `defeated`) and go into `GameScene.enemies`.
- **Quests and progression:** `GameScene.story` flags and `world/dialogue.ts` are the stand-ins for a quest system.
