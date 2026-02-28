// ============================================================================
// TASKIFY - Labels Service
// ============================================================================

import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { Label, CreateLabelDto, UpdateLabelDto } from '../models';
import { tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LabelsService {
  private api = inject(ApiService);

  private _labels = signal<Label[]>([]);
  private _loading = signal(false);

  readonly labels = this._labels.asReadonly();
  readonly loading = this._loading.asReadonly();

  list(projectId: number) {
    this._loading.set(true);
    return this.api.get<Label[]>('/labels', { projectId }).pipe(
      tap((labels) => {
        this._labels.set(labels);
        this._loading.set(false);
      })
    );
  }

  create(dto: CreateLabelDto) {
    return this.api.post<Label>('/labels', dto).pipe(
      tap((label) => {
        this._labels.update((list) => [...list, label]);
      })
    );
  }

  update(id: number, dto: UpdateLabelDto) {
    return this.api.put<Label>(`/labels/${id}`, dto).pipe(
      tap((updated) => {
        this._labels.update((list) =>
          list.map((l) => (l.id === id ? updated : l))
        );
      })
    );
  }

  delete(id: number, force = false) {
    const url = force ? `/labels/${id}?force=true` : `/labels/${id}`;
    return this.api.delete<{ message: string }>(`${url}`).pipe(
      tap(() => {
        this._labels.update((list) => list.filter((l) => l.id !== id));
      })
    );
  }
}
