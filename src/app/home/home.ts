import { Component, signal, inject } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { JoinRoomDialog } from '../joinRoomDialog/joinRoomDialog';
import { Router } from '@angular/router';
import { SignalRService } from '../../services/signalr.service';
import { FormComponent } from '../../components/form.component';

@Component({
  selector: 'home',
  standalone: true,
  imports: [MatDialogModule, FormComponent],
  template: `<app-form
    [fields]="formFields"
    [buttons]="formButtons"
    (buttonClick)="handleButtonClick($event)"
    (formChange)="onFormChange($event)"
  ></app-form>`,
})
export class Home {
  router = inject(Router);
  name = signal<string>('');

  formFields = [{ control: 'controlName', label: 'Nombre', validators: ['required'], class: 'field' }];
  formButtons = [
    { action: 'createRoom', text: 'Crear Sala', disabled: true, class: 'btn' },
    { action: 'joinRoom', text: 'Unirse a Sala', disabled: true, class: 'btn' },
  ];

  constructor(
    private signalRService: SignalRService,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.signalRService.onEnterRoom((code: string) => {
      this.router.navigate(['/hall'], { queryParams: { code, name: this.name() } });
    });
  }

  formValue: any = {};
  formValid = false;

  onFormChange(event: { value: any; valid: boolean }) {
    this.formValue = event.value;
    this.formValid = event.valid;

    this.formButtons = this.formButtons.map((btn) => {
      return { ...btn, disabled: !this.formValue.controlName };
    });
  }

  handleButtonClick(event: { action: string; formValue: any }) {
    this.name.set(event.formValue.controlName);
    if (event.action == 'createRoom') {
      this.createRoom(event.formValue.controlName);
    } else if (event.action == 'joinRoom') {
      this.joinRoom(event.formValue.controlName);
    }
  }

  createRoom(name: string) {
    try {
      this.signalRService.onCreateRoom(name);
    } catch (error) {
      console.error('Error al crear la sala:', error);
    }
  }

  joinRoom(name: string) {
    this.dialog.open(JoinRoomDialog, {
      width: '400px',
      data: {
        name,
      },
    });
  }
}
