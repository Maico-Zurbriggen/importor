import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule, FormControl, Validators, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [MatButtonModule, MatInputModule, MatFormFieldModule, ReactiveFormsModule],
  template: `
    <section class="center" [formGroup]="form">
      @for (field of fields; track field.control) {
        <mat-form-field class="field" appearance="outline">
          <mat-label class="label">{{ field.label }} </mat-label>
          <input type="{{ field.type || 'text' }}" matInput [formControlName]="field.control" />
        </mat-form-field>
      }

      @for (button of buttons; track button.text) {
        <button
          mat-raised-button
          color="primary"
          class="btn"
          (click)="onButtonClick(button)"
          [disabled]="button.disabled || !form.valid"
        >
          {{ button.text }}
        </button>
      }
    </section>
  `,
})
export class FormComponent {
  @Input() fields: { control: string, label: string, type?: string, validators: string[] }[] = [];
  @Input() buttons: { text: string, action: string, disabled: boolean }[] = [];

  @Output() buttonClick = new EventEmitter<{ action: string, formValue: any }>();
  @Output() formChange = new EventEmitter<{ value: any; valid: boolean }>();

  form!: FormGroup;

  ngOnInit() {
    const group: any = {};
    this.fields.forEach((field) => {
      group[field.control] = new FormControl(
        '',
        field.validators.map((validator) => {
          const validatorFn = (Validators as any)[validator];
          if (!validatorFn) {
            throw new Error(`Unknown validator: ${validator}`);
          }
          return validatorFn;
        }),
      );
    });
    this.form = new FormGroup(group);

    this.form.valueChanges.subscribe((value) => {
      this.formChange.emit({ value, valid: this.form.valid });
    });
  }

  onButtonClick(button: any) {
    this.buttonClick.emit({ action: button.action, formValue: this.form.value });
  }
}
