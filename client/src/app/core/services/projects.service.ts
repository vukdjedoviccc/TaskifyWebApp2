// ============================================================================
// TASKIFY - Projects Service (Minimalna verzija)
// Bez member funkcionalnosti
// ============================================================================

import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import {
  Project,
  ProjectFilters,
  CreateProjectDto,
  UpdateProjectDto,
  PaginatedResponse,
} from '../models';
import { tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProjectsService {
  private api = inject(ApiService);

  private _projects = signal<Project[]>([]);
  private _currentProject = signal<Project | null>(null);
  private _loading = signal(false);
  private _pagination = signal({ page: 1, pageSize: 12, total: 0, totalPages: 0 });

  readonly projects = this._projects.asReadonly();
  readonly currentProject = this._currentProject.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly pagination = this._pagination.asReadonly();

  list(filters?: ProjectFilters) {
    this._loading.set(true);
    return this.api.get<PaginatedResponse<Project>>('/projects', filters).pipe(
      tap((res) => {
        this._projects.set(res.items);
        this._pagination.set({
          page: res.page,
          pageSize: res.pageSize,
          total: res.total,
          totalPages: res.totalPages,
        });
        this._loading.set(false);
      })
    );
  }

  get(id: number) {
    this._loading.set(true);
    return this.api.get<Project>(`/projects/${id}`).pipe(
      tap((project) => {
        this._currentProject.set(project);
        this._loading.set(false);
      })
    );
  }

  create(dto: CreateProjectDto) {
    return this.api.post<Project>('/projects', dto).pipe(
      tap((project) => {
        this._projects.update((list) => [project, ...list]);
      })
    );
  }

  update(id: number, dto: UpdateProjectDto) {
    return this.api.put<Project>(`/projects/${id}`, dto).pipe(
      tap((updated) => {
        this._projects.update((list) =>
          list.map((p) => (p.id === id ? updated : p))
        );
        if (this._currentProject()?.id === id) {
          this._currentProject.set(updated);
        }
      })
    );
  }

  delete(id: number) {
    return this.api.delete<{ message: string }>(`/projects/${id}`).pipe(
      tap(() => {
        this._projects.update((list) => list.filter((p) => p.id !== id));
        if (this._currentProject()?.id === id) {
          this._currentProject.set(null);
        }
      })
    );
  }

  clearCurrent() {
    this._currentProject.set(null);
  }
}
