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
        <mat-form-field [class]="field.class || ''" appearance="outline">
          <mat-label class="label">{{ field.label }} </mat-label>
          <input type="{{ field.type || 'text' }}" matInput [formControlName]="field.control" />
        </mat-form-field>
      }

      @for (button of buttons; track button.text) {
        <button
          mat-raised-button
          color="primary"
          [class]="button.class"
          (click)="onButtonClick(button)"
          [disabled]="button.disabled ? !form.valid : false"
        >
          {{ button.text }}
        </button>
      }
    </section>
  `,
})
export class FormComponent {
  @Input() fields: {
    control: string;
    label: string;
    type?: string;
    validators: (string | { name: string; args?: any })[]
    class?: string;
  }[] = [];
  @Input() buttons: { text: string; action: string; disabled?: boolean; class?: string }[] = [];

  @Output() buttonClick = new EventEmitter<{ action: string; formValue: any }>();
  @Output() formChange = new EventEmitter<{ value: any; valid: boolean }>();

  form!: FormGroup;

  ngOnInit() {
    const group: any = {};
    this.fields.forEach((field) => {
      const validatorsFns = field.validators.map((validator) => {
        if (typeof validator === 'string') {
          const validatorFn = (Validators as any)[validator];
          if (!validatorFn) {
            throw new Error(`Unknown validator: ${validator}`);
          }
          return validatorFn;
        } else {
          const validatorFn = (Validators as any)[validator.name];
          if (!validatorFn) {
            throw new Error(`Unknown validator: ${validator.name}`);
          }
          return validatorFn(validator.args);
        }
      });

      group[field.control] = new FormControl('', validatorsFns);
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
