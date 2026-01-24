import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SignalRService } from '../../services/signalr.service';

@Component({
  selector: 'game',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  template: `
    <div>
      <button mat-icon-button aria-label="Volver atrás" (click)="goBack()" class="btn-fixed">
        <mat-icon>arrow_back</mat-icon>
      </button>
      <h1>{{ role() }}</h1>
      <button mat-raised-button color="primary" class="btn" [disabled]="noAdmin()" (click)="startGame()">Siguiente ronda</button>
      <button mat-raised-button color="accent" class="btn" [disabled]="noAdmin()" (click)="goToHall()">Volver a la sala</button>
    </div>
  `,
})
export class Game {
  http = inject(HttpClient);
  router = inject(Router);
  state = history.state as { role: string, code: string, noAdmin: boolean, selectedNumberImpostors: number, selectedCategory: string };
  role = signal<string>('');
  code = signal<string>('');
  noAdmin = signal<boolean>(false);
  selectedNumberImpostors = signal<number>(0);
  selectedCategory = signal<string>('');

  constructor(private signalRService: SignalRService) {}

  ngOnInit() {
    if (!this.state.role) {
      this.router.navigate(['/']);
    } else {
      this.role.set(this.state.role);
      this.code.set(this.state.code);
      this.noAdmin.set(this.state.noAdmin); 
      this.selectedNumberImpostors.set(this.state.selectedNumberImpostors);
      this.selectedCategory.set(this.state.selectedCategory);
    }
  }

  async ngOnDestroy() {
    try {
      const response = await firstValueFrom(
        this.http.delete(`http://localhost:5261/api/hall/${this.code()}`, {
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

  async goBack() {
    try {
      const response = await firstValueFrom(
        this.http.delete(`http://localhost:5261/api/hall/${this.code()}`, {
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
