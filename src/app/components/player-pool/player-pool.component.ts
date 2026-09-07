import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-player-pool',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './player-pool.component.html',
  styleUrl: './player-pool.component.scss',
})
export class PlayerPoolComponent implements OnInit {
  @Input() disabled = false;
  @Output() poolChange = new EventEmitter<string>();

  value = `Faker
Caps
Chovy
Rekkles
Zeus
Oner
Keria
BuLLDoG
Jankos`;

  ngOnInit(): void {
    this.emitChange();
  }

  emitChange(): void {
    this.poolChange.emit(this.value);
  }
}
