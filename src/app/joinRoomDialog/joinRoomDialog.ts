import { Component } from '@angular/core';
import { MatDialogRef, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';

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
                Debe ser un número de 6 dígitos
            </mat-error>
        }
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="close()">Cancelar</button>
      <button mat-raised-button color="primary" [disabled]="codeControl.invalid" (click)="join()">
        Unirse
      </button>
    </mat-dialog-actions>
  `,
})
export class JoinRoomDialog {
    codeControl = new FormControl('', [Validators.required, Validators.pattern(/^\d{6}$/)]);

    constructor(private dialogRef: MatDialogRef<JoinRoomDialog>) { }

    close() {
        this.dialogRef.close();
    }

    join() {
        if (this.codeControl.valid) {
            this.dialogRef.close(this.codeControl.value);
        }
    }
}