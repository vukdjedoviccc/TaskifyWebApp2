import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-overlay',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-xl shadow-lg text-center">
        <div class="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p class="mt-4 text-gray-700">{{ message() }}</p>
      </div>
    </div>
  `
})
export class LoadingOverlayComponent {
  message = input<string>('Učitavanje...');
}
