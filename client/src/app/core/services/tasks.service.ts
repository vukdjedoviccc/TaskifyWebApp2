// ============================================================================
// TASKIFY - Tasks Service
// ============================================================================

import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import {
  Task,
  TaskFilters,
  CreateTaskDto,
  UpdateTaskDto,
  MoveTaskDto,
} from '../models';
import { tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TasksService {
  private api = inject(ApiService);

  private _currentTask = signal<Task | null>(null);
  private _loading = signal(false);

  readonly currentTask = this._currentTask.asReadonly();
  readonly loading = this._loading.asReadonly();

  // ========== TASKS ==========

  list(filters?: TaskFilters) {
    return this.api.get<Task[]>('/tasks', filters);
  }

  get(id: number) {
    this._loading.set(true);
    return this.api.get<Task>(`/tasks/${id}`).pipe(
      tap((task) => {
        this._currentTask.set(task);
        this._loading.set(false);
      })
    );
  }

  create(dto: CreateTaskDto) {
    return this.api.post<Task>('/tasks', dto);
  }

  update(id: number, dto: UpdateTaskDto) {
    return this.api.put<Task>(`/tasks/${id}`, dto).pipe(
      tap((updated) => {
        if (this._currentTask()?.id === id) {
          this._currentTask.set(updated);
        }
      })
    );
  }

  delete(id: number) {
    return this.api.delete<{ message: string }>(`/tasks/${id}`).pipe(
      tap(() => {
        if (this._currentTask()?.id === id) {
          this._currentTask.set(null);
        }
      })
    );
  }

  move(id: number, dto: MoveTaskDto) {
    return this.api.patch<Task>(`/tasks/${id}/move`, dto);
  }

  // ========== HELPERS ==========

  clearCurrent() {
    this._currentTask.set(null);
  }
}
