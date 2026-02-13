import { Component, Inject } from '@angular/core';
import { MatDialogRef, MatDialogContent, MatDialogActions, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { SignalRService } from '../../services/signalr.service';

@Component({
    selector: 'join-room-dialog',
    standalone: true,
    imports: [MatFormFieldModule, MatInputModule, MatButtonModule, ReactiveFormsModule, MatDialogContent, MatDialogActions],
    templateUrl: './joinRoomDialog.component.html',
})
export class JoinRoomDialog {
  router = inject(Router);
  codeControl = new FormControl('', [Validators.required, Validators.pattern(/^[A-Za-z0-9]{6}$/)]);

  constructor(
    private signalRService: SignalRService,
    @Inject(MAT_DIALOG_DATA) public data: { name: string },
    private dialogRef: MatDialogRef<JoinRoomDialog>
  ) { }

  ngOnInit() {
    this.signalRService.onEnterRoom((code) => {
      this.router.navigate(['/hall'], { queryParams: { code, name: this.data.name } });
    })
  }

  close() {
    this.dialogRef.close();
  }

  async join() {
    if (this.codeControl.valid) {
      try {
        if (!this.data.name) {
          alert('Debe ingresar un nombre');
          return;
        }
        if (!this.codeControl.value) {
          alert('Debe ingresar un código');
          return;
        }
        this.signalRService.onJoinRoom(this.codeControl.value, this.data.name);
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