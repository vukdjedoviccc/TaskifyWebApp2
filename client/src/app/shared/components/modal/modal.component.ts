import { Component, input, output } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { featherX } from '@ng-icons/feather-icons';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [NgIconComponent],
  viewProviders: [provideIcons({ featherX })],
  template: `
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl w-full" [class]="maxWidth()">
        <div class="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">{{ title() }}</h2>
          <button (click)="closed.emit()" class="text-gray-400 hover:text-gray-600">
            <ng-icon name="featherX" class="text-xl" />
          </button>
        </div>
        <ng-content />
      </div>
    </div>
  `,
})
export class ModalComponent {
  title = input.required<string>();
  maxWidth = input<string>('max-w-md');
  closed = output<void>();
}
