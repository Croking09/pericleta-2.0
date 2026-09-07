import { CommonModule } from "@angular/common";
import {
  Component,
  ElementRef,
  EventEmitter,
  OnDestroy,
  Output,
  ViewChild,
} from "@angular/core";
import { TacSoundService } from "../../services/tac-sound.service";

export interface ReelLockEvent {
  element: HTMLElement;
  name: string;
}

@Component({
  selector: "app-draw-reel",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./draw-reel.component.html",
  styleUrl: "./draw-reel.component.scss",
})
export class DrawReelComponent implements OnDestroy {
  @Output() blueLocked = new EventEmitter<ReelLockEvent>();
  @Output() redLocked = new EventEmitter<ReelLockEvent>();

  @ViewChild("blueNameEl") blueNameEl!: ElementRef<HTMLSpanElement>;
  @ViewChild("redNameEl") redNameEl!: ElementRef<HTMLSpanElement>;

  // Interval between reel ticks, in ms. Starts fast and decelerates
  // until the name "locks" on the last step.
  private readonly delays = [
    55, 60, 65, 75, 85, 100, 120, 145, 175, 215, 265, 330, 410, 510,
  ];
  private readonly timeouts: ReturnType<typeof setTimeout>[] = [];

  constructor(private readonly tacSound: TacSoundService) {}

  play(blueName: string, redName: string, flickerPool: string[]): void {
    this.clearTimeouts();
    this.runReel(
      this.blueNameEl.nativeElement,
      blueName,
      flickerPool,
      this.blueLocked,
    );
    this.runReel(
      this.redNameEl.nativeElement,
      redName,
      flickerPool,
      this.redLocked,
    );
  }

  reset(): void {
    this.clearTimeouts();
    this.resetName(this.blueNameEl.nativeElement);
    this.resetName(this.redNameEl.nativeElement);
  }

  ngOnDestroy(): void {
    this.clearTimeouts();
  }

  private resetName(element: HTMLElement): void {
    element.classList.remove("slide", "locked");
    element.textContent = "???";
  }

  private clearTimeouts(): void {
    this.timeouts.forEach((timeout) => clearTimeout(timeout));
    this.timeouts.length = 0;
  }

  private runReel(
    element: HTMLElement,
    finalName: string,
    flickerPool: string[],
    lockedEmitter: EventEmitter<ReelLockEvent>,
  ): void {
    const candidates = flickerPool.length ? flickerPool : [finalName];
    let step = 0;

    const tick = () => {
      const isLastStep = step === this.delays.length - 1;
      const nextName = isLastStep
        ? finalName
        : candidates[Math.floor(Math.random() * candidates.length)];

      this.renderTick(element, nextName, isLastStep);

      if (isLastStep) {
        lockedEmitter.emit({ element, name: finalName });
        return;
      }

      const delay = this.delays[step];
      step++;
      this.timeouts.push(setTimeout(tick, delay));
    };

    tick();
  }

  private renderTick(
    element: HTMLElement,
    name: string,
    locked: boolean,
  ): void {
    element.classList.remove("slide", "locked");
    // Force reflow so the slide-in animation restarts on every tick.
    void element.offsetWidth;
    element.textContent = name;
    element.classList.add(locked ? "locked" : "slide");
    this.tacSound.play();
  }
}
