// ============================================================================
// TASKIFY - Boards Service
// ============================================================================

import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import {
  Board,
  Column,
  CreateBoardDto,
  UpdateBoardDto,
  CreateColumnDto,
  UpdateColumnDto,
  ReorderColumnsDto,
} from '../models';
import { tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BoardsService {
  private api = inject(ApiService);

  private _boards = signal<Board[]>([]);
  private _currentBoard = signal<Board | null>(null);
  private _loading = signal(false);

  readonly boards = this._boards.asReadonly();
  readonly currentBoard = this._currentBoard.asReadonly();
  readonly loading = this._loading.asReadonly();

  // ========== BOARDS ==========

  list(projectId: number) {
    this._loading.set(true);
    return this.api.get<Board[]>(`/projects/${projectId}/boards`).pipe(
      tap((boards) => {
        this._boards.set(boards);
        this._loading.set(false);
      })
    );
  }

  get(id: number) {
    this._loading.set(true);
    return this.api.get<Board>(`/boards/${id}`).pipe(
      tap((board) => {
        this._currentBoard.set(board);
        this._loading.set(false);
      })
    );
  }

  create(projectId: number, dto: CreateBoardDto) {
    return this.api.post<Board>(`/projects/${projectId}/boards`, dto).pipe(
      tap((board) => {
        this._boards.update((list) => [board, ...list]);
      })
    );
  }

  update(id: number, dto: UpdateBoardDto) {
    return this.api.put<Board>(`/boards/${id}`, dto).pipe(
      tap((updated) => {
        this._boards.update((list) =>
          list.map((b) => (b.id === id ? updated : b))
        );
        if (this._currentBoard()?.id === id) {
          this._currentBoard.set(updated);
        }
      })
    );
  }

  delete(id: number) {
    return this.api.delete<{ message: string }>(`/boards/${id}`).pipe(
      tap(() => {
        this._boards.update((list) => list.filter((b) => b.id !== id));
        if (this._currentBoard()?.id === id) {
          this._currentBoard.set(null);
        }
      })
    );
  }

  // ========== COLUMNS ==========

  listColumns(boardId: number) {
    return this.api.get<Column[]>(`/boards/${boardId}/columns`);
  }

  createColumn(boardId: number, dto: CreateColumnDto) {
    return this.api.post<Column>(`/boards/${boardId}/columns`, dto).pipe(
      tap((column) => {
        this._currentBoard.update((b) =>
          b ? { ...b, columns: [...(b.columns || []), column] } : null
        );
      })
    );
  }

  updateColumn(id: number, dto: UpdateColumnDto) {
    return this.api.put<Column>(`/columns/${id}`, dto).pipe(
      tap((updated) => {
        this._currentBoard.update((b) =>
          b
            ? {
                ...b,
                columns: b.columns?.map((c) => (c.id === id ? { ...c, ...updated } : c)),
              }
            : null
        );
      })
    );
  }

  deleteColumn(id: number) {
    return this.api.delete<{ message: string }>(`/columns/${id}`).pipe(
      tap(() => {
        this._currentBoard.update((b) =>
          b ? { ...b, columns: b.columns?.filter((c) => c.id !== id) } : null
        );
      })
    );
  }

  reorderColumns(boardId: number, dto: ReorderColumnsDto) {
    return this.api.patch<Column[]>(`/boards/${boardId}/columns/reorder`, dto).pipe(
      tap((columns) => {
        this._currentBoard.update((b) => (b ? { ...b, columns } : null));
      })
    );
  }

  // ========== HELPERS ==========

  updateColumnTasks(columnId: number, tasks: any[]) {
    this._currentBoard.update((b) => {
      if (!b) return null;
      return {
        ...b,
        columns: b.columns?.map((c) =>
          c.id === columnId ? { ...c, tasks } : c
        ),
      };
    });
  }

  clearCurrent() {
    this._currentBoard.set(null);
  }
}
