import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, QueryList, ViewChildren } from '@angular/core';

@Component({
  selector: 'app-team-column',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './team-column.component.html',
  styleUrl: './team-column.component.scss',
})
export class TeamColumnComponent {
  @Input({ required: true }) color!: 'blue' | 'red';
  @Input({ required: true }) label!: string;
  @Input() players: string[] = [];
  @Input() maxSlots = 5;

  @ViewChildren('slotRef') private slotRefs!: QueryList<ElementRef<HTMLElement>>;

  get slots(): Array<string | null> {
    const slots: Array<string | null> = [...this.players];
    while (slots.length < this.maxSlots) {
      slots.push(null);
    }
    return slots;
  }

  slotIndex(index: number): string {
    return String(index + 1).padStart(2, '0');
  }

  /** DOM element of the next empty slot, used as the landing target for the flying name. */
  getNextSlotElement(): HTMLElement | null {
    const refs = this.slotRefs?.toArray() ?? [];
    const target = refs[this.players.length];
    return target ? target.nativeElement : null;
  }
}
