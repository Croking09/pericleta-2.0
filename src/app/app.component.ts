import { CommonModule } from "@angular/common";
import { Component, ViewChild, computed, inject, signal } from "@angular/core";
import { PlayerPoolComponent } from "./components/player-pool/player-pool.component";
import { TeamColumnComponent } from "./components/team-column/team-column.component";
import {
  DrawReelComponent,
  ReelLockEvent,
} from "./components/draw-reel/draw-reel.component";
import { DraftService } from "./services/draft.service";

type TeamColor = "blue" | "red";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    CommonModule,
    PlayerPoolComponent,
    TeamColumnComponent,
    DrawReelComponent,
  ],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
})
export class AppComponent {
  protected readonly draft = inject(DraftService);

  @ViewChild("reel") private reelComponent!: DrawReelComponent;
  @ViewChild("blueColumn") private blueColumnComponent!: TeamColumnComponent;
  @ViewChild("redColumn") private redColumnComponent!: TeamColumnComponent;

  // True while the reel is spinning or a name is still flying to its team column.
  protected readonly isAnimating = signal(false);
  private pendingFlights = 0;

  protected readonly canInteract = computed(
    () => this.draft.canDraw() && !this.isAnimating(),
  );

  protected readonly canReset = computed(
    () => !this.isAnimating() && this.draft.hasStarted(),
  );

  onPoolChange(text: string): void {
    this.draft.setPoolText(text);
  }

  onDraw(): void {
    if (!this.canInteract()) return;

    this.draft.ensureStarted();
    const snapshot = this.draft.remainingSnapshot;
    const result = this.draft.drawNext();
    if (!result) return;

    this.isAnimating.set(true);
    this.reelComponent.play(result.blue, result.red, snapshot);
  }

  onBlueLocked(event: ReelLockEvent): void {
    this.pendingFlights++;
    const destination = this.blueColumnComponent.getNextSlotElement();
    this.flyToken(event.element, destination, event.name, "blue", () => {
      this.draft.commitBlue(event.name);
      this.onFlightDone();
    });
  }

  onRedLocked(event: ReelLockEvent): void {
    this.pendingFlights++;
    const destination = this.redColumnComponent.getNextSlotElement();
    this.flyToken(event.element, destination, event.name, "red", () => {
      this.draft.commitRed(event.name);
      this.onFlightDone();
    });
  }

  onReset(): void {
    this.isAnimating.set(false);
    this.pendingFlights = 0;
    this.reelComponent.reset();
    this.draft.reset();
  }

  private onFlightDone(): void {
    this.pendingFlights = Math.max(0, this.pendingFlights - 1);
    if (this.pendingFlights === 0) {
      this.isAnimating.set(false);
    }
  }

  /** Animates a cloned name flying from the reel to its team slot, FLIP-style. */
  private flyToken(
    sourceEl: HTMLElement,
    destEl: HTMLElement | null,
    name: string,
    color: TeamColor,
    onDone: () => void,
  ): void {
    if (!destEl) {
      onDone();
      return;
    }

    const sourceRect = sourceEl.getBoundingClientRect();
    const destRect = destEl.getBoundingClientRect();

    const token = document.createElement("span");
    token.textContent = name;
    token.className = `flying-token flying-token-${color}`;
    token.style.left = `${sourceRect.left}px`;
    token.style.top = `${sourceRect.top + sourceRect.height / 2 - 9}px`;
    document.body.appendChild(token);

    let settled = false;
    const cleanup = () => {
      if (settled) return;
      settled = true;
      token.remove();
      onDone();
    };

    requestAnimationFrame(() => {
      const dx = destRect.left - sourceRect.left;
      const dy =
        destRect.top +
        destRect.height / 2 -
        9 -
        (sourceRect.top + sourceRect.height / 2 - 9);
      token.style.transform = `translate(${dx}px, ${dy}px) scale(0.7)`;
      token.style.opacity = "0";
    });

    token.addEventListener("transitionend", cleanup, { once: true });
    setTimeout(cleanup, 650);
  }
}
