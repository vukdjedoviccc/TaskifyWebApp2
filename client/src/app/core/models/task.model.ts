// ============================================================================
// TASKIFY - Task Models (Minimalna verzija)
// 1 label po tasku (direktna relacija)
// ============================================================================

import { User } from './user.model';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Label {
  id: number;
  name: string;
  color: string;
  projectId: number;
  createdAt: string;
  _count?: {
    tasks: number;
  };
}

export interface TaskColumn {
  id: number;
  name: string;
  color: string;
  boardId?: number;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  columnId: number;
  position: number;
  priority: Priority;
  dueDate?: string;
  createdById: number;
  assigneeId?: number;
  labelId?: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: User;
  assignee?: User;
  label?: Label;
  column?: TaskColumn;
}

// DTOs
export interface CreateTaskDto {
  title: string;
  description?: string;
  columnId: number;
  priority?: Priority;
  dueDate?: string;
  assigneeId?: number | null;
  labelId?: number | null;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  priority?: Priority;
  dueDate?: string;
  assigneeId?: number | null;
  labelId?: number | null;
}

export interface MoveTaskDto {
  columnId: number;
  position: number;
}

export interface TaskFilters {
  columnId?: number;
  priority?: Priority;
  hasDueDate?: boolean;
  isOverdue?: boolean;
  q?: string;
}

export interface CreateLabelDto {
  name: string;
  color: string;
  projectId: number;
}

export interface UpdateLabelDto {
  name?: string;
  color?: string;
}
