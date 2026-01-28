import { Component } from '@angular/core';
import { MatDialogRef, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';

import type { Room } from '../../types';
import { environment } from '../../environments/environment';

@Component({
    selector: 'join-room-dialog',
    standalone: true,
    imports: [MatFormFieldModule, MatInputModule, MatButtonModule, ReactiveFormsModule, MatDialogContent, MatDialogActions],
    template: `
    <h2 mat-dialog-title>Ingresar código de sala</h2>
    <mat-dialog-content>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Código</mat-label>
        <input matInput [formControl]="codeControl" placeholder="Ej: 123456">
        @if (codeControl.hasError('required')) {
            <mat-error>
                El código es obligatorio
            </mat-error>
        }
        @if (codeControl.hasError('pattern')) {
            <mat-error>
                Debe ser una cadena de 6 dígitos
            </mat-error>
        }
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button class="btn-dialog" mat-button (click)="close()">Cancelar</button>
      <button class="btn-dialog" mat-raised-button color="primary" [disabled]="codeControl.invalid" (click)="join()">
        Unirse
      </button>
    </mat-dialog-actions>
  `,
})
export class JoinRoomDialog {
  http = inject(HttpClient);
  router = inject(Router);
  codeControl = new FormControl('', [Validators.required, Validators.pattern(/^[A-Za-z0-9]{6}$/)]);

  private apiUrl = environment.apiUrl;

  constructor(private dialogRef: MatDialogRef<JoinRoomDialog>) { }

  close() {
    this.dialogRef.close();
  }

  async join() {
    if (!localStorage.getItem('name')) {
      alert('Debe ingresar un nombre para unir la sala');
      return;
    }
    if (this.codeControl.valid) {
      try {
        const response = await firstValueFrom(this.http.get<Room>(`${this.apiUrl}/hall/${this.codeControl.value}`, {
          params: {
            name: localStorage.getItem('name') || ''
          }
        }));

        console.log(response);

        this.dialogRef.close(this.codeControl.value);
        this.router.navigate(['/hall'], { state: { code: response['code'], players: response['players'] } });
      } catch (error) {
        alert('Error al unirse a la sala');
      } finally {
        this.dialogRef.close(this.codeControl.value);
      }
    } else {
      alert('Debe ingresar un código válido');
    }
  }
}