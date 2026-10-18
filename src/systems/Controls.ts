import Phaser from 'phaser';

type KeyName = 'W' | 'A' | 'S' | 'D' | 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'SPACE' | 'J' | 'E' | 'ENTER' | 'R';

/** Keyboard bindings. Read the "pressed" methods once per frame: they consume the just-down state. */
export class Controls {
  private keys: Record<KeyName, Phaser.Input.Keyboard.Key>;
  private readonly dir = new Phaser.Math.Vector2();

  constructor(scene: Phaser.Scene) {
    this.keys = scene.input.keyboard!.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,SPACE,J,E,ENTER,R') as Record<
      KeyName,
      Phaser.Input.Keyboard.Key
    >;
  }

  /** Normalized movement direction (zero vector when idle). */
  direction(): Phaser.Math.Vector2 {
    const k = this.keys;
    const x = Number(k.D.isDown || k.RIGHT.isDown) - Number(k.A.isDown || k.LEFT.isDown);
    const y = Number(k.S.isDown || k.DOWN.isDown) - Number(k.W.isDown || k.UP.isDown);
    return this.dir.set(x, y).normalize();
  }

  attackPressed(): boolean {
    return this.justDown('SPACE') || this.justDown('J');
  }

  interactPressed(): boolean {
    return this.justDown('E') || this.justDown('ENTER');
  }

  restartPressed(): boolean {
    return this.justDown('R');
  }

  private justDown(name: KeyName): boolean {
    return Phaser.Input.Keyboard.JustDown(this.keys[name]);
  }
}
