import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { JoinRoomDialog } from '../joinRoomDialog/joinRoomDialog';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { SignalRService } from '../../services/signalr.service';

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
  router = inject(Router);
  nameControl = new FormControl('', Validators.required);
  
  constructor(
    private signalRService: SignalRService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.signalRService.onEnterRoom((code: string) => {
      this.router.navigate(['/hall'], { queryParams: { code, name: this.nameControl.value } });
    })
  }

  createRoom() {
    if (this.nameControl.value && this.nameControl.valid) {
      try {
        this.signalRService.onCreateRoom(this.nameControl.value);
      } catch (error) {
        console.error('Error al crear la sala:', error);
      }
    }
  }

  joinRoom() {
    if (this.nameControl.valid && this.nameControl.value) {
      this.dialog.open(JoinRoomDialog, {
        width: '400px',
        data: {
          name: this.nameControl.value,
        },
      });
    }
  }
}
