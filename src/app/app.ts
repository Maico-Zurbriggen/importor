import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SignalRService } from '../services/signalr.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  standalone: true,
  template: `
  <main>
    <h1>Impostor</h1>
    <section class="center">
      <router-outlet />
    </section>
  </main>
  `,
})
export class App {
  constructor(private signalRService: SignalRService) {}

  ngOnInit() {
    this.signalRService.startConnection();
  }
}
