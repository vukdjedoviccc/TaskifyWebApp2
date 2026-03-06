// ============================================================================
// TASKIFY - Notification Models
// ============================================================================

export type NotificationType = 'TASK_ASSIGNED' | 'MEMBER_ADDED' | 'TASK_DUE_SOON' | 'TASK_OVERDUE';

export interface Notification {
  id: number;
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface NotificationListResponse {
  items: Notification[];
  unreadCount: number;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
