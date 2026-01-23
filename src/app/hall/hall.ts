import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSelectModule, MatSelectChange } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { SignalRService } from '../../services/signalr.service';

import type { Room } from '../../types';

@Component({
  selector: 'hall',
  templateUrl: './hall.component.html',
  standalone: true,
  imports: [CommonModule, MatSelectModule, MatButtonModule, MatIconModule],
  styleUrl: './hall.css',
})
export class Hall {
  http = inject(HttpClient);
  router = inject(Router);
  code = signal('');
  noAdmin = signal(true);
  categories: string[] = [];
  selectedNumberImpostors = signal(0);
  selectedCategory = signal('');
  players = signal<string[]>([]);

  constructor(private signalRService: SignalRService) {}

  async ngOnInit() {
    var name = localStorage.getItem('name')
      ? localStorage.getItem('name') || ''
      : localStorage.getItem('adminName') || '';
    if (!name) {
      alert('No has ingresado un nombre');
      this.router.navigate(['/']);
    }
    this.noAdmin.set(!localStorage.getItem('adminName'));

    this.signalRService.startConnection();

    this.signalRService.onPlayerJoined((playerName) => {
      console.log('Jugador unido: ' + playerName);
      this.players.update((players) => {
        if (players.includes(playerName)) {
          return players;
        }
        return [...players, playerName];
      });
    });

    this.signalRService.onPlayerLeft((playerName) => {
      console.log('Jugador salido: ' + playerName);
      this.players.update((players) => players.filter((p) => p !== playerName));
    });

    this.signalRService.onGameStarted((role) => {
      console.log(role);
      if (role) {
        this.router.navigate(['/game'], { state: { role: role, code: this.code() } });
      } else {
        alert("Ups algo ha salido mal.");
        this.router.navigate(['/']);
      }
    })

    if (!this.noAdmin()) {
      try {
        const response: Room = await firstValueFrom(
          this.http.post<Room>('http://localhost:5261/api/hall', {
            adminName: name,
          }),
        );

        this.players.set(response.players);

        this.code.set(response['code']);
      } catch (error) {
        console.error('Error al crear la sala:', error);
      }
    } else {
      const state = history.state as { code: string; players: string[] };
      if (state) {
        this.code.set(state.code);
        this.players.set(state.players);
      }
    }

    const categoriesResponse = await firstValueFrom(
      this.http.get<string[]>('http://localhost:5261/api/category'),
    );
    if (categoriesResponse) {
      this.categories = categoriesResponse;
      this.selectedCategory.set(this.categories[0]);
    }

    setTimeout(() => {
      this.signalRService.onHallConnect(this.code(), name);
    }, 500);
  }

  onChangeCategory(event: MatSelectChange) {
    const value = event.value;
    this.selectedCategory.set(value);
  }

  onChangeNumberImpostors(event: MatSelectChange) {
    const value = Number(event.value);
    this.selectedNumberImpostors.set(value);
  }

  copyCode(event: Event) {
    const section = event.target as HTMLElement;
    const span = section.querySelector('.code') as HTMLElement;

    if (span) {
      const text = span.innerText;
      navigator.clipboard
        .writeText(text)
        .then(() => alert('Código copiado: ' + text))
        .catch(() => alert('Error al copiar el código'));
    }
  }

  async goBack() {
    try {
      const response = await firstValueFrom(
        this.http.delete(`http://localhost:5261/api/hall/${this.code()}`, {
          params: {
            name: localStorage.getItem('name') || localStorage.getItem('adminName') || '',
          },
        }),
      );
      console.log(response);
      if (response) {
        localStorage.removeItem('name');
        localStorage.removeItem('adminName');
        this.router.navigate(['/']);
      }
    } catch (error) {
      console.error('Error al salir de la sala:', error);
    }
  }

  startGame() {
    if (this.selectedNumberImpostors() === 0) {
      console.log(this.selectedNumberImpostors());
      alert('Debes seleccionar un número de impostores');
      return;
    }
    this.signalRService.startGame(
      this.code(),
      this.selectedNumberImpostors(),
      this.selectedCategory(),
    );
  }
}
