import { Component, Inject } from '@angular/core';
import { MatDialogRef, MatDialogContent, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { SignalRService } from '../../services/signalr.service';
import { FormComponent } from '../../components/form.component';

@Component({
  selector: 'join-room-dialog',
  standalone: true,
  imports: [MatDialogContent, FormComponent],
  template: `
    <h2 mat-dialog-title>Ingresar código de sala</h2>
    <mat-dialog-content>
      <app-form
        [fields]="formFields"
        [buttons]="formButtons"
        (buttonClick)="handleButtonClick($event)"
        (formChange)="onFormChange($event)"
      ></app-form>
    </mat-dialog-content>
  `,
})
export class JoinRoomDialog {
  router = inject(Router);

  formFields = [
    {
      control: 'controlCode',
      label: 'Código de sala',
      validators: ['required', { name: 'pattern', args: /^[A-Za-z0-9]{6}$/ }],
      class: 'full-width'
    },
  ];
  formButtons = [
    { action: 'close', text: 'Cancelar', disabled: false, class: 'btn-dialog' },
    { action: 'join', text: 'Unirse', disabled: true, class: 'btn-dialog' },
  ];

  constructor(
    private signalRService: SignalRService,
    @Inject(MAT_DIALOG_DATA) public data: { name: string },
    private dialogRef: MatDialogRef<JoinRoomDialog>,
  ) {}

  ngOnInit() {
    this.signalRService.onEnterRoom((code) => {
      this.router.navigate(['/hall'], { queryParams: { code, name: this.data.name } });
    });
  }

  formValue: any = {};
  formValid = false;

  onFormChange(event: { value: any; valid: boolean }) {
    this.formValue = event.value;
    this.formValid = event.valid;

    this.formButtons[1] = { ...this.formButtons[1], disabled: !this.formValue.controlCode };
  }

  handleButtonClick(event: { action: string, formValue: any }) {
    if (event.action == 'close') {
      this.close();
    } else if (event.action == 'join') {
      this.join(event.formValue.controlCode);
    }
  }

  close() {
    this.dialogRef.close();
  }

  async join(code: string) {
    if (code) {
      try {
        if (!this.data.name) {
          alert('Debe ingresar un nombre');
          return;
        }
        if (!code) {
          alert('Debe ingresar un código');
          return;
        }
        this.signalRService.onJoinRoom(code, this.data.name);
      } catch (error) {
        alert('Error al unirse a la sala');
      } finally {
        this.dialogRef.close(code);
      }
    } else {
      alert('Debe ingresar un código válido');
    }
  }
}
