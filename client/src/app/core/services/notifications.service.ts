// ============================================================================
// TASKIFY - Notifications Service
// ============================================================================

import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { Notification, NotificationListResponse } from '../models';
import { tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private api = inject(ApiService);

  private _notifications = signal<Notification[]>([]);
  private _unreadCount = signal(0);
  private _loading = signal(false);

  readonly notifications = this._notifications.asReadonly();
  readonly unreadCount = this._unreadCount.asReadonly();
  readonly loading = this._loading.asReadonly();

  list(page = 1) {
    this._loading.set(true);
    return this.api.get<NotificationListResponse>('/notifications', { page, pageSize: 20 }).pipe(
      tap((res) => {
        this._notifications.set(res.items);
        this._unreadCount.set(res.unreadCount);
        this._loading.set(false);
      })
    );
  }

  markAsRead(id: number) {
    return this.api.patch<Notification>(`/notifications/${id}/read`, {}).pipe(
      tap(() => {
        this._notifications.update((list) =>
          list.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
        this._unreadCount.update((count) => Math.max(0, count - 1));
      })
    );
  }

  markAllAsRead() {
    return this.api.patch<{ message: string }>('/notifications/read-all', {}).pipe(
      tap(() => {
        this._notifications.update((list) =>
          list.map((n) => ({ ...n, isRead: true }))
        );
        this._unreadCount.set(0);
      })
    );
  }

  deleteNotification(id: number) {
    return this.api.delete<{ message: string }>(`/notifications/${id}`).pipe(
      tap(() => {
        const notification = this._notifications().find((n) => n.id === id);
        this._notifications.update((list) => list.filter((n) => n.id !== id));
        if (notification && !notification.isRead) {
          this._unreadCount.update((count) => Math.max(0, count - 1));
        }
      })
    );
  }
}
