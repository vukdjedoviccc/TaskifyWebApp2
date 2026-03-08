import { Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [FormsModule],
  template: `
    @if (label()) {
      <label class="block text-sm font-medium text-gray-700 mb-1">{{ label() }}</label>
    }
    @if (rows() > 1) {
      <textarea [placeholder]="placeholder()"
                [required]="required()"
                [rows]="rows()"
                [ngModel]="value()"
                (ngModelChange)="value.set($event)"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none
                       focus:ring-2 focus:ring-indigo-500"></textarea>
    } @else {
      <input [type]="type()"
             [placeholder]="placeholder()"
             [required]="required()"
             [minlength]="minlength()"
             [ngModel]="value()"
             (ngModelChange)="value.set($event)"
             class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none
                    focus:ring-2 focus:ring-indigo-500" />
    }
  `,
})
export class InputComponent {
  label = input<string>('');
  type = input<'text' | 'email' | 'password' | 'date'>('text');
  placeholder = input<string>('');
  required = input<boolean>(false);
  minlength = input<number>(0);
  rows = input<number>(1);
  value = model<string | undefined>('');
}
