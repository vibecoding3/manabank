/** Minimal hit-point container shared by the player and enemies. */
export class Health {
  current: number;

  constructor(public max: number) {
    this.current = max;
  }

  get dead(): boolean {
    return this.current <= 0;
  }

  damage(amount: number): number {
    this.current = Math.max(0, this.current - amount);
    return this.current;
  }

  heal(amount: number): number {
    this.current = Math.min(this.max, this.current + amount);
    return this.current;
  }
}
