import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SignalRService } from '../../services/signalr.service';

import { environment } from '../../environments/environment';

@Component({
  selector: 'game',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  template: `
    <section class="center">
      <button mat-icon-button aria-label="Volver atrás" (click)="goBack()" class="btn-fixed">
        <mat-icon>arrow_back</mat-icon>
      </button>
      <h1>{{ role() }}</h1>
      <img [src]="urlImage()" alt="Imagen de item de juego" height="300" width="400">
      <button mat-raised-button color="primary" class="btn" [disabled]="noAdmin()" (click)="startGame()">Siguiente ronda</button>
      <button mat-raised-button color="accent" class="btn" [disabled]="noAdmin()" (click)="goToHall()">Volver a la sala</button>
    </section>
  `,
})
export class Game {
  http = inject(HttpClient);
  router = inject(Router);
  role = signal<string>('');
  urlImage = signal<string>('https://i.ytimg.com/vi/xx4f21XaIA8/maxresdefault.jpg');
  code = signal<string>('');
  noAdmin = signal<boolean>(false);
  selectedNumberImpostors = signal<number>(0);
  selectedCategory = signal<string>('');
  fromGame = false;

  private apiUrl = environment.apiUrl;

  constructor(private signalRService: SignalRService) {}

  ngOnInit() {
    const state = history.state as { role: string, urlImage: string, code: string, noAdmin: boolean, selectedNumberImpostors: number, selectedCategory: string };
    if (!state.role) {
      this.router.navigate(['/']);
    } else {
      this.role.set(state.role);
      this.code.set(state.code);
      this.noAdmin.set(state.noAdmin); 
      this.selectedNumberImpostors.set(state.selectedNumberImpostors);
      this.selectedCategory.set(state.selectedCategory);
      if (state.role != "Impostor") {
        this.urlImage.set(state.urlImage);
      }
    }

    this.signalRService.onGameStarted((role, urlImage) => {
      if (role) {
        this.role.set(role);
        if (role != "Impostor") {
          this.urlImage.set(urlImage);
        } else {
          this.urlImage.set('https://i.ytimg.com/vi/xx4f21XaIA8/maxresdefault.jpg');
        }
      } else {
        alert('Ups algo ha salido mal.');
        this.router.navigate(['/']);
      }
    });

    this.signalRService.onGameEnded((code) => {
      if (code == this.code()) {
        this.fromGame = true;
        this.router.navigate(['/hall'], { state: { code: this.code(), fromGame: true } });
      }
    });
  }

  async ngOnDestroy() {
    if (!this.fromGame) {
      await this.goBack();
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
    this.signalRService.startGame(
      this.code(),
      this.selectedNumberImpostors(),
      this.selectedCategory(),
    );
  }

  goToHall() {
    this.signalRService.goToHall(this.code());
  }
}
