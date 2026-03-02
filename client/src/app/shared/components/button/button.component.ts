import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  template: `
    <button [type]="type()"
            [disabled]="disabled() || loading()"
            [class]="classes()">
      @if (loading()) {
        {{ loadingText() }}
      } @else {
        <ng-content />
      }
    </button>
  `,
})
export class ButtonComponent {
  variant = input<'primary' | 'secondary' | 'danger'>('primary');
  type = input<'button' | 'submit'>('button');
  disabled = input<boolean>(false);
  loading = input<boolean>(false);
  loadingText = input<string>('Loading...');
  fullWidth = input<boolean>(false);

  classes = computed(() => {
    const base = 'px-4 py-2 rounded-lg transition-colors font-semibold disabled:opacity-50 inline-flex items-center justify-center gap-2';
    const width = this.fullWidth() ? 'w-full' : '';

    const variants: Record<string, string> = {
      primary: 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-400',
      secondary: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
      danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400',
    };

    return `${base} ${width} ${variants[this.variant()]}`;
  });
}
