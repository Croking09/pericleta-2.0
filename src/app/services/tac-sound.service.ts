import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TacSoundService {
  private context?: AudioContext;

  play(): void {
    try {
      if (!this.context) {
        const AudioContextCtor =
          window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.context = new AudioContextCtor();
      }

      const ctx = this.context;
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();

      oscillator.type = 'square';
      oscillator.frequency.value = 1400;

      const now = ctx.currentTime;
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.05);
    } catch {
      // Web Audio not available in this environment; fail silently.
    }
  }
}
