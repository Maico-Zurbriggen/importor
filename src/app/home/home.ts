import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { JoinRoomDialog } from '../joinRoomDialog/joinRoomDialog';
import { Router } from '@angular/router';
import { inject } from '@angular/core';

@Component({
  selector: 'home',
  standalone: true,
  imports: [MatButtonModule, MatInputModule, MatFormFieldModule, ReactiveFormsModule, MatDialogModule],
  templateUrl: './home.component.html',
})
export class Home {
  router = inject(Router);
  nameControl = new FormControl('', Validators.required);

  createRoom() {
    if (this.nameControl.value && this.nameControl.valid) {
      localStorage.setItem('adminName', this.nameControl.value);
      this.router.navigate(['/hall']);
    }
  }

  constructor(private dialog: MatDialog){}
  joinRoom(){
    if(this.nameControl.valid) {
      this.dialog.open(JoinRoomDialog, {
        width: '400px',
        data: {
          name: this.nameControl.value
        }
      })
    }
  }
}
