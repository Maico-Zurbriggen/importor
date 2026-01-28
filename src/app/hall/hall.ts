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

import { environment } from '../../environments/environment';

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
  inGame = false;

  private apiUrl = environment.apiUrl;

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

    const state = history.state as {
      code: string;
      players: string[];
      fromGame: boolean | undefined;
    };

    this.signalRService.onPlayerJoined((playerName) => {
      console.log('Un jugador se ha unido: ' + playerName);
      this.signalRService.updatePlayers(this.code());
    });

    this.signalRService.onPlayerLeft((playerName) => {
      console.log('Un jugador se ha ido: ' + playerName);
      if (name === this.players()[1] && playerName === this.players()[0]) {
        this.noAdmin.set(false);
        localStorage.setItem('adminName', name);
        localStorage.removeItem('name');
      }
      this.players.update((players) => players.filter((p) => p !== playerName));
    });

    this.signalRService.onGameStarted((role, urlImage) => {
      if (role) {
        this.router.navigate(['/game'], {
          state: {
            role: role,
            urlImage: urlImage,
            code: this.code(),
            noAdmin: this.noAdmin(),
            selectedNumberImpostors: this.selectedNumberImpostors(),
            selectedCategory: this.selectedCategory(),
          },
        });
        this.inGame = true;
      } else {
        alert('Ups algo ha salido mal.');
        this.router.navigate(['/']);
      }
    });

    this.signalRService.onUpdatePlayers((players) => {
      this.players.set(players);
    })

    if (state) {
      this.code.set(state.code);
      this.players.set(state.players);
    }

    if (state.fromGame) {
      this.code.set(state.code);
      this.signalRService.updatePlayers(state.code);
    }

    const categoriesResponse = await firstValueFrom(
      this.http.get<string[]>(`${this.apiUrl}/category`),
    );
    if (categoriesResponse) {
      this.categories = categoriesResponse;
      this.selectedCategory.set(this.categories[0]);
    }

    setTimeout(() => {
      this.signalRService.onHallConnect(this.code(), name);
    }, 500);
  }

  async ngOnDestroy() {
    if (!this.inGame) {
      await this.goBack();
    }
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
    if (!localStorage.getItem('name') && !localStorage.getItem('adminName')) {
      return;
    }
    try {
      const response = await firstValueFrom(
        this.http.delete(`${this.apiUrl}/hall/${this.code()}`, {
          params: {
            name: localStorage.getItem('name') || localStorage.getItem('adminName') || '',
          },
        }),
      );
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
      alert('Debes seleccionar un número de impostores');
      return;
    }
    if (this.players().length < this.selectedNumberImpostors() + 1) {
      alert('No hay suficientes jugadores para el número de impostores seleccionado');
      return;
    }
    this.signalRService.startGame(
      this.code(),
      this.selectedNumberImpostors(),
      this.selectedCategory(),
    );
  }
}
