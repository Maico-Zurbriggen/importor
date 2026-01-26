import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { JoinRoomDialog } from '../joinRoomDialog/joinRoomDialog';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import type { Room } from '../../types';
import { environment } from '../../environments/environment';

@Component({
  selector: 'home',
  standalone: true,
  imports: [
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatDialogModule,
  ],
  templateUrl: './home.component.html',
})
export class Home {
  http = inject(HttpClient);
  router = inject(Router);
  nameControl = new FormControl('', Validators.required);
  
  private apiUrl = environment.apiUrl;

  async createRoom() {
    if (this.nameControl.value && this.nameControl.valid) {
      localStorage.setItem('adminName', this.nameControl.value);

      try {
        const response: Room = await firstValueFrom(
          this.http.post<Room>(`${this.apiUrl}/hall`, {
            adminName: this.nameControl.value,
          }),
        );

        this.router.navigate(['/hall'], { state: { code: response['code'], players: response.players } });
      } catch (error) {
        console.error('Error al crear la sala:', error);
      }
    }
  }

  constructor(private dialog: MatDialog) {}
  joinRoom() {
    if (this.nameControl.valid && this.nameControl.value) {
      localStorage.setItem('name', this.nameControl.value);
      this.dialog.open(JoinRoomDialog, {
        width: '400px',
        data: {
          name: this.nameControl.value,
        },
      });
    }
  }
}
