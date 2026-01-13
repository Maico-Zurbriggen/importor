import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'home',
  standalone: true,
  imports: [RouterLink, MatButtonModule],
  template: `
  <section class="center">
    <button routerLink="/hall" mat-raised-button color="primary" class="btn-home">Crear sala</button>
    <button mat-raised-button color="primary" class="btn-home">Unirse a sala</button>
  </section>
  `,
  styles: `
    .btn-home {
      margin: 0;
      padding: 12px 24px;
      text-transform: uppercase;
      width: 400px;
      height: 50px;
    }
  `,
})
export class Home {
}