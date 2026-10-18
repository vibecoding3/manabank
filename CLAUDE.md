# Manabank: Phaser 3 + TypeScript + Vite 2D RPG (client-only)

## Commands
- `npm run check`: type check plus build, with errors only. Use this to verify changes.
- `npm run dev`: dev server at http://localhost:5173. `window.game` is exposed in dev only.

## Map (read only what the task needs)
- `src/config.ts`: all tuning numbers, tile indices, and `HudKey` registry keys.
- `src/scenes/GameScene.ts`: world, collisions, combat resolution, dialogue flow, and story flags.
- `src/scenes/UIScene.ts`: HUD. It only renders registry values that GameScene writes via `setHud`.
- `src/scenes/BootScene.ts`: runtime-drawn placeholder textures (`player`, `slime`, `elder`, `tiles`, ...).
- `src/entities/`: `Player` (move, `tryAttack` returns a hitbox, `takeHit`), `Slime` (AI states, emits `defeated`), `Npc`.
- `src/systems/`: `Controls` (call each `*Pressed()` once per frame), `Health`.
- `src/world/`: `level.ts` (seeded tile layout and spawns), `dialogue.ts` (scripts).

## Conventions
- Put new tunables in `config.ts`. New HUD values: add a `HudKey`, call `setHud`, and render it in `UIScene.render`.
- New enemies follow the `Slime` interface and are added to `GameScene.enemies`.
- Not implemented yet, by design: mana and magic debt, abilities, inventory, quests, progression.
- `node_modules/`, `dist/`, and `package-lock.json` are blocked by `.claude/settings.json`; don't try to read them.
