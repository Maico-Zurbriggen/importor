import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from "@angular/router";
import { MatIconModule } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import type { Room } from '../../types';

@Component({
  selector: 'hall',
  templateUrl: './hall.component.html',
  standalone: true,
  imports: [CommonModule, MatSelectModule, MatButtonModule, RouterLink, MatIconModule],
  styleUrl: './hall.css'
})
export class Hall {
  http = inject(HttpClient);
  code = signal("");
  players = signal([""]);
  categories = signal([""]);

  async ngOnInit() {
    if (localStorage.getItem('adminName')) {
      const adminName = localStorage.getItem('adminName');

      try {
        const response: Room = await firstValueFrom(this.http.post<Room>('http://localhost:5261/api/hall', {
          adminName: adminName
        }))

        this.code.set(response['code']);
        this.players.set([response['adminName']]);
      } catch (error) {
        console.error('Error al crear la sala:', error);
      }
    }
  }

  selectedCategory = signal("");
  selectedNumberImpostors = signal(0);

  onChangeCategory(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedCategory.set(value);
  }

  onChangeNumberImpostors(event: Event) {
    const value = Number((event.target as HTMLSelectElement).value);
    this.selectedNumberImpostors.set(value);
  }

  copyCode(event: Event) {
    const section = event.target as HTMLElement;
    const span = section.querySelector('.code') as HTMLElement;

    if (span) {
      const text = span.innerText;
      navigator.clipboard.writeText(text).
        then(() => alert('Código copiado: ' + text)).
        catch(() => alert('Error al copiar el código'));
    }
  }
}