import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSelectModule, MatSelectChange } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule, MatRadioChange } from '@angular/material/radio';
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
  imports: [CommonModule, MatSelectModule, MatButtonModule, MatIconModule, MatRadioModule],
  styleUrl: './hall.css',
})
export class Hall {
  http = inject(HttpClient);
  router = inject(Router);

  code = signal('');
  name = signal('');
  noAdmin = signal(true);

  categories: string[] = [];
  selectedNumberImpostors = signal(0);
  selectedCategory = signal('dibujos animados');
  virtualVoting = signal(false);
  clue = signal(false);

  players = signal<{name: string, isAdmin: boolean, state: boolean, isImpostor: boolean, role: string, urlImage: string}[]>([]);
  deletingPlayer = signal<string>('');

  private apiUrl = environment.apiUrl;

  constructor(private signalRService: SignalRService) {}

  async ngOnInit() {
    const queryParams = this.router.parseUrl(this.router.url).queryParams;

    if (!queryParams['code'] || !queryParams['name']) {
      alert("Debe ingresar desde el home.");
      this.router.navigate(['/']);
      return;
    }

    await this.signalRService.reconnect(queryParams['code'], queryParams['name']);

    this.code.set(queryParams['code']);
    this.name.set(queryParams['name']);

    this.signalRService.onGameStarted((role) => {
      if (role) {
        this.router.navigate(['/game'], { queryParams: {
          code: queryParams['code'],
          name: queryParams['name'],
        }});
      } else {
        alert('Ups algo ha salido mal.');
        this.router.navigate(['/']);
      }
    });

    this.signalRService.onReceivePlayers((players) => {
      this.players.set(players);
      if (players.filter((player) => player.name == this.name())[0].isAdmin) {
        this.noAdmin.set(false);
      } else {
        this.noAdmin.set(true);
      }
    })

    this.signalRService.onGoHome(() => {
      this.router.navigate(['/']);
    })

    this.signalRService.onReceiveConfiguration((config, value) => {
      if (config == "category") {
        this.selectedCategory.set(value as string);
      } else if (config == "numberImpostors") {
        this.selectedNumberImpostors.set(value as number);
      } else if (config == "virtualVoting") {
        this.virtualVoting.set(value as boolean);
      } else if (config == "clue") {
        this.clue.set(value as boolean);
      }
    })

    if (this.noAdmin()) {
      this.signalRService.onChargeConfiguration(this.code(), this.name());
    }
    const categoriesResponse = await firstValueFrom(
      this.http.get<string[]>(`${this.apiUrl}/category`),
    );
    if (categoriesResponse) {
      this.categories = categoriesResponse;
    }

    this.signalRService.onUpdatePlayers(this.code(), this.name());
  }

  onChangeCategory(event: MatSelectChange) {
    const value = event.value;
    this.selectedCategory.set(value);
    this.signalRService.onUpdateConfiguration(this.code(), "category", value);
  }

  onChangeNumberImpostors(event: MatSelectChange) {
    const value = Number(event.value);
    this.selectedNumberImpostors.set(value);
    this.signalRService.onUpdateConfiguration(this.code(), "numberImpostors", value);
  }

  onChangeVirtualVoting(event: MatRadioChange) {
    this.virtualVoting.set(event.value);
    this.signalRService.onUpdateConfiguration(this.code(), "virtualVoting", event.value);
  }

  onChangeClue(event: MatRadioChange) {
    this.clue.set(event.value);
    this.signalRService.onUpdateConfiguration(this.code(), "clue", event.value);
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
      this.signalRService.onLeaveRoom(this.code(), this.name());
    } catch (error) {
      console.error('Error al salir de la sala:', error);
    }
  }

  startGame() {
    if (this.selectedNumberImpostors() === 0) {
      alert('Debes seleccionar un número de impostores');
      return;
    }
    if (this.players().length <= this.selectedNumberImpostors() + 1) {
      alert('No hay suficientes jugadores para el número de impostores seleccionado');
      return;
    }
    this.signalRService.startGame(
      this.code(),
      this.selectedNumberImpostors(),
      this.selectedCategory(),
    );
  }

  deletePlayer(playerName: string) {
    if (!this.noAdmin()) {
      this.deletingPlayer.set('');
      this.signalRService.onLeaveRoom(this.code(), playerName);
    }
  }

  changeDeletingPlayer(value: string) {
    if (!this.noAdmin()) {
      this.deletingPlayer.set(value);
    }
  }
}
