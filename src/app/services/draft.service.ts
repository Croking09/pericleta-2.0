import { Injectable, computed, signal } from "@angular/core";

export interface DrawResult {
  blue: string;
  red: string;
}

@Injectable({ providedIn: "root" })
export class DraftService {
  private readonly poolText = signal<string>("");
  private readonly remaining = signal<string[]>([]);
  private readonly started = signal(false);

  readonly blueTeam = signal<string[]>([]);
  readonly redTeam = signal<string[]>([]);

  readonly hasStarted = computed(() => this.started());

  readonly canDraw = computed(() => {
    if (!this.started()) {
      return this.parseNames(this.poolText()).length >= 2;
    }
    return this.remaining().length >= 2;
  });

  readonly isComplete = computed(
    () => this.started() && this.remaining().length === 0,
  );

  readonly hasLeftover = computed(
    () => this.started() && this.remaining().length === 1,
  );

  readonly hasProgress = computed(() => this.started());

  get remainingSnapshot(): string[] {
    return this.remaining();
  }

  setPoolText(text: string): void {
    this.poolText.set(text);
  }

  ensureStarted(): void {
    if (this.started()) return;
    const names = this.parseNames(this.poolText());
    this.remaining.set(this.shuffle(names));
    this.started.set(true);
  }

  /** Pulls the next pair out of the pool. Does NOT add them to the teams yet —
   *  call commitBlue/commitRed once the reel/flight animation actually lands. */
  drawNext(): DrawResult | null {
    this.ensureStarted();
    const pool = [...this.remaining()];
    if (pool.length < 2) return null;

    const blueName = pool.shift() as string;
    const redName = pool.shift() as string;
    this.remaining.set(pool);

    return { blue: blueName, red: redName };
  }

  commitBlue(name: string): void {
    this.blueTeam.update((team) => [...team, name]);
  }

  commitRed(name: string): void {
    this.redTeam.update((team) => [...team, name]);
  }

  reset(): void {
    this.remaining.set([]);
    this.blueTeam.set([]);
    this.redTeam.set([]);
    this.started.set(false);
  }

  private parseNames(text: string): string[] {
    return text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  }

  private shuffle(source: string[]): string[] {
    const copy = [...source];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
}
