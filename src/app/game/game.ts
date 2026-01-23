import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

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
    </div>
  `,
})
export class Game {
  http = inject(HttpClient);
  router = inject(Router);
  state = history.state as { role: string, code: string };
  role = signal<string>('');
  code = signal<string>('');
  ngOnInit() {
    console.log(this.state.role);
    if (!this.state.role) {
      this.router.navigate(['/']);
    } else {
      this.role.set(this.state.role);
      this.code.set(this.state.code);
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
}
